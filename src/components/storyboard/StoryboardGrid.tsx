import { useStoryboardStore } from '@/stores/storyboardStore';
import { StoryboardPanel } from './StoryboardPanel';
import { Button } from '@/components/ui/button';
import { Sparkles, Pencil, LayoutGrid, List, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { generateStoryboard, generateShotImage, getScenes } from '@/lib/api';
import { toast } from 'sonner';

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

    // Identify shots that need generation (missing images)
    // Note: We filter locally based on current view state
    const shotsToGenerate = shots.filter(s => !s.imageUrl || s.imageUrl.length < 50); // Simple check for missing/placeholder

    if (shotsToGenerate.length === 0) {
      toast.info("All shots already have images. Use 'Retry' on specific shots to regenerate.");
      return;
    }

    setIsGenerating(true);
    setGeneratingShots(new Set(shotsToGenerate.map(s => s.id)));
    toast.info(`Starting generation for ${shotsToGenerate.length} shots...`);

    try {
      let completedCount = 0;

      for (const shot of shotsToGenerate) {
        // Check if we should stop (e.g. component unmount? - hard to check in loop without ref, but okay for now)

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
            // Update state IMMEDIATELY for this single shot
            setShots(prev => prev.map(s => s.id === shot.id ? {
              ...s,
              imageUrl: result.panel.image_url,
              promptUsed: result.panel.prompt_used
            } : s));

            completedCount++;
          }
        } catch (err) {
          console.error(`Error generating shot ${shot.id}`, err);
        } finally {
          // Remove from loading set
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
      setGeneratingShots(new Set()); // Ensure clear
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
        'sketch', // Default style, could come from settings
        '16:9',   // Default aspect ratio, could come from settings
        settings.aiModel // Pass the model from settings!
      );

      if (result.success) {
        // Update shot with new image
        setShots(shots.map(s =>
          s.id === shotId
            ? { ...s, imageUrl: result.panel.image_url, promptUsed: result.panel.prompt_used }
            : s
        ));
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
    <div className="flex-1 overflow-y-auto bg-background p-8">
      {/* Controls */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          onClick={handleGenerateStoryboard}
          disabled={isGenerating || shots.length === 0}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? 'Generating...' : 'Generate Storyboard'}
        </Button>
        <Button variant="outline" className="gap-2 border-border">
          <Pencil className="h-4 w-4" />
          Change Art Style
        </Button>
      </div>

      {/* View toggle */}
      <div className="mb-6 flex items-center justify-center gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setViewMode('grid')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'grid'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'list'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Grid */}
      {shots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <LayoutGrid className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">No storyboard panels yet</h3>
          <p className="text-sm text-muted-foreground">
            Generate your storyboard to see panels here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
