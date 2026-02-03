
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStoryboardStore } from '@/stores/storyboardStore';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    ZoomIn,
    ZoomOut,
    Settings as SettingsIcon,
    Minimize2,
    Maximize2,
    Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export const Timeline: React.FC = () => {
    const {
        shots,
        selectedShotId,
        setSelectedShotId,
        settings,
        updateSettings
    } = useStoryboardStore();

    const [isPlaying, setIsPlaying] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const totalDuration = useMemo(() =>
        shots.reduce((acc, shot) => acc + (shot.duration || 0), 0),
        [shots]
    );

    // Auto-scroll to selected shot
    useEffect(() => {
        if (selectedShotId && scrollContainerRef.current) {
            const selectedShotIndex = shots.findIndex(s => s.id === selectedShotId);
            if (selectedShotIndex !== -1) {
                const shotElement = scrollContainerRef.current.children[selectedShotIndex] as HTMLElement;
                if (shotElement) {
                    shotElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        }
    }, [selectedShotId, shots]);

    // Playback logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev >= totalDuration) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + 0.1;
                });
            }, 100);
        }

        return () => clearInterval(interval);
    }, [isPlaying, totalDuration]);

    // Sync current time to selected shot highlighting
    useEffect(() => {
        if (isPlaying) {
            let accumulatedTime = 0;
            for (const shot of shots) {
                if (currentTime >= accumulatedTime && currentTime < accumulatedTime + shot.duration) {
                    if (selectedShotId !== shot.id) {
                        setSelectedShotId(shot.id);
                    }
                    break;
                }
                accumulatedTime += shot.duration;
            }
        }
    }, [currentTime, isPlaying, shots, selectedShotId, setSelectedShotId]);

    if (!settings.showTimeline) return null;

    return (
        <div className={cn(
            "w-full z-40 bg-background/50 border-t border-border/50 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out flex flex-col",
            settings.compactMode ? "h-36" : "h-52"
        )}>
            {/* Controls Bar - MD3 Surface Header */}
            <div className="h-12 border-b border-border/30 flex items-center justify-between px-6 bg-background/30 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:bg-muted"
                        onClick={() => setCurrentTime(0)}
                    >
                        <SkipBack className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-primary-foreground bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all rounded-full"
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:bg-muted"
                        onClick={() => setCurrentTime(totalDuration)}
                    >
                        <SkipForward className="w-4 h-4" />
                    </Button>

                    <div className="ml-4 px-3 py-1 rounded-full bg-muted/50 border border-border/50">
                        <span className="text-[10px] font-black font-mono tracking-widest text-primary">
                            {currentTime.toFixed(1)}S <span className="text-muted-foreground mx-1">/</span> {totalDuration.toFixed(1)}S
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <ZoomOut className="w-3.5 h-3.5 text-muted-foreground/50" />
                        <Slider
                            value={[zoomLevel]}
                            min={0.5}
                            max={3}
                            step={0.1}
                            onValueChange={([val]) => setZoomLevel(val)}
                            className="w-32"
                        />
                        <ZoomIn className="w-3.5 h-3.5 text-muted-foreground/50" />
                    </div>

                    <div className="flex items-center gap-2 border-l border-border/30 pl-6 px-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:bg-muted rounded-full"
                            onClick={() => updateSettings({ compactMode: !settings.compactMode })}
                            title={settings.compactMode ? "Expand Timeline" : "Compact Timeline"}
                        >
                            {settings.compactMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:bg-muted rounded-full"
                            onClick={() => updateSettings({ showTimeline: false })}
                            title="Hide Timeline"
                        >
                            <SettingsIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Timeline Track - Cinematic Surface */}
            <div
                className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-background/20 relative p-4 flex items-center"
                ref={scrollContainerRef}
            >
                <div className="flex h-32 gap-2 relative" style={{ width: `${totalDuration * 50 * zoomLevel}px`, minWidth: '100%' }}>
                    {shots.map((shot, index) => (
                        <div
                            key={shot.id}
                            className={cn(
                                "h-full relative group cursor-pointer border rounded-2xl overflow-hidden select-none transition-all duration-300",
                                selectedShotId === shot.id
                                    ? "border-primary ring-2 ring-primary/20 bg-primary/10 shadow-xl shadow-primary/10 z-10"
                                    : "border-border/30 bg-muted/20 hover:border-primary/50"
                            )}
                            style={{
                                flex: `0 0 ${shot.duration * 50 * zoomLevel}px`,
                                maxWidth: `${shot.duration * 50 * zoomLevel}px`
                            }}
                            onClick={() => setSelectedShotId(shot.id)}
                        >
                            {/* Metadata Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10 opacity-60 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <span className="text-[9px] font-black text-white/80 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-sm tracking-widest uppercase">
                                        P{index + 1}
                                    </span>
                                    {selectedShotId === shot.id && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_primary]" />
                                    )}
                                </div>
                                <span className="text-[9px] font-bold text-white/50 group-hover:text-white transition-colors tracking-tighter uppercase px-1">
                                    {shot.shotSize} · {shot.duration}S
                                </span>
                            </div>

                            {shot.imageUrl ? (
                                <img
                                    src={shot.imageUrl}
                                    alt={`Shot ${shot.shotNumber}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    draggable={false}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20">
                                    <Video className="w-6 h-6 text-muted-foreground/30 mb-2" />
                                    <span className="text-[10px] text-muted-foreground/50 tracking-widest font-bold uppercase">{shot.shotSize}</span>
                                </div>
                            )}

                            {/* Selection Glow Bar */}
                            {selectedShotId === shot.id && (
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-primary shadow-[0_-2px_8px_primary]" />
                            )}
                        </div>
                    ))}

                    {shots.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 text-xs font-bold tracking-widest uppercase gap-3">
                            <SkipBack className="w-4 h-4 opacity-30" />
                            Awaiting Cinematic Data
                            <SkipForward className="w-4 h-4 opacity-30" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
