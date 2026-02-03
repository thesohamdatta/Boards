import { jsPDF } from 'jspdf';
import { default as autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Fountain } from 'fountain-js';
import { Project, Scene, Shot } from '@/types/storyboard';
import { toast } from 'sonner';

// Helper to save file in browser
async function saveFile(content: Blob | string | ArrayBuffer, defaultFilename: string) {
    const blob = content instanceof Blob ? content : new Blob([content]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Helper to convert remote/blob URL to base64 for jsPDF
async function getUrlBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// 1. Storyboard PDF Export
export async function exportStoryboardPDF(
    project: Project,
    scenes: Scene[],
    shots: Shot[],
    options: {
        layout: 'vertical' | 'horizontal' | 'large',
        includeMetadata: boolean
    }
) {
    const isLandscape = options.layout === 'horizontal';
    const doc = new jsPDF(isLandscape ? 'landscape' : 'portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let y = 20;
    let x = 15;

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(project.name.toUpperCase(), x, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`STORYBOARD PRESENTATION - ${new Date().toLocaleDateString()}`, x, y);
    y += 15;

    for (const scene of scenes) {
        const sceneShots = shots.filter(s => s.sceneId === scene.id);
        if (sceneShots.length === 0) continue;

        for (const shot of sceneShots) {
            // Check for new page
            const neededHeight = options.layout === 'large' ? 150 : 100;
            if (y + neededHeight > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }

            // Scene/Shot Header
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`SCENE ${scene.sceneNumber} / SHOT ${shot.shotNumber}`, x, y);
            y += 5;

            // Image
            if (shot.imageUrl) {
                try {
                    const imgBase64 = await getUrlBase64(shot.imageUrl);
                    const imgWidth = options.layout === 'large' ? pageWidth - 30 : 120;
                    const imgHeight = (imgWidth * 9) / 16; // 16:9
                    doc.addImage(imgBase64, 'JPEG', x, y, imgWidth, imgHeight);

                    if (options.layout === 'horizontal') {
                        // Metadata to the right
                        let metaX = x + imgWidth + 10;
                        let metaY = y + 5;
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'bold');
                        doc.text('TECHNICAL DETAILS', metaX, metaY);
                        metaY += 6;
                        doc.setFontSize(8);
                        doc.setFont('helvetica', 'normal');
                        doc.text(`SIZE: ${shot.shotSize}`, metaX, metaY);
                        metaY += 5;
                        doc.text(`ANGLE: ${shot.cameraAngle}`, metaX, metaY);
                        metaY += 5;
                        doc.text(`LENS: ${shot.focalLength}`, metaX, metaY);

                        metaY += 10;
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        doc.text('DESCRIPTION', metaX, metaY);
                        metaY += 5;
                        doc.setFont('helvetica', 'normal');
                        const splitText = doc.splitTextToSize(shot.description, pageWidth - metaX - 15);
                        doc.text(splitText, metaX, metaY);

                        y += imgHeight + 15;
                    } else {
                        // Metadata below
                        y += imgHeight + 8;
                        doc.setFontSize(8);
                        doc.setFont('helvetica', 'normal');
                        doc.text(`[${shot.shotSize}] - [${shot.cameraAngle}] - [${shot.movement}] - [${shot.focalLength}]`, x, y);
                        y += 6;
                        doc.setFontSize(9);
                        const splitText = doc.splitTextToSize(shot.description, pageWidth - 30);
                        doc.text(splitText, x, y);
                        y += (splitText.length * 5) + 15;
                    }
                } catch (e) {
                    doc.rect(x, y, 100, 56);
                    doc.text('Image failed to load', x + 5, y + 25);
                    y += 70;
                }
            } else {
                doc.rect(x, y, 100, 56);
                doc.text('NO IMAGE GENERATED', x + 5, y + 25);
                y += 70;
            }
        }
    }

    const pdfBlob = doc.output('blob');
    await saveFile(pdfBlob, `${project.name}_storyboard.pdf`);
}

// 2. Export as plain images (.png)
export async function exportStoryboardImages(project: Project, shots: Shot[]) {
    const zip = new JSZip();
    const folder = zip.folder(`${project.name}_panels`);

    if (!folder) return;

    for (const shot of shots) {
        if (shot.imageUrl) {
            try {
                const response = await fetch(shot.imageUrl);
                const blob = await response.blob();
                const filename = `S_${shot.shotNumber.toString().padStart(3, '0')}_${shot.shotSize}.png`;
                folder.file(filename, blob);
            } catch (e) {
                console.error(`Failed to add image ${shot.imageUrl} to zip`, e);
            }
        }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    await saveFile(content, `${project.name}_frames.zip`);
}

// 3. Shotlist Export (PDF & Excel)
export async function exportShotlistPDF(project: Project, scenes: Scene[], shots: Shot[]) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`SHOT LIST: ${project.name}`, 14, 20);

    const tableData = shots.map(shot => {
        const scene = scenes.find(s => s.id === shot.sceneId);
        return [
            shot.shotNumber,
            scene?.sceneNumber || '?',
            shot.shotSize,
            shot.focalLength,
            shot.movement,
            shot.description,
            `${shot.duration}s`
        ];
    });

    autoTable(doc, {
        startY: 30,
        head: [['#', 'Scene', 'Size', 'Lens', 'Movement', 'Description', 'Dur']],
        body: tableData,
    });

    await saveFile(doc.output('blob'), `${project.name}_shotlist.pdf`);
}

