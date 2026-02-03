import React, { useState, useEffect, useRef } from 'react';
import { useStoryboardStore } from '@/stores/storyboardStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Settings, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export function AnimaticPlayer() {
    const {
        shots,
        currentProject,
        isPlaybackPlaying,
        setIsPlaybackPlaying,
        currentTime,
        setCurrentTime,
        playbackSpeed,
        setPlaybackSpeed
    } = useStoryboardStore();

    const [progress, setProgress] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const playableShots = shots.filter(s => s.imageUrl);

    // Master Timer Loop
    useEffect(() => {
        if (isPlaybackPlaying && playableShots.length > 0) {
            const currentShot = playableShots[currentIndex];
            const shotDuration = (currentShot?.duration || 3);

            // Calculate absolute current time based on shot indices
            let accumulatedTime = 0;
            for (let i = 0; i < currentIndex; i++) accumulatedTime += playableShots[i].duration || 3;

            const tick = () => {
                const now = Date.now();
                const frameDuration = (1000 / 30) * (1 / playbackSpeed); // 30fps target

                setCurrentTime(currentTime + (0.033 * playbackSpeed));
            };

            const interval = setInterval(() => {
                if (isPlaybackPlaying) {
                    setCurrentTime(currentTime + (0.05 * playbackSpeed));
                }
            }, 50);

            return () => clearInterval(interval);
        }
    }, [isPlaybackPlaying, currentTime, playbackSpeed, playableShots.length]);

    // Sync currentIndex and progress based on global currentTime
    useEffect(() => {
        let accumulatedTime = 0;
        let found = false;

        for (let i = 0; i < playableShots.length; i++) {
            const shot = playableShots[i];
            const duration = shot.duration || 3;

            if (currentTime >= accumulatedTime && currentTime < accumulatedTime + duration) {
                setCurrentIndex(i);
                setProgress(((currentTime - accumulatedTime) / duration) * 100);
                found = true;
                break;
            }
            accumulatedTime += duration;
        }

        if (!found && playableShots.length > 0) {
            if (currentTime >= accumulatedTime) {
                // End of timeline
                setIsPlaybackPlaying(false);
                setCurrentTime(accumulatedTime);
                setCurrentIndex(playableShots.length - 1);
                setProgress(100);
            }
        }
    }, [currentTime, playableShots]);

    const togglePlay = () => setIsPlaybackPlaying(!isPlaybackPlaying);

    const handleSeek = (val: number[]) => {
        const totalDuration = playableShots.reduce((acc, s) => acc + (s.duration || 3), 0);
        setCurrentTime((val[0] / 100) * totalDuration);
    };

    if (playableShots.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center surface-dim py-32 text-center">
                <div className="mb-6 h-16 w-16 flex items-center justify-center rounded-3xl bg-muted/50 border border-border/50 shadow-1">
                    <Play className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Visuals for Animatic</h3>
                <p className="text-muted-foreground max-w-xs">Generate storyboard images first to preview the cinematic flow.</p>
            </div>
        );
    }

    const currentShot = playableShots[currentIndex];

    return (
        <div className="flex-1 flex flex-col bg-black overflow-hidden relative group">
            {/* Cinematic Viewport */}
            <div className="flex-1 flex items-center justify-center relative bg-[#050505]">
                <img
                    src={currentShot.imageUrl}
                    alt={`Shot ${currentShot.shotNumber}`}
                    className="max-h-full max-w-full object-contain shadow-2xl"
                />

                {/* Visual Overlay - Top */}
                <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-1">Animatic Sequence</h4>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{currentProject?.name}</h2>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                        Frame {currentIndex + 1} / {playableShots.length}
                    </div>
                </div>

                {/* Description Overlay - Bottom */}
                <div className="absolute bottom-32 left-0 right-0 px-20 text-center pointer-events-none">
                    <p className="text-lg font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-3xl mx-auto italic opacity-90 transition-all">
                        "{currentShot.description}"
                    </p>
                </div>
            </div>

            {/* Modern Player Controls - Glassmorphism */}
            <div className="absolute bottom-0 left-0 right-0 p-8 h-28 bg-gradient-to-t from-black to-transparent flex flex-col gap-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">

                {/* Progress Bar */}
                <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="absolute left-0 top-0 bottom-0 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)] transition-all duration-75"
                        style={{ width: `${((currentIndex + progress / 100) / playableShots.length) * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setProgress(0); }}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            <SkipBack className="h-5 w-5" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="h-12 w-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-all shadow-xl"
                        >
                            {isPlaybackPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                        </button>
                        <button
                            onClick={() => { setCurrentIndex(Math.min(playableShots.length - 1, currentIndex + 1)); setProgress(0); }}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            <SkipForward className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-4 ml-6">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Volume</span>
                            <Volume2 className="h-4 w-4 text-white/60" />
                            <div className="w-24">
                                <Slider defaultValue={[80]} max={100} step={1} className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Speed</span>
                            <select
                                value={playbackSpeed}
                                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                className="bg-transparent border-none text-[10px] font-black text-white uppercase outline-none cursor-pointer"
                            >
                                <option value={0.5} className="bg-black">0.5x</option>
                                <option value={1} className="bg-black">1.0x</option>
                                <option value={1.5} className="bg-black">1.5x</option>
                                <option value={2} className="bg-black">2.0x</option>
                            </select>
                        </div>
                        <button className="text-white/60 hover:text-white transition-colors">
                            <Maximize2 className="h-4 w-4" />
                        </button>
                        <button className="text-white/60 hover:text-white transition-colors">
                            <Settings className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
