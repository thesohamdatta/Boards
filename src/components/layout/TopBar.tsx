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
    <header className="flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground">
      <div className="flex items-center gap-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="h-8 w-64 bg-sidebar-accent border-sidebar-border"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleSaveName}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleCancelEdit}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-sidebar-foreground">{currentProject.name}</h1>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </>
        )}
        {currentProject.genre && (
          <Badge className="bg-sidebar-accent text-sidebar-foreground/80 text-xs border-0">
            {currentProject.genre}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCharacterEditor}
          className="gap-2 border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Users className="h-4 w-4" />
          Characters
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-2 border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="gap-2 border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={onSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
