import { useState, useRef, useEffect } from 'react';
import { useStoryboardStore } from '@/stores/storyboardStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bold, Italic, Underline, Search, Undo, Redo, Sparkles, Loader2, FileText } from 'lucide-react';
import { generateWithGemini } from '@/lib/gemini-client';
import { updateProject } from '@/lib/api';
import { toast } from 'sonner';

export function StoryView() {
  const { storyInput, setStoryInput, currentProject } = useStoryboardStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save script changes
  useEffect(() => {
    if (!currentProject?.id) return;

    const timeoutId = setTimeout(async () => {
      try {
        setIsSaving(true);
        await updateProject(currentProject.id, { script_text: storyInput });
        setIsSaving(false);
      } catch (error) {
        console.error('Failed to auto-save script:', error);
        setIsSaving(false);
      }
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [storyInput, currentProject?.id]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      toast.loading('Generating screenplay...');

      const prompt = storyInput.trim()
        ? `Continue the following screenplay in standard industry format (Fountain/Markdown). Maintain the tone and characters.
        
        Current Script:
        ${storyInput.slice(-2000)}` // Context window
        : `Write a compelling opening scene for a movie screenplay in standard industry format (Fountain/Markdown). Include Scene Heading, Action, Character, and Dialogue.`;

      const result = await generateWithGemini({
        prompt,
        temperature: 0.7,
        modelName: 'gemini-2.0-flash' // Use a fast, capable model
      });

      toast.dismiss();

      if (result.success) {
        const newContent = storyInput.trim()
          ? `${storyInput}\n\n${result.text}`
          : result.text;

        setStoryInput(newContent);
        toast.success('Screenplay generated!');
      } else {
        // Explicitly cast or check to satisfy TS if narrowing fails
        const errorMessage = 'error' in result ? result.error : 'Unknown error';
        toast.error(`Generation failed: ${errorMessage}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate screenplay');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);

    const newText = text.substring(0, start) + before + selection + after + text.substring(end);
    setStoryInput(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleHeadingSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;

    switch (value) {
      case 'Scene Heading':
        insertText('\n\nINT. LOCATION - DAY\n');
        break;
      case 'Action':
        insertText('\n', '\n');
        break;
      case 'Character':
        insertText('\n\nCHARACTER NAME\n');
        break;
      case 'Dialogue':
        insertText('\n(parenthetical)\n');
        break;
    }
    // Reset select
    e.target.value = '';
  };

  return (
    <div className="flex flex-1 flex-col bg-transparent p-6 gap-6 overflow-hidden">
      {/* Top controls */}
      <div className="flex items-center justify-between">
        {/* Tab switcher - MD3 Tonal Pill */}
        <div className="inline-flex rounded-2xl bg-muted/30 p-1.5 border border-border/50">
          <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-card text-foreground shadow-sm font-semibold text-sm transition-all">
            <FileText className="h-4 w-4 text-primary" />
            Screenplay
          </button>
          <button className="flex items-center gap-2 px-6 py-2 rounded-xl text-muted-foreground font-medium text-sm hover:text-foreground transition-all" disabled>
            Notes
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Soon</span>
          </button>
        </div>

        <button
          className="btn-filled group"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />}
          <span className="tracking-tight">{isGenerating ? 'Drafting...' : 'Magic Write'}</span>
        </button>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 flex flex-col min-h-0 bg-card rounded-[var(--radius-xl)] shadow-3 border border-border/50 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1.5 p-3 border-b border-border/50 bg-background/20 backdrop-blur-sm">
          <select
            className="rounded-full border border-border/50 bg-muted/50 px-5 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer hover:bg-muted"
            onChange={handleHeadingSelect}
            defaultValue=""
          >
            <option value="" disabled>FORMATTING</option>
            <option value="Scene Heading">SCENE HEADING</option>
            <option value="Action">ACTION</option>
            <option value="Character">CHARACTER</option>
            <option value="Dialogue">DIALOGUE</option>
          </select>

          <div className="h-6 w-px bg-border/50 mx-2" />

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all" onClick={() => insertText('**', '**')} title="Bold">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all" onClick={() => insertText('*', '*')} title="Italic">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all" onClick={() => insertText('_', '_')} title="Underline">
            <Underline className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border/50 mx-2" />

          <div className="flex-1" />{/* Spacer */}

          <div className="flex items-center gap-4 px-4">
            {isSaving && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Autosaving</span>
              </div>
            )}
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{storyInput.length} Characters</span>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 overflow-auto bg-card selection:bg-primary/30">
          <Textarea
            ref={textareaRef}
            value={storyInput}
            onChange={(e) => setStoryInput(e.target.value)}
            className="h-full min-h-full w-full resize-none border-0 p-12 font-mono text-base leading-[1.8] focus-visible:ring-0 bg-transparent text-foreground/90 placeholder:text-muted-foreground/30"
            placeholder="INT. STUDIO - DAY&#10;&#10;The blank page stares back. It's time to create..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
