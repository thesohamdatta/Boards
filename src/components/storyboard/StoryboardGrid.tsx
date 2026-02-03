import { useStoryboardStore } from '@/stores/storyboardStore';
import { StoryboardPanel } from './StoryboardPanel';
import { Button } from '@/components/ui/button';
import { Sparkles, Pencil, LayoutGrid, List, Loader2, Film, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateStoryboard, generateShotImage, getScenes, updateProject as apiUpdateProject } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableShotProps {
  shot: any;
  sceneNumber: number;
  characterNames?: string[];
  isSelected: boolean;
  onSelect: () => void;
  onRetry: () => void;
  isLoading: boolean;
  viewMode: 'grid' | 'list';
}

function SortableShot({
  shot,
  sceneNumber,
  characterNames,
  isSelected,
  onSelect,
  onRetry,
  isLoading,
  viewMode
}: SortableShotProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: shot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-20 p-1 rounded-md bg-black/40 text-white/50 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <StoryboardPanel
        shot={shot}
        sceneNumber={sceneNumber}
        characterNames={characterNames}
        isSelected={isSelected}
        onClick={onSelect}
        onEdit={() => console.log('Edit shot', shot.id)}
        onRetry={onRetry}
        onVariation={() => console.log('Variation for shot', shot.id)}
        onUpload={() => console.log('Upload for shot', shot.id)}
        isLoading={isLoading}
      />
    </div>
  );
}

export function StoryboardGrid() {
  const {
    scenes,
    shots,
    selectedShotId,
    setSelectedShotId,
    currentProject,
    characters,
    setShots,
    settings,
    reorderShots,
    updateProject
  } = useStoryboardStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingShots, setGeneratingShots] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts (allows clicks)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-generate images on mount if some are missing and auto-generate is on
  useEffect(() => {
    const missingImages = shots.some(s => !s.imageUrl || s.imageUrl.length < 50);
    if (missingImages && settings.autoGenerateImages && !isGenerating && shots.length > 0) {
      handleGenerateStoryboard();
    }
  }, [shots.length, settings.autoGenerateImages]);

  const getSceneForShot = (sceneId: string) => {
    return scenes.find((s) => s.id === sceneId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderShots(active.id.toString(), over.id.toString());
      toast.info('Shot reordered');
    }
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

        const characterList = characters.map(c => ({
          name: c.name,
          description: c.description,
          appearance: c.appearance || undefined
        }));

        try {
          const result = await generateShotImage(
            shot.id,
            `${scene.location} - ${scene.lighting || 'DAY'}. ${scene.description}`,
            shot.description,
            shot.cameraAngle,
            shot.shotSize,
            characterList,
            {
              style: shot.visualStyle || settings.imageStyle,
              mood: shot.lightingMood || undefined,
              composition: shot.composition || undefined
            },
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

            // Auto-update project thumbnail if first one
            if (currentProject && !currentProject.thumbnail) {
              const img = result.panel.image_url;
              await apiUpdateProject(currentProject.id, { thumbnail: img });
              updateProject(currentProject.id, { thumbnail: img });
            }
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
      const characterList = characters.map(c => ({
        name: c.name,
        description: c.description,
        appearance: c.appearance || undefined
      }));

      const result = await generateShotImage(
        shotId,
        `${scene.location} - ${scene.lighting || 'DAY'}. ${scene.description}`,
        shot.description,
        shot.cameraAngle,
        shot.shotSize,
        characterList,
        {
          style: shot.visualStyle || settings.imageStyle,
          mood: shot.lightingMood || undefined,
          composition: shot.composition || undefined
        },
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

        // Auto-update project thumbnail if first one
        if (currentProject && !currentProject.thumbnail) {
          const img = result.panel.image_url;
          await apiUpdateProject(currentProject.id, { thumbnail: img });
          updateProject(currentProject.id, { thumbnail: img });
        }
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={shots.map(s => s.id)}
            strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            <div className={cn(
              "grid gap-8 p-2",
              viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 max-w-4xl mx-auto"
            )}>
              {shots.map((shot) => {
                const scene = getSceneForShot(shot.sceneId);
                const isRegenerating = generatingShots.has(shot.id);

                return (
                  <SortableShot
                    key={shot.id}
                    shot={shot}
                    sceneNumber={scene?.sceneNumber || 1}
                    isSelected={selectedShotId === shot.id}
                    onSelect={() => setSelectedShotId(shot.id)}
                    onRetry={() => handleRetryShot(shot.id)}
                    isLoading={isRegenerating}
                    viewMode={viewMode}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
