import { useState } from 'react';
import { RefreshCw, Upload, Plus, Trash2, Pencil } from 'lucide-react';
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

interface CharacterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CharacterModal({ open, onOpenChange }: CharacterModalProps) {
  const { characters, addCharacter, updateCharacter, deleteCharacter, currentProject } = useStoryboardStore();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const handleSelectCharacter = (char: Character) => {
    setSelectedCharacter(char);
    setIsEditing(false);
    setEditForm({ name: char.name, description: char.description });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedCharacter) {
      updateCharacter(selectedCharacter.id, {
        name: editForm.name,
        description: editForm.description,
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
      imageUrl: '/placeholder.svg',
    };
    addCharacter(newChar);
    setSelectedCharacter(newChar);
    setIsEditing(true);
    setEditForm({ name: newChar.name, description: newChar.description });
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
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4 text-foreground">
            Your Characters
            {currentProject && (
              <span className="rounded border border-border px-2 py-0.5 text-sm font-normal text-muted-foreground">
                {currentProject.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!selectedCharacter ? (
          // Character Grid
          <div className="grid grid-cols-4 gap-4">
            {characters.map((char) => (
              <div
                key={char.id}
                className="cursor-pointer rounded-lg border border-border bg-card p-2 transition-colors hover:border-link"
                onClick={() => handleSelectCharacter(char)}
              >
                <div className="mb-2 aspect-square overflow-hidden rounded bg-muted">
                  <img
                    src={char.imageUrl || '/placeholder.svg'}
                    alt={char.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="truncate text-center text-sm font-medium text-foreground">{char.name}</p>
                <div className="mt-2 flex justify-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button variant="secondary" size="sm" className="h-6 text-xs">
                    EDIT
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add New */}
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border p-2 transition-colors hover:border-link"
              onClick={handleAddNew}
            >
              <Plus className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Add New</p>
              <Button variant="secondary" size="sm" className="mt-2 h-6 text-xs">
                Add
              </Button>
            </div>
          </div>
        ) : (
          // Character Detail View
          <div className="flex gap-6">
            {/* Image */}
            <div className="w-48 flex-shrink-0">
              <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-muted ring-2 ring-link ring-offset-2">
                <img
                  src={selectedCharacter.imageUrl || '/placeholder.svg'}
                  alt={selectedCharacter.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <RefreshCw className="h-3 w-3" />
                  RETRY
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <Upload className="h-3 w-3" />
                  UPLOAD
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="mb-2 text-sm font-medium text-foreground">Character Settings</h4>
                <p className="mb-3 text-sm text-muted-foreground">
                  How should this character appear in your storyboard?
                </p>
                <RadioGroup defaultValue="description">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="description" id="description" />
                    <Label htmlFor="description" className="text-foreground">Based on description reference</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="image" />
                    <Label htmlFor="image" className="text-foreground">Based on image reference</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-foreground">{selectedCharacter.name}</h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground">Name</Label>
                    <Input
                      value={isEditing ? editForm.name : selectedCharacter.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      disabled={!isEditing}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Description or Lookalike</Label>
                    <Textarea
                      value={isEditing ? editForm.description : selectedCharacter.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                      className="bg-background border-border"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(isEditing ? editForm.description : selectedCharacter.description).length}/300
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  className="text-sm text-link hover:underline"
                  onClick={() => setSelectedCharacter(null)}
                >
                  ← Character List
                </button>
                {isEditing ? (
                  <Button onClick={handleSave} className="bg-primary text-primary-foreground">SAVE</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDelete}>
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                    <Button onClick={handleEdit} className="bg-primary text-primary-foreground">
                      <Pencil className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
