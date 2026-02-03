import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Layout,
    List,
    FileText,
    Play,
    Download,
    Check,
    X,
    FileJson,
    File as FileIcon,
    Image as ImageIcon,
    Video,
    FileCode,
    Sheet,
    Info,
    Smartphone,
    Monitor,
    Maximize,
    ChevronRight,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStoryboardStore } from '@/stores/storyboardStore';
import { toast } from 'sonner';
import {
    exportStoryboardPDF,
    exportStoryboardImages,
    exportShotlistPDF,
    exportShotlistExcel,
    exportSceneBreakdownPDF,
    exportScreenplayPDF,
    exportAnimaticXML,
    exportAnimaticMP4
} from '@/lib/exportUtils';

interface ExportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type ExportTab = 'storyboard' | 'shotlist' | 'story' | 'animatic';

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
    const [activeTab, setActiveTab] = useState<ExportTab>('storyboard');
    const { currentProject, scenes, shots } = useStoryboardStore();
    const [isExporting, setIsExporting] = useState(false);

    // Storyboard Options
    const [sbLayout, setSbLayout] = useState<'vertical' | 'horizontal' | 'large'>('horizontal');
    const [sbIncludeMore, setSbIncludeMore] = useState(false);
    const [sbFormat, setSbFormat] = useState<'pdf' | 'images'>('pdf');

    // Animatic Options
    const [animAudio, setAnimAudio] = useState(true);
    const [animDesc, setAnimDesc] = useState(false);
    const [animFormat, setAnimFormat] = useState<'mp4' | 'xml'>('mp4');

    const handleExport = async () => {
        if (!currentProject) {
            toast.error("No project loaded for export.");
            return;
        }

        setIsExporting(true);
        try {
            switch (activeTab) {
                case 'storyboard':
                    if (sbFormat === 'pdf') {
                        await exportStoryboardPDF(currentProject, scenes, shots, {
                            layout: sbLayout,
                            includeMetadata: sbIncludeMore
                        });
                    } else {
                        await exportStoryboardImages(currentProject, shots);
                    }
                    break;
                case 'shotlist':
                    // We can determine format based on click, but for simplicity we'll handle based on internal state if added
                    // In current UI, they are separate buttons in the same tab. I will update those buttons to call handleExport with params
                    break;
                case 'story':
                    // Same as shotlist, separate buttons
                    break;
                case 'animatic':
                    if (animFormat === 'mp4') {
                        await exportAnimaticMP4(currentProject, shots, {
                            includeAudio: animAudio,
                            includeDescription: animDesc
                        });
                    } else {
                        await exportAnimaticXML(currentProject, scenes, shots);
                    }
                    break;
            }
            toast.success(`Export complete!`);
            onOpenChange(false);
        } catch (error: any) {
            console.error("Export failed:", error);
            toast.error(`Export failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    // Special handlers for tab items with multiple action buttons
    const handleSpecificExport = async (type: string) => {
        if (!currentProject) return;
        setIsExporting(true);
        try {
            if (type === 'shotlist-pdf') await exportShotlistPDF(currentProject, scenes, shots);
            if (type === 'shotlist-excel') await exportShotlistExcel(currentProject, scenes, shots);
            if (type === 'story-breakdown') await exportSceneBreakdownPDF(currentProject, scenes);
            if (type === 'story-screenplay') await exportScreenplayPDF(currentProject);
            toast.success('Export successful');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(`Export failed: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const tabs = [
        { id: 'storyboard', label: 'Storyboard', icon: Layout },
        { id: 'shotlist', label: 'Shotlist', icon: List },
        { id: 'story', label: 'Story', icon: FileText },
        { id: 'animatic', label: 'Animatic', icon: Play },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-border/50 shadow-3 rounded-[var(--radius-xl)]">
                <div className="flex h-[600px]">
                    {/* Left Sidebar */}
                    <div className="w-[280px] border-r border-border/20 bg-muted/5 p-6 flex flex-col">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">Export</h2>
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-2 leading-relaxed">
                                Get everything you need from your Story with just a few clicks for previewing and pitching.
                            </p>
                        </div>

                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as ExportTab)}
                                    className={cn(
                                        'flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all',
                                        activeTab === tab.id
                                            ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                                            : 'text-muted-foreground/60 hover:bg-muted/30 hover:text-foreground'
                                    )}
                                >
                                    <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-muted-foreground/40")} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-auto p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="h-3 w-3 text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Pro Tip</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                                Share the project link directly for interactive presentations.
                            </p>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 flex flex-col bg-card">
                        <header className="px-8 py-6 border-b border-border/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40">Configuration</span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground/20" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">{activeTab === 'storyboard' ? 'Presentation Layout' : activeTab === 'shotlist' ? 'Data Extraction' : activeTab === 'story' ? 'Narrative Assets' : 'Motion Delivery'}</span>
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </header>

                        <ScrollArea className="flex-1 p-8">
                            {/* Render Tab Content Here */}
                            {activeTab === 'storyboard' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <div
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                                                sbFormat === 'pdf' ? "border-primary/20 bg-primary/5" : "border-border/10 bg-muted/5 hover:bg-muted/10"
                                            )}
                                            onClick={() => setSbFormat('pdf')}
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-white border border-border/20 flex items-center justify-center text-red-600 font-bold text-[10px]">PDF</div>
                                            <div className="flex-1">
                                                <h3 className="text-sm font-bold text-foreground">Export as PDF file</h3>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">High fidelity presentation format</p>
                                            </div>
                                            <div className={cn(
                                                "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                sbFormat === 'pdf' ? "border-primary" : "border-border/30"
                                            )}>
                                                {sbFormat === 'pdf' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                            </div>
                                        </div>

                                        {sbFormat === 'pdf' && (
                                            <div className="grid grid-cols-3 gap-3 pl-14 animate-in slide-in-from-top-2 duration-200">
                                                {[
                                                    { id: 'vertical', icon: Smartphone, label: 'Vertical' },
                                                    { id: 'horizontal', icon: Monitor, label: 'Horizontal' },
                                                    { id: 'large', icon: Maximize, label: 'Large Images' },
                                                ].map((layout) => (
                                                    <button
                                                        key={layout.id}
                                                        onClick={() => setSbLayout(layout.id as any)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest",
                                                            sbLayout === layout.id
                                                                ? "bg-primary/10 border-primary/30 text-primary"
                                                                : "bg-muted/10 border-border/10 text-muted-foreground/60 hover:bg-muted/20"
                                                        )}
                                                    >
                                                        <layout.icon className="h-4 w-4" />
                                                        {layout.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/20 bg-muted/5 ml-14">
                                            <div className="space-y-0.5">
                                                <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">Include technical metadata</h4>
                                                <p className="text-[10px] text-muted-foreground font-medium italic">Shot size, angle, movement, equipment</p>
                                            </div>
                                            <div
                                                className={cn(
                                                    "w-10 h-5 rounded-full transition-all cursor-pointer relative",
                                                    sbIncludeMore ? "bg-primary" : "bg-muted-foreground/20"
                                                )}
                                                onClick={() => setSbIncludeMore(!sbIncludeMore)}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-all",
                                                    sbIncludeMore && "translate-x-5"
                                                )} />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                                            sbFormat === 'images' ? "border-primary/20 bg-primary/5" : "border-border/10 bg-muted/5 hover:bg-muted/10"
                                        )}
                                        onClick={() => setSbFormat('images')}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-[10px]">PNG</div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-foreground">Export as plain images (.png)</h3>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Zip archive of individual panels</p>
                                        </div>
                                        <div className={cn(
                                            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                            sbFormat === 'images' ? "border-primary" : "border-border/30"
                                        )}>
                                            {sbFormat === 'images' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'shotlist' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div
                                        onClick={() => handleSpecificExport('shotlist-pdf')}
                                        className="flex items-center gap-4 p-5 rounded-2xl border border-border/30 bg-muted/5 hover:bg-muted/10 transition-all cursor-pointer group"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 font-bold text-[10px] group-hover:scale-110 transition-transform">PDF</div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Technical Shotlist PDF</h3>
                                            <p className="text-[10px] text-muted-foreground font-medium tracking-widest mt-1 uppercase">Production ready document</p>
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                            <Download className="h-4 w-4" />
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => handleSpecificExport('shotlist-excel')}
                                        className="flex items-center gap-4 p-5 rounded-2xl border border-border/30 bg-muted/5 hover:bg-muted/10 transition-all cursor-pointer group"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center text-green-600 font-bold text-[10px] group-hover:scale-110 transition-transform">XLSX</div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Scene Metadata Excel</h3>
                                            <p className="text-[10px] text-muted-foreground font-medium tracking-widest mt-1 uppercase">Import to scheduling software</p>
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                            <Download className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'story' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div
                                        onClick={() => handleSpecificExport('story-breakdown')}
                                        className="flex items-center gap-4 p-5 rounded-2xl border border-border/30 bg-muted/5 hover:bg-muted/10 transition-all cursor-pointer group"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-[10px] group-hover:scale-110 transition-transform">PDF</div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Scene Breakdown</h3>
                                            <p className="text-[10px] text-muted-foreground font-medium tracking-widest mt-1 uppercase">Narrative structure review</p>
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                            <Download className="h-4 w-4" />
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => handleSpecificExport('story-screenplay')}
                                        className="flex items-center gap-4 p-5 rounded-2xl border border-border/30 bg-muted/5 hover:bg-muted/10 transition-all cursor-pointer group"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 font-bold text-[10px] group-hover:scale-110 transition-transform">PDF</div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Screenplay PDF</h3>
                                            <p className="text-[10px] text-muted-foreground font-medium tracking-widest mt-1 uppercase">Industry standard format</p>
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                            <Download className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'animatic' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <div
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                                                animFormat === 'mp4' ? "border-primary/20 bg-primary/5" : "border-border/10 bg-muted/5 hover:bg-muted/10"
                                            )}
                                            onClick={() => setAnimFormat('mp4')}
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-[10px]">MP4</div>
                                            <div className="flex-1">
                                                <h3 className="text-sm font-bold text-foreground">Export as MP4 video</h3>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">High definition timing reel</p>
                                            </div>
                                            <div className={cn(
                                                "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                animFormat === 'mp4' ? "border-primary" : "border-border/30"
                                            )}>
                                                {animFormat === 'mp4' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                            </div>
                                        </div>

                                        {animFormat === 'mp4' && (
                                            <div className="grid grid-cols-2 gap-3 pl-14 animate-in slide-in-from-top-2 duration-200">
                                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/10 bg-muted/5">
                                                    <div
                                                        className={cn(
                                                            "w-8 h-4 rounded-full transition-all cursor-pointer relative",
                                                            animAudio ? "bg-primary" : "bg-muted-foreground/20"
                                                        )}
                                                        onClick={() => setAnimAudio(!animAudio)}
                                                    >
                                                        <div className={cn(
                                                            "absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-all",
                                                            animAudio && "translate-x-4"
                                                        )} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black uppercase text-foreground">Audio</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/10 bg-muted/5">
                                                    <div
                                                        className={cn(
                                                            "w-8 h-4 rounded-full transition-all cursor-pointer relative",
                                                            animDesc ? "bg-primary" : "bg-muted-foreground/20"
                                                        )}
                                                        onClick={() => setAnimDesc(!animDesc)}
                                                    >
                                                        <div className={cn(
                                                            "absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-all",
                                                            animDesc && "translate-x-4"
                                                        )} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black uppercase text-foreground">Description</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                                            animFormat === 'xml' ? "border-primary/20 bg-primary/5" : "border-border/10 bg-muted/5 hover:bg-muted/10"
                                        )}
                                        onClick={() => setAnimFormat('xml')}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-[10px]">XML</div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-foreground">Export as XML</h3>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Final Cut / Premiere Pro Import</p>
                                        </div>
                                        <div className={cn(
                                            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                            animFormat === 'xml' ? "border-primary" : "border-border/30"
                                        )}>
                                            {animFormat === 'xml' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>

                        <footer className="px-8 py-6 border-t border-border/10 bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-14 bg-muted-foreground/20 rounded-md flex items-center justify-center text-[10px] font-black text-muted-foreground/40 italic">MARK</div>
                                    <span className="text-[10px] font-bold text-foreground/70 uppercase">Watermark Active</span>
                                </div>
                                <Button
                                    size="sm"
                                    className="h-7 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg"
                                >
                                    Remove
                                </Button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="px-6 h-11 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Dismiss
                                </button>
                                <Button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="btn-filled px-10 h-11 rounded-xl shadow-lg relative overflow-hidden"
                                >
                                    {isExporting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Download className="h-4 w-4" />
                                            <span>Start Export</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </footer>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
