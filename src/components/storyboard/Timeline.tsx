
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
    Maximize2
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
            "w-full z-40 bg-[#1a1a1a] border-t border-gray-800 shadow-xl transition-all duration-300 ease-in-out flex flex-col",
            settings.compactMode ? "h-32" : "h-48"
        )}>
            {/* Controls Bar */}
            <div className="h-10 border-b border-gray-800 flex items-center justify-between px-4 bg-[#111111]">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-white"
                        onClick={() => setCurrentTime(0)}
                    >
                        <SkipBack className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/10"
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-white"
                        onClick={() => setCurrentTime(totalDuration)}
                    >
                        <SkipForward className="w-4 h-4" />
                    </Button>

                    <span className="text-xs font-mono text-purple-400 ml-2">
                        {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-32">
                        <ZoomOut className="w-3 h-3 text-gray-500" />
                        <Slider
                            value={[zoomLevel]}
                            min={0.5}
                            max={3}
                            step={0.1}
                            onValueChange={([val]) => setZoomLevel(val)}
                            className="w-20"
                        />
                        <ZoomIn className="w-3 h-3 text-gray-500" />
                    </div>

                    <div className="flex items-center gap-1 border-l border-gray-800 pl-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-white"
                            onClick={() => updateSettings({ compactMode: !settings.compactMode })}
                            title={settings.compactMode ? "Expand Timeline" : "Compact Timeline"}
                        >
                            {settings.compactMode ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-white"
                            onClick={() => updateSettings({ showTimeline: false })}
                            title="Hide Timeline"
                        >
                            <SettingsIcon className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Timeline Track */}
            <div
                className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#0f0f0f] relative p-2"
                ref={scrollContainerRef}
            >
                <div className="flex h-full gap-1" style={{ width: `${totalDuration * 50 * zoomLevel}px`, minWidth: '100%' }}>
                    {shots.map((shot, index) => (
                        <div
                            key={shot.id}
                            className={cn(
                                "h-full relative group cursor-pointer border border-gray-800 rounded overflow-hidden select-none transition-all hover:border-gray-600",
                                selectedShotId === shot.id ? "border-purple-500 ring-1 ring-purple-500 bg-purple-900/10" : "bg-[#1a1a1a]"
                            )}
                            style={{
                                flex: `0 0 ${shot.duration * 50 * zoomLevel}px`,
                                maxWidth: `${shot.duration * 50 * zoomLevel}px`
                            }}
                            onClick={() => setSelectedShotId(shot.id)}
                        >
                            <div className="absolute top-1 left-2 text-[10px] text-gray-500 font-mono z-10 bg-black/50 px-1 rounded">
                                {index + 1}
                            </div>

                            {shot.imageUrl ? (
                                <img
                                    src={shot.imageUrl}
                                    alt={`Shot ${shot.shotNumber}`}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                    draggable={false}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">
                                    {shot.shotSize}
                                </div>
                            )}

                            <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-black/80 to-transparent flex items-end px-2 pb-1">
                                <span className="text-[10px] text-gray-400">{shot.duration}s</span>
                            </div>
                        </div>
                    ))}

                    {shots.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                            Your timeline is empty. Add shots above to visualize story flow.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
