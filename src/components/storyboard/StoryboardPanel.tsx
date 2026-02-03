import { RefreshCw, Pencil, Shuffle, Upload, Video, Loader2 } from 'lucide-react';
import { Shot } from '@/types/storyboard';
import { cn } from '@/lib/utils';

interface StoryboardPanelProps {
  shot: Shot;
  sceneNumber: number;
  onEdit?: () => void;
  onRetry?: () => void;
  onVariation?: () => void;
  onUpload?: () => void;
  isSelected?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

export function StoryboardPanel({
  shot,
  sceneNumber,
  onEdit,
  onRetry,
  onVariation,
  onUpload,
  isSelected,
  onClick,
  isLoading,
}: StoryboardPanelProps) {
  // Parse character names from description (highlighted with accent color)
  const highlightCharacters = (text: string) => {
    const characters = ['Tyler', 'Jack', 'Bob', 'Marcus', 'Rourke', 'Mary', 'James'];
    let result = text;
    characters.forEach((char) => {
      const regex = new RegExp(`\\b${char}\\b`, 'gi');
      result = result.replace(
        regex,
        `<a href="#" class="text-primary hover:underline font-medium">${char}<span class="inline-block w-3 h-3 ml-0.5 align-middle"><svg viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 inline"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></span></a>`
      );
    });
    return result;
  };

  return (
    <div
      className={cn(
        'group overflow-hidden rounded-[var(--radius-xl)] border bg-card transition-all duration-300 cursor-pointer shadow-1 hover:shadow-3',
        isSelected
          ? 'border-primary ring-2 ring-primary/20 scale-[1.02]'
          : 'border-border/50 hover:border-primary/50'
      )}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
        {/* Video Type Indicator - MD3 Badge Style */}
        <div className="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
          <Video className="h-4 w-4 text-white" />
        </div>

        {/* Shot Number Indicator */}
        <div className="absolute right-4 top-4 z-10 px-3 py-1 rounded-lg bg-primary/90 text-primary-foreground text-[10px] font-bold tracking-widest backdrop-blur-sm shadow-lg">
          S{sceneNumber} · P{shot.shotNumber}
        </div>

        <img
          src={shot.imageUrl || '/placeholder.svg'}
          alt={`Scene ${sceneNumber}, Shot ${shot.shotNumber}`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Painting Shot...</span>
          </div>
        )}

        {/* Cinematic Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
          <p className="text-white text-xs font-medium leading-relaxed line-clamp-2">
            {shot.description}
          </p>
        </div>
      </div>

      {/* Info Section - Clean & Minimal */}
      <div className="p-4 border-b border-border/30 bg-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Visual Narrative</span>
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
          </div>
        </div>
        <p
          className="line-clamp-2 text-xs leading-relaxed text-foreground/90 font-medium"
          dangerouslySetInnerHTML={{ __html: highlightCharacters(shot.description) }}
        />
      </div>

      {/* Modern Tonal Action Bar */}
      <div className="grid grid-cols-4 bg-muted/20">
        <button
          className="flex h-11 items-center justify-center text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary border-r border-border/20"
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          title="Edit Details"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="flex h-11 items-center justify-center text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary border-r border-border/20"
          onClick={(e) => { e.stopPropagation(); onRetry?.(); }}
          title="Regenerate"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          className="flex h-11 items-center justify-center text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary border-r border-border/20"
          onClick={(e) => { e.stopPropagation(); onVariation?.(); }}
          title="Generate Variation"
        >
          <Shuffle className="h-4 w-4" />
        </button>
        <button
          className="flex h-11 items-center justify-center text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
          onClick={(e) => { e.stopPropagation(); onUpload?.(); }}
          title="Upload Reference"
        >
          <Upload className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
