import { useStoryboardStore } from '@/stores/storyboardStore';
import { StoryboardPanel } from './StoryboardPanel';
import { Button } from '@/components/ui/button';
import { Sparkles, Pencil, LayoutGrid, List, Loader2, Film } from 'lucide-react';
import { useState } from 'react';
import { generateStoryboard, generateShotImage, getScenes } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function StoryboardGrid() {
  const {
    scenes,
    shots,
    selectedShotId,
    setSelectedShotId,
    currentProject,
    characters,
    setShots,
    settings
  } = useStoryboardStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingShots, setGeneratingShots] = useState<Set<string>>(new Set());

  const getSceneForShot = (sceneId: string) => {
    return scenes.find((s) => s.id === sceneId);
  };

  const handleGenerateStoryboard = async () => {
    if (!currentProject) {
      toast.error('No project loaded');
      return;
    }

    const shotsToGenerate = shots.filter(s => !s.imageUrl || s.imageUrl.length < 50);

    if (shotsToGenerate.length === 0) {
      toast.info("All shots already have images. Use 'Retry' on specific shots to regenerate.");
      return;
    }

    setIsGenerating(true);
    setGeneratingShots(new Set(shotsToGenerate.map(s => s.id)));
    toast.info(`Starting generation for ${shotsToGenerate.length} shots...`);

    try {
      let completedCount = 0;
      let currentShots = [...shots];

      for (const shot of shotsToGenerate) {
        const scene = getSceneForShot(shot.sceneId);
        if (!scene) continue;

        const characterList = characters.map(c => ({ name: c.name, description: c.description }));

        try {
          const result = await generateShotImage(
            shot.id,
            `${scene.location} - ${scene.lighting || 'DAY'}. ${scene.description}`,
            shot.description,
            shot.cameraAngle,
            shot.shotSize,
            characterList,
            settings.imageStyle,
            '16:9',
            settings.aiModel
          );

          if (result.success) {
            currentShots = currentShots.map(s => s.id === shot.id ? {
              ...s,
              imageUrl: result.panel.image_url,
              promptUsed: result.panel.prompt_used
            } : s);
            setShots(currentShots);
            completedCount++;
          }
        } catch (err) {
          console.error(`Error generating shot ${shot.id}`, err);
        } finally {
          setGeneratingShots(prev => {
            const next = new Set(prev);
            next.delete(shot.id);
            return next;
          });
        }
      }

      toast.success(`Generation complete. ${completedCount} images created.`);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate storyboard';
      toast.error(message);
    } finally {
      setIsGenerating(false);
      setGeneratingShots(new Set());
    }
  };

  const handleRetryShot = async (shotId: string) => {
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;

    const scene = getSceneForShot(shot.sceneId);
    if (!scene) return;

    setGeneratingShots(prev => new Set(prev).add(shotId));

    try {
      const characterList = characters.map(c => ({ name: c.name, description: c.description }));

      const result = await generateShotImage(
        shotId,
        `${scene.location} - ${scene.lighting}. ${scene.description}`,
        shot.description,
        shot.cameraAngle,
        shot.shotSize,
        characterList,
        settings.imageStyle,
        '16:9',
        settings.aiModel
      );

      if (result.success) {
        const updatedShots = shots.map(s =>
          s.id === shotId
            ? { ...s, imageUrl: result.panel.image_url, promptUsed: result.panel.prompt_used }
            : s
        );
        setShots(updatedShots);
        toast.success('Shot regenerated');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to regenerate shot';
      toast.error(message);
    } finally {
      setGeneratingShots(prev => {
        const next = new Set(prev);
        next.delete(shotId);
        return next;
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto surface-dim p-10 custom-scrollbar">
      {/* Cinematic Controls */}
      <div className="mb-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <button
            className="btn-filled group h-14 px-8 shadow-xl shadow-primary/20"
            onClick={handleGenerateStoryboard}
            disabled={isGenerating || shots.length === 0}
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
            )}
            <span className="text-base font-bold tracking-tight">
              {isGenerating ? 'Directing AI...' : 'Generate Full Storyboard'}
            </span>
          </button>

          <button className="btn-tonal h-14 px-6 border border-border/50">
            <Pencil className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Visual Style: {settings.imageStyle}</span>
          </button>
        </div>

        {/* MD3 Tonal Segmented Control */}
        <div className="flex items-center gap-1 rounded-full bg-muted/30 p-1.5 border border-border/50 backdrop-blur-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "flex items-center justify-center h-10 w-14 rounded-full transition-all",
              viewMode === 'grid' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "flex items-center justify-center h-10 w-14 rounded-full transition-all",
              viewMode === 'list' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      {shots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative h-20 w-20 flex items-center justify-center rounded-3xl bg-secondary border border-border/50 shadow-2">
              <Film className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">Awaiting your vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your storyboard is empty. Head over to the <span className="text-primary font-bold">Story</span> tab to draft your script, then return here to bring it to life.
          </p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-8 p-2",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 max-w-4xl mx-auto"
        )}>
          {shots.map((shot) => {
            const scene = getSceneForShot(shot.sceneId);
            const isRegenerating = generatingShots.has(shot.id);

            return (
              <StoryboardPanel
                key={shot.id}
                shot={shot}
                sceneNumber={scene?.sceneNumber || 1}
                isSelected={selectedShotId === shot.id}
                onClick={() => setSelectedShotId(shot.id)}
                onEdit={() => console.log('Edit shot', shot.id)}
                onRetry={() => handleRetryShot(shot.id)}
                onVariation={() => console.log('Variation for shot', shot.id)}
                onUpload={() => console.log('Upload for shot', shot.id)}
                isLoading={isRegenerating}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
