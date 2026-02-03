import { useState, useEffect } from 'react';
import { useStoryboardStore } from '@/stores/storyboardStore';
import { DEFAULT_SETTINGS } from '@/types/storyboard';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    const { settings: storeSettings, updateSettings } = useStoryboardStore();
    const [localSettings, setLocalSettings] = useState(storeSettings);

    // Sync local settings when store settings change (e.g. initial load)
    useEffect(() => {
        setLocalSettings(storeSettings);
    }, [storeSettings, open]);

    const handleSave = () => {
        updateSettings(localSettings);
        localStorage.setItem('storyboarder_settings', JSON.stringify(localSettings));
        toast.success('Settings saved successfully');
        onOpenChange(false);
    };

    const handleReset = () => {
        if (confirm('Reset all settings to defaults?')) {
            updateSettings(DEFAULT_SETTINGS);
            setLocalSettings(DEFAULT_SETTINGS);
            toast.success('Settings reset to defaults');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl bg-card border-border/50 shadow-3 rounded-[var(--radius-xl)] p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-6 border-b border-border/20">
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-black tracking-tight text-foreground uppercase">
                            Preferences
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-primary/80">
                            Configure your Cinematic Workspace
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full">
                    <div className="px-8 pt-4">
                        <TabsList className="flex w-full bg-muted/30 p-1 rounded-xl border border-border/20">
                            <TabsTrigger value="general" className="flex-1 rounded-lg text-xs font-bold uppercase tracking-widest py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">General</TabsTrigger>
                            <TabsTrigger value="canvas" className="flex-1 rounded-lg text-xs font-bold uppercase tracking-widest py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Composition</TabsTrigger>
                            <TabsTrigger value="ai" className="flex-1 rounded-lg text-xs font-bold uppercase tracking-widest py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Intelligence</TabsTrigger>
                            <TabsTrigger value="interface" className="flex-1 rounded-lg text-xs font-bold uppercase tracking-widest py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Viewport</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="px-8 py-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
                        <TabsContent value="general" className="space-y-8 mt-0">
                            <div className="p-5 rounded-2xl bg-muted/20 border border-border/20 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label htmlFor="auto-save" className="text-sm font-black uppercase tracking-widest text-foreground">Cloud Sync & Persistence</Label>
                                        <p className="text-xs text-muted-foreground font-medium">Automatically preserve your narrative progress</p>
                                    </div>
                                    <Switch
                                        id="auto-save"
                                        checked={localSettings.autoSave}
                                        onCheckedChange={(checked) =>
                                            setLocalSettings({ ...localSettings, autoSave: checked })
                                        }
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/10">
                                    <Label htmlFor="save-interval" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sync Frequency (Minutes)</Label>
                                    <div className="px-2">
                                        <Slider
                                            id="save-interval"
                                            min={1}
                                            max={30}
                                            step={1}
                                            value={[localSettings.autoSaveInterval]}
                                            onValueChange={([value]) =>
                                                setLocalSettings({ ...localSettings, autoSaveInterval: value })
                                            }
                                            disabled={!localSettings.autoSave}
                                            className="py-4"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black font-mono text-primary text-right">
                                        {localSettings.autoSaveInterval} UNIT(S)
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="aspect-ratio" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Native Aspect Ratio</Label>
                                    <Select
                                        value={localSettings.defaultAspectRatio}
                                        onValueChange={(value) =>
                                            setLocalSettings({ ...localSettings, defaultAspectRatio: value })
                                        }
                                    >
                                        <SelectTrigger id="aspect-ratio" className="h-12 rounded-xl bg-background/50 border-border/50 text-xs font-bold uppercase tracking-widest px-4">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border/50">
                                            <SelectItem value="16:9">16:9 Widescreen</SelectItem>
                                            <SelectItem value="2.35:1">2.35:1 Anamorphic</SelectItem>
                                            <SelectItem value="4:3">4:3 Academy</SelectItem>
                                            <SelectItem value="1:1">1:1 Square</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="frame-rate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Temporal Resolution</Label>
                                    <Select
                                        value={String(localSettings.defaultFrameRate)}
                                        onValueChange={(value) =>
                                            setLocalSettings({ ...localSettings, defaultFrameRate: Number(value) })
                                        }
                                    >
                                        <SelectTrigger id="frame-rate" className="h-12 rounded-xl bg-background/50 border-border/50 text-xs font-bold uppercase tracking-widest px-4">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border/50">
                                            <SelectItem value="24">24 FPS Cinematic</SelectItem>
                                            <SelectItem value="25">25 FPS Global</SelectItem>
                                            <SelectItem value="30">30 FPS Digital</SelectItem>
                                            <SelectItem value="60">60 FPS Fluid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="canvas" className="space-y-8 mt-0">
                            <div className="p-6 rounded-2xl bg-muted/20 border border-border/20 flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label htmlFor="show-grid" className="text-sm font-black uppercase tracking-widest text-foreground">Compositional Overlays</Label>
                                    <p className="text-xs text-muted-foreground font-medium">Enable golden ratio and rule of thirds guides</p>
                                </div>
                                <Switch
                                    id="show-grid"
                                    checked={localSettings.showGrid}
                                    onCheckedChange={(checked) =>
                                        setLocalSettings({ ...localSettings, showGrid: checked })
                                    }
                                />
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="grid-type" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Grid Methodology</Label>
                                    <Select
                                        value={localSettings.gridType}
                                        onValueChange={(value) =>
                                            setLocalSettings({ ...localSettings, gridType: value } as any)
                                        }
                                        disabled={!localSettings.showGrid}
                                    >
                                        <SelectTrigger id="grid-type" className="h-12 rounded-xl bg-background/50 border-border/50 text-xs font-bold uppercase tracking-widest px-4">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border/50">
                                            <SelectItem value="rule-of-thirds">Rule of Thirds</SelectItem>
                                            <SelectItem value="perspective">Perspective Lines</SelectItem>
                                            <SelectItem value="square">Standard Grid</SelectItem>
                                            <SelectItem value="none">Disabled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="stroke-width" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visual Weight of Lines</Label>
                                    <div className="px-2">
                                        <Slider
                                            id="stroke-width"
                                            min={1}
                                            max={10}
                                            step={1}
                                            value={[localSettings.strokeWidth]}
                                            onValueChange={([value]) =>
                                                setLocalSettings({ ...localSettings, strokeWidth: value })
                                            }
                                        />
                                    </div>
                                    <p className="text-[10px] font-black font-mono text-primary text-right">
                                        {localSettings.strokeWidth}PX WEIGHT
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="ai" className="space-y-8 mt-0">
                            <div className="space-y-3">
                                <Label htmlFor="ai-model" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Core Intelligence Engine</Label>
                                <Select
                                    value={localSettings.aiModel}
                                    onValueChange={(value) =>
                                        setLocalSettings({ ...localSettings, aiModel: value })
                                    }
                                >
                                    <SelectTrigger id="ai-model" className="h-12 rounded-xl bg-background/50 border-border/50 text-xs font-bold uppercase tracking-widest px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border/50">
                                        <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash Ultra</SelectItem>
                                        <SelectItem value="gemini-2.0-flash-lite-001">Gemini 2.0 Nano Core</SelectItem>
                                        <SelectItem value="gemini-2.0-flash">Gemini 2.0 Prime</SelectItem>
                                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Legacy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="temperature" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Creativity Threshold</Label>
                                <div className="px-2">
                                    <Slider
                                        id="temperature"
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        value={[localSettings.aiTemperature]}
                                        onValueChange={([value]) =>
                                            setLocalSettings({ ...localSettings, aiTemperature: value })
                                        }
                                    />
                                </div>
                                <p className="text-[10px] font-black font-mono text-primary text-right uppercase">
                                    {localSettings.aiTemperature.toFixed(1)} Variance (High Creativity)
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-5 rounded-2xl bg-muted/20 border border-border/20 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label htmlFor="auto-generate" className="text-sm font-black uppercase tracking-widest text-foreground">Proactive Visualization</Label>
                                        <p className="text-xs text-muted-foreground font-medium">Enable real-time scene synthesis</p>
                                    </div>
                                    <Switch
                                        id="auto-generate"
                                        checked={localSettings.autoGenerateImages}
                                        onCheckedChange={(checked) =>
                                            setLocalSettings({ ...localSettings, autoGenerateImages: checked })
                                        }
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="image-style" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Aesthetic Archetype</Label>
                                    <Select
                                        value={localSettings.imageStyle}
                                        onValueChange={(value) =>
                                            setLocalSettings({ ...localSettings, imageStyle: value } as any)
                                        }
                                    >
                                        <SelectTrigger id="image-style" className="h-12 rounded-xl bg-background/50 border-border/50 text-xs font-bold uppercase tracking-widest px-4">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border/50">
                                            <SelectItem value="sketch">Hand-drawn Graphite</SelectItem>
                                            <SelectItem value="wireframe">Architectural Blueprint</SelectItem>
                                            <SelectItem value="detailed">Photorealistic Render</SelectItem>
                                            <SelectItem value="comic">Cinematic Comic Style</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="interface" className="space-y-8 mt-0">
                            <div className="grid gap-4">
                                <div className="p-5 rounded-2xl bg-muted/20 border border-border/20 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label htmlFor="show-timeline" className="text-sm font-black uppercase tracking-widest text-foreground">Temporal Sequencer</Label>
                                        <p className="text-xs text-muted-foreground font-medium">Toggle the cinematic timeline view</p>
                                    </div>
                                    <Switch
                                        id="show-timeline"
                                        checked={localSettings.showTimeline}
                                        onCheckedChange={(checked) =>
                                            setLocalSettings({ ...localSettings, showTimeline: checked })
                                        }
                                    />
                                </div>

                                <div className="p-5 rounded-2xl bg-muted/20 border border-border/20 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label htmlFor="compact-mode" className="text-sm font-black uppercase tracking-widest text-foreground">High-Density Interface</Label>
                                        <p className="text-xs text-muted-foreground font-medium">Maximize screen real-estate for storyboards</p>
                                    </div>
                                    <Switch
                                        id="compact-mode"
                                        checked={localSettings.compactMode}
                                        onCheckedChange={(checked) =>
                                            setLocalSettings({ ...localSettings, compactMode: checked })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="sidebar-position" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Workspace Orientation</Label>
                                <Select
                                    value={localSettings.sidebarPosition}
                                    onValueChange={(value) =>
                                        setLocalSettings({ ...localSettings, sidebarPosition: value } as any)
                                    }
                                >
                                    <SelectTrigger id="sidebar-position" className="h-12 rounded-xl bg-background/50 border-border/50 text-xs font-bold uppercase tracking-widest px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border/50">
                                        <SelectItem value="left">Left Docked</SelectItem>
                                        <SelectItem value="right">Right Docked</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <div className="flex items-center justify-between p-8 border-t border-border/20 bg-muted/10">
                    <Button variant="ghost" onClick={handleReset} className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary rounded-xl">
                        Factory Reset
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="px-6 rounded-xl font-bold text-xs uppercase tracking-widest">
                            Dismiss
                        </Button>
                        <Button onClick={handleSave} className="btn-filled px-8 rounded-xl shadow-primary/20">
                            Apply Configurations
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
