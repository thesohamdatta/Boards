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
        'group overflow-hidden rounded-lg border bg-card transition-all cursor-pointer',
        isSelected 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'border-border hover:border-muted-foreground/30'
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {/* Video indicator */}
        <div className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded bg-foreground/80">
          <Video className="h-4 w-4 text-background" />
        </div>
        
        <img
          src={shot.imageUrl || '/placeholder.svg'}
          alt={`Scene ${sceneNumber}, Shot ${shot.shotNumber}`}
          className="h-full w-full object-cover"
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Info */}
      <div className="border-b border-border p-4">
        <div className="mb-2 text-sm font-semibold text-foreground">
          Scene: {sceneNumber} | Shot: {shot.shotNumber}
        </div>
        <p
          className="line-clamp-3 text-sm leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: highlightCharacters(shot.description) }}
        />
      </div>

      {/* Actions - 2x2 grid matching reference */}
      <div className="grid grid-cols-2">
        <button
          className="flex items-center justify-center gap-1.5 border-r border-b border-border bg-muted/50 px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        >
          EDIT
        </button>
        <button
          className="flex items-center justify-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onRetry?.();
          }}
        >
          <RefreshCw className="h-3 w-3" />
          RETRY
        </button>
        <button
          className="flex items-center justify-center gap-1.5 border-r border-border bg-muted/50 px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onVariation?.();
          }}
        >
          VARIATION
        </button>
        <button
          className="flex items-center justify-center gap-1.5 bg-muted/50 px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onUpload?.();
          }}
        >
          UPLOAD
        </button>
      </div>
    </div>
  );
}
