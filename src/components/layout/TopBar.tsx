import { useState } from 'react';
import { Pencil, Download, Share2, Settings, Users, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStoryboardStore } from '@/stores/storyboardStore';
import { toast } from 'sonner';
import { updateProject } from '@/lib/api';

interface TopBarProps {
  onExport?: () => void;
  onCharacterEditor?: () => void;
  onSettings?: () => void;
}

export function TopBar({ onExport, onCharacterEditor, onSettings }: TopBarProps) {
  const { currentProject, setCurrentProject } = useStoryboardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(currentProject?.name || '');

  if (!currentProject) return null;

  const handleSaveName = async () => {
    if (projectName.trim() && projectName !== currentProject.name) {
      try {
        await updateProject(currentProject.id, { title: projectName });
        setCurrentProject({ ...currentProject, name: projectName });
        toast.success('Project name updated');
      } catch (error) {
        toast.error('Failed to update project name');
      }
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setProjectName(currentProject.name);
    setIsEditing(false);
  };

  const handleShare = () => {
    // Copy project URL to clipboard
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Project link copied to clipboard');
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-border/20 bg-background/50 px-8 backdrop-blur-xl z-10">
      <div className="flex items-center gap-6">
        {isEditing ? (
          <div className="flex items-center gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border/30 shadow-inner">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="h-10 w-80 bg-transparent border-0 focus-visible:ring-0 text-lg font-black tracking-tight"
              autoFocus
            />
            <div className="flex gap-1.5 pr-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-xl hover:bg-primary/20 hover:text-primary transition-all"
                onClick={handleSaveName}
              >
                <Check className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-xl hover:bg-destructive/20 hover:text-destructive transition-all"
                onClick={handleCancelEdit}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 group">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase leading-none">{currentProject.name}</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl p-2 text-muted-foreground opacity-20 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-accent" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Active Project Architecture</span>
              </div>
            </div>
          </div>
        )}
        {currentProject.genre && (
          <Badge variant="secondary" className="px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-[0.1em] bg-primary/10 text-primary border border-primary/20 shadow-sm ml-2">
            {currentProject.genre}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded-2xl border border-border/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCharacterEditor}
            className="h-10 gap-2.5 rounded-xl px-5 text-xs font-black uppercase tracking-widest hover:bg-background/80 hover:text-primary hover:shadow-sm transition-all"
          >
            <Users className="h-4 w-4" />
            Cast
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-10 gap-2.5 rounded-xl px-5 text-xs font-black uppercase tracking-widest hover:bg-background/80 hover:text-primary hover:shadow-sm transition-all"
          >
            <Share2 className="h-4 w-4" />
            Distribute
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="h-10 gap-2.5 rounded-xl px-5 text-xs font-black uppercase tracking-widest hover:bg-background/80 hover:text-primary hover:shadow-sm transition-all"
          >
            <Download className="h-4 w-4" />
            Produce
          </Button>
        </div>

        <div className="h-10 w-px bg-border/20 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
          onClick={onSettings}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
