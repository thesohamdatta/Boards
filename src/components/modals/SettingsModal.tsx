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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Customize your storyboarding experience
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="canvas">Canvas</TabsTrigger>
                        <TabsTrigger value="ai">AI</TabsTrigger>
                        <TabsTrigger value="interface">Interface</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="auto-save">Auto-save</Label>
                                <Switch
                                    id="auto-save"
                                    checked={localSettings.autoSave}
                                    onCheckedChange={(checked) =>
                                        setLocalSettings({ ...localSettings, autoSave: checked })
                                    }
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Automatically save your work
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="save-interval">Auto-save interval (minutes)</Label>
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
                            />
                            <p className="text-sm text-muted-foreground">
                                {localSettings.autoSaveInterval} minutes
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aspect-ratio">Default aspect ratio</Label>
                            <Select
                                value={localSettings.defaultAspectRatio}
                                onValueChange={(value) =>
                                    setLocalSettings({ ...localSettings, defaultAspectRatio: value })
                                }
                            >
                                <SelectTrigger id="aspect-ratio">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="16:9">16:9 (Standard)</SelectItem>
                                    <SelectItem value="2.35:1">2.35:1 (Cinemascope)</SelectItem>
                                    <SelectItem value="4:3">4:3 (Classic)</SelectItem>
                                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="frame-rate">Default frame rate</Label>
                            <Select
                                value={String(localSettings.defaultFrameRate)}
                                onValueChange={(value) =>
                                    setLocalSettings({ ...localSettings, defaultFrameRate: Number(value) })
                                }
                            >
                                <SelectTrigger id="frame-rate">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="24">24 fps (Film)</SelectItem>
                                    <SelectItem value="25">25 fps (PAL)</SelectItem>
                                    <SelectItem value="30">30 fps (NTSC)</SelectItem>
                                    <SelectItem value="60">60 fps (High Frame Rate)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    <TabsContent value="canvas" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-grid">Show grid overlay</Label>
                            <Switch
                                id="show-grid"
                                checked={localSettings.showGrid}
                                onCheckedChange={(checked) =>
                                    setLocalSettings({ ...localSettings, showGrid: checked })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grid-type">Grid type</Label>
                            <Select
                                value={localSettings.gridType}
                                onValueChange={(value) =>
                                    setLocalSettings({ ...localSettings, gridType: value } as any)
                                }
                                disabled={!localSettings.showGrid}
                            >
                                <SelectTrigger id="grid-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rule-of-thirds">Rule of Thirds</SelectItem>
                                    <SelectItem value="perspective">Perspective Grid</SelectItem>
                                    <SelectItem value="square">Square Grid</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stroke-width">Default stroke width</Label>
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
                            <p className="text-sm text-muted-foreground">
                                {localSettings.strokeWidth}px
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="ai" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ai-model">AI Model</Label>
                            <Select
                                value={localSettings.aiModel}
                                onValueChange={(value) =>
                                    setLocalSettings({ ...localSettings, aiModel: value })
                                }
                            >
                                <SelectTrigger id="ai-model">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Newest & Fast)</SelectItem>
                                    <SelectItem value="gemini-2.0-flash-lite-001">Gemini 2.0 Flash Lite (Nano-class)</SelectItem>
                                    <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash (Stable)</SelectItem>
                                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Standard)</SelectItem>
                                    <SelectItem value="gemini-pro">Gemini 1.0 Pro (Legacy)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="temperature">AI Creativity</Label>
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
                            <p className="text-sm text-muted-foreground">
                                {localSettings.aiTemperature.toFixed(1)} (Higher = More creative)
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-generate">Auto-generate images</Label>
                            <Switch
                                id="auto-generate"
                                checked={localSettings.autoGenerateImages}
                                onCheckedChange={(checked) =>
                                    setLocalSettings({ ...localSettings, autoGenerateImages: checked })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image-style">Image style</Label>
                            <Select
                                value={localSettings.imageStyle}
                                onValueChange={(value) =>
                                    setLocalSettings({ ...localSettings, imageStyle: value } as any)
                                }
                            >
                                <SelectTrigger id="image-style">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sketch">Sketch</SelectItem>
                                    <SelectItem value="wireframe">Wireframe</SelectItem>
                                    <SelectItem value="detailed">Detailed</SelectItem>
                                    <SelectItem value="comic">Comic Style</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    <TabsContent value="interface" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-timeline">Show timeline</Label>
                            <Switch
                                id="show-timeline"
                                checked={localSettings.showTimeline}
                                onCheckedChange={(checked) =>
                                    setLocalSettings({ ...localSettings, showTimeline: checked })
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="compact-mode">Compact mode</Label>
                            <Switch
                                id="compact-mode"
                                checked={localSettings.compactMode}
                                onCheckedChange={(checked) =>
                                    setLocalSettings({ ...localSettings, compactMode: checked })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sidebar-position">Sidebar position</Label>
                            <Select
                                value={localSettings.sidebarPosition}
                                onValueChange={(value) =>
                                    setLocalSettings({ ...localSettings, sidebarPosition: value } as any)
                                }
                            >
                                <SelectTrigger id="sidebar-position">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleReset}>
                        Reset to Defaults
                    </Button>
                    <div className="space-x-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
