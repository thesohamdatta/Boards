import { useState, useEffect } from 'react';
import { Upload, ArrowRight, FileText, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStoryboardStore } from '@/stores/storyboardStore';
import { createProject, parseScript } from '@/lib/api';
import { GENRES } from '@/types/storyboard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StoryInputProps {
  onContinue: () => void;
}

function StoryInput({ onContinue }: StoryInputProps) {
  const { storyInput, setStoryInput } = useStoryboardStore();
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      {/* Steps */}
      <div className="mb-8 flex justify-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-sm font-medium text-primary-foreground">1</span>
            <span className="text-sm font-medium text-foreground">Story Idea</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-0.5 text-sm">2</span>
            <span className="text-sm">Breakdown</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-0.5 text-sm">3</span>
            <span className="text-sm">Storyboard</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-8 text-center text-2xl font-semibold text-foreground">How would you like to start?</h1>

      {/* Content */}
      <div className="mx-auto flex w-full max-w-4xl gap-6">
        {/* Text input area */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-foreground">Describe your story idea</label>
          <Textarea
            value={storyInput}
            onChange={(e) => setStoryInput(e.target.value)}
            placeholder="Enter your script, treatment, or story concept..."
            className="min-h-[300px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Right panel */}
        <div className="w-72 space-y-4">
          <Button
            onClick={onContinue}
            disabled={!storyInput.trim()}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-border"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4" />
            Upload your file
            <span className="ml-auto text-xs text-muted-foreground">
              .pdf, .docx, .txt, .fdx
            </span>
          </Button>

          <Button variant="outline" className="w-full justify-start gap-2 border-border">
            <FileText className="h-4 w-4" />
            Import your shotlist
            <span className="ml-auto text-xs text-muted-foreground">
              Download template
            </span>
          </Button>

          {/* Tutorial Card */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Tutorial</p>
            <p className="mb-2 font-medium text-foreground">How to Get Started</p>
            <p className="text-xs text-muted-foreground">
              Watch a quick walkthrough to learn how to create your first storyboard in minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Upload Your File</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Upload a file as the foundation for your storyboard. This could be a treatment,
            director's notes, fully formatted industry standard FDX and Fountain screenplays,
            or any text that explains your idea or concept.
          </p>
          <div className="my-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <span className="mr-2">ℹ️</span>
            PDF or Word files that contain images (e.g. scans or screenshots) can't be interpreted.
            Please use a text-based version instead.
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12">
            <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">.pdf, .docx, .txt or .fdx, .fountain</p>
          </div>
          <div className="flex justify-end">
            <Button className="gap-2 bg-primary text-primary-foreground">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface GenreSelectionProps {
  onContinue: () => void;
}

function GenreSelection({ onContinue }: GenreSelectionProps) {
  const { selectedGenre, setSelectedGenre } = useStoryboardStore();

  return (
    <div className="flex flex-1 flex-col">
      {/* Steps */}
      <div className="mb-8 flex justify-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-0.5 text-sm">1</span>
            <span className="text-sm">Story Idea</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-sm font-medium text-primary-foreground">2</span>
            <span className="text-sm font-medium text-foreground">Breakdown</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-0.5 text-sm">3</span>
            <span className="text-sm">Storyboard</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-2 text-center text-2xl font-semibold text-foreground">What's your story's genre?</h1>
      <p className="mb-8 text-center text-muted-foreground">
        This shapes how your storyboard is structured. Tone, pacing, and visuals adapt to your choice.
      </p>

      {/* Genre Grid */}
      <div className="mx-auto mb-8 grid max-w-4xl grid-cols-4 gap-4">
        {GENRES.map((genre) => (
          <button
            key={genre.name}
            onClick={() => setSelectedGenre(genre.name)}
            className={cn(
              'rounded-lg border p-4 text-left transition-colors',
              selectedGenre === genre.name
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-muted-foreground'
            )}
          >
            <p className="mb-1 font-medium text-foreground">{genre.name}</p>
            <p className="text-xs text-muted-foreground">{genre.description}</p>
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={onContinue}
          disabled={!selectedGenre}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Generate Scene Breakdown
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface GeneratingProps {
  projectId: string | null;
  onComplete: () => void;
  onError: (error: string) => void;
}

function Generating({ projectId, onComplete, onError }: GeneratingProps) {
  const { storyInput, selectedGenre, generationProgress, addGenerationProgress, clearGenerationProgress } = useStoryboardStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('No project ID');
      return;
    }

    clearGenerationProgress();
    
    const runGeneration = async () => {
      try {
        // Step 1
        addGenerationProgress('Reading your story idea...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 2
        addGenerationProgress('Aligning your idea with the genre...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 3 - Call parse-script API
        addGenerationProgress('Identifying characters in your story...');
        
        const result = await parseScript(projectId, storyInput, selectedGenre || undefined);
        
        // Step 4
        addGenerationProgress('Creating scene breakdown...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (result.success) {
          toast.success(`Created ${result.scenes_created} scenes and ${result.characters_created} characters`);
          onComplete();
        } else {
          throw new Error(result.error || 'Failed to parse script');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Generation error:', err);
        setError(message);
        onError(message);
        toast.error(`Generation failed: ${message}`);
      }
    };

    runGeneration();
  }, [projectId]);

  const steps = [
    'Reading your story idea...',
    'Aligning your idea with the genre...',
    'Identifying characters in your story...',
    'Creating scene breakdown...',
  ];

  return (
    <div className="flex flex-1 flex-col">
      {/* Steps */}
      <div className="mb-8 flex justify-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-0.5 text-sm">1</span>
            <span className="text-sm">Story Idea</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-sm font-medium text-primary-foreground">2</span>
            <span className="text-sm font-medium text-foreground">Breakdown</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-0.5 text-sm">3</span>
            <span className="text-sm">Storyboard</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-2 text-center text-2xl font-semibold text-foreground">Generate Your Scene Breakdown</h1>
      <p className="mb-8 text-center text-muted-foreground">
        Let's turn your story idea into a structured scene breakdown laying the foundation for your storyboard.
      </p>

      {/* Progress */}
      <div className="mx-auto max-w-md">
        {error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Generation Failed</span>
            </div>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = generationProgress.includes(step);
              const isCurrent = generationProgress.length === index;
              
              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2',
                      isCompleted
                        ? 'border-primary bg-primary'
                        : isCurrent
                        ? 'border-primary'
                        : 'border-border'
                    )}
                  >
                    {isCompleted && <Check className="h-3 w-3 text-primary-foreground" />}
                    {isCurrent && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tip Card */}
      <div className="mx-auto mt-12 max-w-sm rounded-lg bg-primary p-4 text-primary-foreground">
        <p className="text-xs opacity-80">Pro Tip</p>
        <p className="mb-2 font-medium">Edit with your storyboard in mind</p>
        <p className="text-sm opacity-90">
          Tweak your scene breakdown into scenes so that each idea connects visually.
          This makes building your storyboard a breeze in the next step.
        </p>
      </div>
    </div>
  );
}

interface ProjectWizardProps {
  onComplete: (projectId: string) => void;
}

export function ProjectWizard({ onComplete }: ProjectWizardProps) {
  const { 
    wizardStep, 
    setWizardStep, 
    storyInput, 
    selectedGenre,
  } = useStoryboardStore();
  
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const handleStoryComplete = () => {
    setWizardStep('genre');
  };

  const handleGenreComplete = async () => {
    setIsCreatingProject(true);
    try {
      // Create project in database
      const title = storyInput.slice(0, 50).split('\n')[0] || 'Untitled Project';
      const project = await createProject(title, selectedGenre || undefined);
      setProjectId(project.id);
      setWizardStep('generating');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      toast.error(message);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleGenerationComplete = () => {
    if (projectId) {
      setWizardStep('breakdown');
      onComplete(projectId);
    }
  };

  const handleGenerationError = (error: string) => {
    console.error('Generation error:', error);
    // Stay on the generating page to show error
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-8">
      {wizardStep === 'story' && <StoryInput onContinue={handleStoryComplete} />}
      {wizardStep === 'genre' && (
        <GenreSelection onContinue={handleGenreComplete} />
      )}
      {isCreatingProject && (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {wizardStep === 'generating' && !isCreatingProject && (
        <Generating 
          projectId={projectId} 
          onComplete={handleGenerationComplete}
          onError={handleGenerationError}
        />
      )}
    </div>
  );
}
