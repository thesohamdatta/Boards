
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker - using the CDN for simplicity in this setup, 
// but in production you might want to bundle the worker.
// Configure the worker - using the mjs version for modern builds (v3+)
// We use a fixed fallback version if the dynamic one fails, or standard unpkg structure
// For Vite, ensuring we point to the mjs worker is crucial for v5+
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function parseFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'txt':
        case 'md':
        case 'fountain':
        case 'fdx': // FDX is XML, we can treat as text for now or simple parse
            return await readTextFile(file);
        case 'pdf':
            return await readPdfFile(file);
        default:
            throw new Error(`Unsupported file type: .${extension}`);
    }
}

function readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

async function readPdfFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();

    try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Reconstruct page text attempting to preserve vertical layout
            let lastY = -1;
            let pageText = '';

            // textContent.items are typically in reading order
            for (const item of textContent.items as any[]) {
                if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
                    pageText += '\n';
                } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
                    pageText += ' ';
                }

                pageText += item.str;
                lastY = item.transform[5];
            }

            fullText += pageText + '\n\n';
        }

        return fullText;
    } catch (error) {
        console.error("Error parsing PDF:", error);
        throw new Error("Failed to parse PDF file. Ensure it is a text-based PDF, not scanned images.");
    }
}
