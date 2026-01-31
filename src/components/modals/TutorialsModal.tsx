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
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Tutorials & Help
                    </DialogTitle>
                    <DialogDescription>
                        Learn how to use Storyboarder.ai effectively
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="tutorials" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="tutorials">
                            <Film className="h-4 w-4 mr-2" />
                            Tutorials
                        </TabsTrigger>
                        <TabsTrigger value="shortcuts">
                            <Keyboard className="h-4 w-4 mr-2" />
                            Keyboard Shortcuts
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tutorials">
                        <ScrollArea className="h-[500px] pr-4">
                            <div className="space-y-6">
                                {tutorials.map((category, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <category.icon className="h-5 w-5 text-primary" />
                                            {category.title}
                                        </h3>
                                        <div className="space-y-2">
                                            {category.items.map((item, itemIdx) => (
                                                <div
                                                    key={itemIdx}
                                                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                                >
                                                    <h4 className="font-medium text-sm">{item.title}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
                                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                                        <Lightbulb className="h-5 w-5 text-primary" />
                                        Quick Tips
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>• Use the AI script breakdown to quickly generate scenes from your screenplay</li>
                                        <li>• Save time by duplicating similar shots and modifying them</li>
                                        <li>• Export your storyboard as PDF or image sequence for presentations</li>
                                        <li>• Use keyboard shortcuts to speed up your workflow</li>
                                        <li>• Enable auto-save in settings to never lose your work</li>
                                    </ul>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="shortcuts">
                        <ScrollArea className="h-[500px] pr-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">General</h3>
                                    <div className="space-y-2">
                                        {shortcuts.slice(0, 5).map((shortcut, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 rounded-lg border"
                                            >
                                                <span className="text-sm">{shortcut.action}</span>
                                                <div className="flex gap-1">
                                                    {shortcut.keys.map((key, keyIdx) => (
                                                        <kbd
                                                            key={keyIdx}
                                                            className="px-2 py-1 text-xs font-mono bg-muted rounded border"
                                                        >
                                                            {key}
                                                        </kbd>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold">Navigation</h3>
                                    <div className="space-y-2">
                                        {shortcuts.slice(5, 9).map((shortcut, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 rounded-lg border"
                                            >
                                                <span className="text-sm">{shortcut.action}</span>
                                                <div className="flex gap-1">
                                                    {shortcut.keys.map((key, keyIdx) => (
                                                        <kbd
                                                            key={keyIdx}
                                                            className="px-2 py-1 text-xs font-mono bg-muted rounded border"
                                                        >
                                                            {key}
                                                        </kbd>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold">Tools</h3>
                                    <div className="space-y-2">
                                        {shortcuts.slice(9).map((shortcut, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 rounded-lg border"
                                            >
                                                <span className="text-sm">{shortcut.action}</span>
                                                <div className="flex gap-1">
                                                    {shortcut.keys.map((key, keyIdx) => (
                                                        <kbd
                                                            key={keyIdx}
                                                            className="px-2 py-1 text-xs font-mono bg-muted rounded border"
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
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
