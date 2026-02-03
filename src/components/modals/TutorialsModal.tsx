import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    PlayCircle,
    Keyboard,
    Lightbulb,
    BookOpen,
    Zap,
    Palette,
    Film
} from 'lucide-react';

interface TutorialsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TutorialsModal({ open, onOpenChange }: TutorialsModalProps) {
    const tutorials = [
        {
            title: 'Getting Started',
            icon: PlayCircle,
            items: [
                { title: 'Create Your First Project', description: 'Learn how to start a new storyboard project and set up your workspace' },
                { title: 'Understanding the Interface', description: 'Tour of the main interface, panels, and navigation' },
                { title: 'Import & Export', description: 'How to import scripts and export your storyboards' },
            ]
        },
        {
            title: 'AI Features',
            icon: Zap,
            items: [
                { title: 'Script Breakdown', description: 'Use AI to automatically break down your script into scenes and characters' },
                { title: 'Shot Generation', description: 'Generate storyboard frames using AI-powered image generation' },
                { title: 'Character Creation', description: 'Create and manage character references with AI assistance' },
            ]
        },
        {
            title: 'Drawing & Canvas',
            icon: Palette,
            items: [
                { title: 'Drawing Tools', description: 'Master the drawing tools and brush options' },
                { title: 'Grid & Guides', description: 'Use perspective grids and rule of thirds for better composition' },
                { title: 'Layers & Editing', description: 'Work with layers and make non-destructive edits' },
            ]
        },
        {
            title: 'Workflow Tips',
            icon: Lightbulb,
            items: [
                { title: 'Camera Angles', description: 'Best practices for choosing effective camera angles' },
                { title: 'Shot Composition', description: 'Learn composition techniques for cinematic shots' },
                { title: 'Timing & Duration', description: 'Set shot duration and create animatics' },
            ]
        },
    ];

    const shortcuts = [
        { keys: ['Ctrl', 'N'], action: 'New Project' },
        { keys: ['Ctrl', 'S'], action: 'Save Project' },
        { keys: ['Ctrl', 'E'], action: 'Export' },
        { keys: ['Ctrl', 'Z'], action: 'Undo' },
        { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
        { keys: ['Space'], action: 'Play/Pause Animatic' },
        { keys: ['←', '→'], action: 'Navigate Shots' },
        { keys: ['Ctrl', '+'], action: 'Zoom In' },
        { keys: ['Ctrl', '-'], action: 'Zoom Out' },
        { keys: ['B'], action: 'Brush Tool' },
        { keys: ['E'], action: 'Eraser Tool' },
        { keys: ['G'], action: 'Toggle Grid' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl bg-card border-border/50 shadow-3 rounded-[var(--radius-xl)] p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-6 border-b border-border/20">
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
                            <BookOpen className="h-6 w-6 text-primary" />
                            Field Manual & Training
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-primary/80">
                            Optimize your Storytelling Workflow
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="tutorials" className="w-full">
                    <div className="px-8 pt-4">
                        <TabsList className="flex w-full bg-muted/30 p-1 rounded-xl border border-border/20">
                            <TabsTrigger value="tutorials" className="flex-1 rounded-lg text-xs font-bold uppercase tracking-widest py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
                                <Film className="h-4 w-4 mr-2" />
                                Procedures
                            </TabsTrigger>
                            <TabsTrigger value="shortcuts" className="flex-1 rounded-lg text-xs font-bold uppercase tracking-widest py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
                                <Keyboard className="h-4 w-4 mr-2" />
                                Hotkeys
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="px-8 py-8 h-[60vh] overflow-y-auto custom-scrollbar">
                        <TabsContent value="tutorials" className="space-y-10 mt-0">
                            <div className="space-y-10">
                                {tutorials.map((category, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                            <category.icon className="h-4 w-4" />
                                            {category.title}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {category.items.map((item, itemIdx) => (
                                                <div
                                                    key={itemIdx}
                                                    className="p-5 rounded-2xl border border-border/30 bg-muted/10 hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer group"
                                                >
                                                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4" />
                                        Advanced Directives
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            'Leverage Semantic Analysis for automated shot sequencing',
                                            'Maintain character consistency via Visual Reference anchoring',
                                            'Execute multi-format exports for diverse production pipelines',
                                            'Incorporate rapid key-commands for real-time visualization'
                                        ].map((tip, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                                <p className="text-xs font-medium text-muted-foreground/80">{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="shortcuts" className="space-y-8 mt-0">
                            <div className="grid grid-cols-1 gap-10">
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">System Ops</h3>
                                    <div className="grid gap-3">
                                        {shortcuts.slice(0, 5).map((shortcut, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/5 group hover:bg-muted/10 transition-colors"
                                            >
                                                <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest group-hover:text-foreground transition-colors">{shortcut.action}</span>
                                                <div className="flex gap-1.5">
                                                    {shortcut.keys.map((key, keyIdx) => (
                                                        <kbd
                                                            key={keyIdx}
                                                            className="px-2.5 py-1 text-[10px] font-black font-mono bg-background border border-border/50 rounded-lg shadow-sm text-primary"
                                                        >
                                                            {key}
                                                        </kbd>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Navigation & Playback</h3>
                                    <div className="grid gap-3">
                                        {shortcuts.slice(5, 9).map((shortcut, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/5 group hover:bg-muted/10 transition-colors"
                                            >
                                                <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest group-hover:text-foreground transition-colors">{shortcut.action}</span>
                                                <div className="flex gap-1.5">
                                                    {shortcut.keys.map((key, keyIdx) => (
                                                        <kbd
                                                            key={keyIdx}
                                                            className="px-2.5 py-1 text-[10px] font-black font-mono bg-background border border-border/50 rounded-lg shadow-sm text-primary"
                                                        >
                                                            {key}
                                                        </kbd>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Creative Arsenal</h3>
                                    <div className="grid gap-3">
                                        {shortcuts.slice(9).map((shortcut, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/5 group hover:bg-muted/10 transition-colors"
                                            >
                                                <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest group-hover:text-foreground transition-colors">{shortcut.action}</span>
                                                <div className="flex gap-1.5">
                                                    {shortcut.keys.map((key, keyIdx) => (
                                                        <kbd
                                                            key={keyIdx}
                                                            className="px-2.5 py-1 text-[10px] font-black font-mono bg-background border border-border/50 rounded-lg shadow-sm text-primary"
                                                        >
                                                            {key}
                                                        </kbd>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
