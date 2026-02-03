import { useState } from 'react';
import { RefreshCw, Upload, Plus, Trash2, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStoryboardStore } from '@/stores/storyboardStore';
import { Character } from '@/types/storyboard';
import { toast } from 'sonner';

interface CharacterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CharacterModal({ open, onOpenChange }: CharacterModalProps) {
  const { characters, addCharacter, updateCharacter, deleteCharacter, currentProject, settings } = useStoryboardStore();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', appearance: '' });

  const handleSelectCharacter = (char: Character) => {
    setSelectedCharacter(char);
    setIsEditing(false);
    setEditForm({
      name: char.name,
      description: char.description,
      appearance: char.appearance || ''
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedCharacter) {
      updateCharacter(selectedCharacter.id, {
        name: editForm.name,
        description: editForm.description,
        appearance: editForm.appearance,
      });
      setIsEditing(false);
    }
  };

  const handleAddNew = () => {
    if (!currentProject) return;
    const newChar: Character = {
      id: `char-${Date.now()}`,
      projectId: currentProject.id,
      name: 'New Character',
      description: 'Character description...',
      appearance: '',
      imageUrl: '/placeholder.svg',
    };
    addCharacter(newChar);
    setSelectedCharacter(newChar);
    setIsEditing(true);
    setEditForm({ name: newChar.name, description: newChar.description, appearance: '' });
  };

  const handleGenerateReference = async () => {
    if (!selectedCharacter || !currentProject) return;

    setIsGenerating(true);
    try {
      const { generateShotImage } = await import('@/lib/api');

      // Formulate a portrait prompt
      const portraitPrompt = `Cinematic portrait of ${editForm.name}. ${editForm.appearance}. ${editForm.description}. Neutral background, studio lighting.`;

      const result = await generateShotImage(
        selectedCharacter.id,
        "Portrait Studio",
        portraitPrompt,
        "Eye Level",
        "Close Up",
        [], // No other characters for portrait
        { style: settings.imageStyle },
        settings.aiModel
      );

      if (result.success) {
        updateCharacter(selectedCharacter.id, {
          imageUrl: result.panel.image_url
        });
        toast.success("Actor visual generated");
      }
    } catch (e) {
      console.error("Failed to generate character reference:", e);
      toast.error("Failed to generate actor visual");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = () => {
    if (selectedCharacter) {
      deleteCharacter(selectedCharacter.id);
      setSelectedCharacter(null);
      setIsEditing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border-border/50 shadow-3 rounded-[var(--radius-xl)] p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground uppercase">
              Cast & Characters
            </DialogTitle>
            <p className="text-xs font-bold uppercase tracking-widest text-primary/80">
              {currentProject?.name || "Global Assets"}
            </p>
          </div>
          <div className="flex gap-2">
            {!selectedCharacter && (
              <button
                onClick={handleAddNew}
                className="btn-filled h-10 px-4 text-xs"
              >
                <Plus className="h-4 w-4" />
                Add Actor
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="p-8 pt-6">
          {!selectedCharacter ? (
            // Character Grid
            <div className="grid grid-cols-4 gap-4">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/30 bg-muted/20 p-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
                  onClick={() => handleSelectCharacter(char)}
                >
                  <div className="mb-3 aspect-square overflow-hidden rounded-xl border border-border/20 shadow-inner">
                    <img
                      src={char.imageUrl || '/placeholder.svg'}
                      alt={char.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="px-1 pb-1">
                    <p className="truncate text-xs font-black uppercase tracking-widest text-foreground/80">{char.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground/60 font-medium">{char.description}</p>
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl">
                      <Pencil className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Block */}
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/30 bg-muted/5 p-4 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                onClick={handleAddNew}
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Actor</p>
              </div>
            </div>
          ) : (
            // Character Detail View
            <div className="flex gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Image & Controls */}
              <div className="w-56 flex-shrink-0">
                <div className="group relative mb-6 aspect-square overflow-hidden rounded-3xl border border-border/30 bg-muted ring-4 ring-primary/10 shadow-2">
                  <img
                    src={selectedCharacter.imageUrl || '/placeholder.svg'}
                    alt={selectedCharacter.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-primary"
                      onClick={handleGenerateReference}
                      disabled={isGenerating}
                    >
                      {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-primary">
                      <Upload className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/20">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Actor Guidance</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Defining specific physical traits here helps the AI keep the actor consistent across scenes.</p>
                  </div>
                </div>
              </div>

              {/* Form & Actions */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity</Label>
                      <Input
                        value={isEditing ? editForm.name : selectedCharacter.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        disabled={!isEditing}
                        className="h-12 border-border/50 bg-background/50 px-5 text-lg font-bold tracking-tight focus-visible:ring-primary/20"
                        placeholder="Character Name..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Appearance (AI Trigger)</Label>
                      <Input
                        value={isEditing ? editForm.appearance : (selectedCharacter.appearance || '')}
                        onChange={(e) => setEditForm({ ...editForm, appearance: e.target.value })}
                        disabled={!isEditing}
                        className="h-10 border-border/50 bg-background/50 px-4 text-sm font-bold tracking-tight focus-visible:ring-primary/20"
                        placeholder="e.g. Blond hair, blue suit, scar on chin..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description & Vibe</Label>
                      <Textarea
                        value={isEditing ? editForm.description : selectedCharacter.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        disabled={!isEditing}
                        rows={3}
                        className="border-border/50 bg-background/50 p-5 leading-relaxed text-sm font-medium focus-visible:ring-primary/20 resize-none"
                        placeholder="Character background and personality..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-border/20 mt-8">
                  <button
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setSelectedCharacter(null)}
                  >
                    <Plus className="h-4 w-4 rotate-45" /> Back to Cast
                  </button>
                  {isEditing ? (
                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl px-6">CANCEL</Button>
                      <Button onClick={handleSave} className="btn-filled px-8 shadow-primary/20">CONFIRM CHANGES</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={handleDelete} className="h-11 px-5 rounded-xl text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={handleEdit} className="btn-tonal h-11 px-8 rounded-xl">
                        <Pencil className="mr-2 h-4 w-4" />
                        MODIFY ACTOR
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
