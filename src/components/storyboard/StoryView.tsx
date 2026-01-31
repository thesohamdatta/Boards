import { useStoryboardStore } from '@/stores/storyboardStore';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Search, Undo, Redo, Sparkles } from 'lucide-react';

export function StoryView() {
  const { storyInput, setStoryInput } = useStoryboardStore();

  const sampleScreenplay = `1 INT. HIGH-RISE SOCIAL ROOM – NIGHT

Night presses against the glass walls, the city seventy-one stories below a dead grid of sodium light. TYLER, blond hair sweat-plastered, eyes blazing, wrestles with JACK on the polished floor, a SUPPRESSED HANDGUN jammed between Jack's teeth, forcing his head back to the window.

Jack, bruised and exhausted, gags and mumbles broken vowels around the metal, fingers clawing at Tyler's wrist as his VOICEOVER calmly dissects how a barrel in your mouth makes consonants impossible, how he can taste the drilled holes in the silencer.

                              TYLER
              We won't really die. We'll be immortal.

He glances at his watch with manic conviction. Jack forces out a slurred reply past the gun.

                              JACK
              You're thinking of vampires.

Tyler shoves him harder into the glass, twisting Jack's head so he's staring straight down the sheer drop. They lunge, SLAM into a table, sending it crashing, the gun skittering away as Jack's VOICEOVER drifts into clinical instructions on nitroglycerin and the building's demolition layout.

Both men dive; Tyler snatches the gun first, drags Jack back to the window, barrel back in his mouth, hissing in his ear.

                              TYLER
              This is our world now. Two minutes.

                                                         CUT TO:

2 INT. HIGH SCHOOL GYMNASIUM – NIGHT

Fluorescent gloom washes a cavernous gym, air thick with sour sweat and disinfectant. Folding chairs form loose circles beneath a hand-lettered banner: "REMAINING MEN TOGETHER." Clusters of MEN cling to each other, weeping, murmuring about surgeries and lost futures.

JACK's face is mashed into the vast, sweaty chest of BOB, whose massive arms enfold him in a crushing embrace.`;

  return (
    <div className="flex flex-1 flex-col bg-background p-8">
      {/* Top controls */}
      <div className="mb-6 flex items-center justify-between">
        {/* Tab switcher */}
        <div className="inline-flex rounded-lg bg-muted p-1">
          <Button variant="secondary" size="sm" className="bg-card text-foreground shadow-sm">
            Screenplay
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Shotlist
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Storyboard
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Export
          </Button>
        </div>

        <Button className="gap-2 bg-sidebar text-sidebar-foreground hover:bg-sidebar/90">
          <Sparkles className="h-4 w-4" />
          Generate Screenplay
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card p-2">
        <select className="rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground">
          <option>Choose heading</option>
          <option>Scene Heading</option>
          <option>Action</option>
          <option>Character</option>
          <option>Dialogue</option>
        </select>
        <div className="h-6 w-px bg-border" />
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Underline className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-card px-12 py-8">
        <div className="mx-auto max-w-3xl">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
            <span className="text-primary font-semibold">1</span> <span className="text-primary font-bold">INT. HIGH-RISE SOCIAL ROOM – NIGHT</span>
            {`

Night presses against the glass walls, the city seventy-one stories below a dead grid of sodium light. `}<span className="text-primary font-medium">TYLER</span>{`, blond hair sweat-plastered, eyes blazing, wrestles with `}<span className="text-primary font-medium">JACK</span>{` on the polished floor, a SUPPRESSED HANDGUN jammed between Jack's teeth, forcing his head back to the window.

Jack, bruised and exhausted, gags and mumbles broken vowels around the metal, fingers clawing at Tyler's wrist as his VOICEOVER calmly dissects how a barrel in your mouth makes consonants impossible, how he can taste the drilled holes in the silencer.

                              `}<span className="text-primary font-semibold">TYLER</span>{`
              We won't really die. We'll be immortal.

He glances at his watch with manic conviction. Jack forces out a slurred reply past the gun.

                              `}<span className="text-primary font-semibold">JACK</span>{`
              You're thinking of vampires.

Tyler shoves him harder into the glass, twisting Jack's head so he's staring straight down the sheer drop. They lunge, SLAM into a table, sending it crashing, the gun skittering away as Jack's VOICEOVER drifts into clinical instructions on nitroglycerin and the building's demolition layout.

Both men dive; Tyler snatches the gun first, drags Jack back to the window, barrel back in his mouth, hissing in his ear.

                              `}<span className="text-primary font-semibold">TYLER</span>{`
              This is our world now. Two minutes.

                                                         CUT TO:

`}<span className="text-primary font-semibold">2</span> <span className="text-primary font-bold">INT. HIGH SCHOOL GYMNASIUM – NIGHT</span>{`

Fluorescent gloom washes a cavernous gym, air thick with sour sweat and disinfectant. Folding chairs form loose circles beneath a hand-lettered banner: "REMAINING MEN TOGETHER." Clusters of MEN cling to each other, weeping, murmuring about surgeries and lost futures.

`}<span className="text-primary font-medium">JACK</span>{`'s face is mashed into the vast, sweaty chest of `}<span className="text-primary font-medium">BOB</span>{`, whose massive arms enfold him in a crushing embrace.`}
          </pre>
        </div>
      </div>
    </div>
  );
}