export async function exportShotlistExcel(project: Project, scenes: Scene[], shots: Shot[]) {
    const rows = shots.map(shot => {
        const scene = scenes.find(s => s.id === shot.sceneId);
        return {
            'Shot #': shot.shotNumber,
            'Scene #': scene?.sceneNumber || '?',
            'Size': shot.shotSize,
            'Angle': shot.cameraAngle,
            'Focal Length': shot.focalLength,
            'Movement': shot.movement,
            'Equipment': shot.equipment,
            'Description': shot.description,
            'Duration': `${shot.duration}s`
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shot List');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    await saveFile(new Blob([excelBuffer]), `${project.name}_shotlist.xlsx`);
}

// 4. Story Export (Breakdown & Screenplay)
export async function exportSceneBreakdownPDF(project: Project, scenes: Scene[]) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`SCENE BREAKDOWN: ${project.name}`, 14, 22);

    let y = 35;
    for (const scene of scenes) {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`SCENE ${scene.sceneNumber}: ${scene.location} - ${scene.lighting}`, 14, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitDesc = doc.splitTextToSize(scene.description, 180);
        doc.text(splitDesc, 14, y);
        y += (splitDesc.length * 5) + 12;
    }

    await saveFile(doc.output('blob'), `${project.name}_breakdown.pdf`);
}

export async function exportScreenplayPDF(project: Project) {
    if (!project.script_text) {
        toast.error('No script text found to export.');
        return;
    }

    const fountain = new Fountain();
    const parsed = fountain.parse(project.script_text);

    const doc = new jsPDF('portrait', 'in', 'letter');
    doc.setFont('courier', 'normal');
    doc.setFontSize(12);

    let y = 1.0;
    let page = 1;

    // Helper to add new page with number
    const checkPage = (height: number) => {
        if (y + height > 10.0) {
            doc.addPage();
            y = 1.0;
            page++;
            doc.setFont('courier', 'normal');
            doc.setFontSize(12);
            doc.text(`${page}.`, 7.5, 0.5, { align: 'right' });
        }
    };

    parsed.tokens.forEach((token: any) => {
        switch (token.type) {
            case 'scene_heading':
                checkPage(0.5);
                doc.setFont('courier', 'bold');
                doc.text(token.text.toUpperCase(), 1.5, y);
                y += 0.3;
                break;
            case 'action':
                checkPage(0.5);
                doc.setFont('courier', 'normal');
                const actionLines = doc.splitTextToSize(token.text, 6.0);
                doc.text(actionLines, 1.5, y);
                y += (actionLines.length * 0.16) + 0.2;
                break;
            case 'character':
                checkPage(0.4);
                doc.setFont('courier', 'normal');
                doc.text(token.text.toUpperCase(), 3.7, y);
                y += 0.16;
                break;
            case 'parenthetical':
                checkPage(0.3);
                doc.text(token.text, 3.2, y);
                y += 0.16;
                break;
            case 'dialogue':
                checkPage(0.4);
                const dialogueLines = doc.splitTextToSize(token.text, 3.5);
                doc.text(dialogueLines, 2.5, y);
                y += (dialogueLines.length * 0.16) + 0.2;
                break;
            case 'transition':
                checkPage(0.4);
                doc.text(token.text.toUpperCase(), 7.0, y, { align: 'right' });
                y += 0.3;
                break;
        }
    });

    await saveFile(doc.output('blob'), `${project.name}_screenplay.pdf`);
}

// 5. Animatic Export (XML & MP4 placeholder)
export async function exportAnimaticXML(project: Project, scenes: Scene[], shots: Shot[]) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
  <sequence>
    <name>${project.name} Animatic</name>
    <rate>
      <timebase>24</timebase>
    </rate>
    <media>
      <video>
        <track>\n`;

    let startFrame = 0;
    let clipId = 1;

    for (const scene of scenes) {
        const sceneShots = shots.filter(s => s.sceneId === scene.id);
        for (const shot of sceneShots) {
            const durationFrames = Math.round((shot.duration || 3) * 24);
            const endFrame = startFrame + durationFrames;

            xml += `          <clipitem id="clip-${clipId}">
            <name>SCENE ${scene.sceneNumber} SHOT ${shot.shotNumber}</name>
            <duration>${durationFrames}</duration>
            <start>${startFrame}</start>
            <end>${endFrame}</end>
            <file id="file-${clipId}">
              <pathurl>${shot.imageUrl || ''}</pathurl>
            </file>
          </clipitem>\n`;

            startFrame = endFrame;
            clipId++;
        }
    }

    xml += `        </track>
      </video>
    </media>
  </sequence>
</xmeml>`;

    await saveFile(new Blob([xml], { type: 'application/xml' }), `${project.name}_animatic.xml`);
}

export async function exportAnimaticMP4(project: Project, shots: Shot[], options: { includeAudio: boolean, includeDescription: boolean }) {
    toast.info('MP4 Export started. Please wait as this requires rendering frames...');

    // In a real production app, we would use FFmpeg.wasm here.
    // For this implementation, since FFmpeg.wasm is very complex to setup with Vite (COOP/COEP headers),
    // we will generate a timed slideshow PDF or a sequence of images.
    // However, I will implement a "Slideshow" download as a fallback.

    const doc = new jsPDF('landscape', 'mm', [1920 / 3.78, 1080 / 3.78]); // 1080p in mm

    for (const shot of shots) {
        if (shot.imageUrl) {
            try {
                const img = await getUrlBase64(shot.imageUrl);
                doc.addImage(img, 'JPEG', 0, 0, 508, 285.75);

                if (options.includeDescription) {
                    doc.setFillColor(0, 0, 0, 0.5);
                    doc.rect(0, 260, 508, 25.75, 'F');
                    doc.setFontSize(24);
                    doc.setTextColor(255, 255, 255);
                    doc.text(shot.description, 254, 275, { align: 'center' });
                }

                doc.addPage();
            } catch (e) { }
        }
    }

    // Remove last extra page
    doc.deletePage(doc.internal.getNumberOfPages());

    await saveFile(doc.output('blob'), `${project.name}_animatic_slideshow.pdf`);
    toast.success('Animatic Preview exported as Slideshow PDF (MP4 direct render requires FFmpeg server-side)');
}
