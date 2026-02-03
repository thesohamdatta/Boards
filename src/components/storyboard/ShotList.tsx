import { useStoryboardStore } from '@/stores/storyboardStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MessageSquare, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ShotList() {
  const { scenes, shots, selectedShotId, setSelectedShotId, characters } = useStoryboardStore();

  const getSceneForShot = (sceneId: string) => {
    return scenes.find((s) => s.id === sceneId);
  };

  // Highlight character names
  const highlightCharacters = (text: string) => {
    if (!text) return '';

    // Use project characters or fallback to defaults
    const charNames = characters.length > 0
      ? characters.map(c => c.name)
      : ['Tyler', 'Jack', 'Bob', 'Marcus', 'Rourke', 'Mary', 'James'];

    let result = text;
    charNames.forEach((char) => {
      const regex = new RegExp(`\\b${char}\\b`, 'gi');
      result = result.replace(
        regex,
        `<span class="text-primary font-bold shadow-[0_1px_0_0_currentColor]">${char}</span>`
      );
    });
    return result;
  };

  if (scenes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center surface-dim py-32 text-center">
        <div className="mb-6 h-16 w-16 flex items-center justify-center rounded-3xl bg-muted/50 border border-border/50 shadow-1">
          <List className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Analysis Pending</h3>
        <p className="text-muted-foreground max-w-xs">Your shot list will appear once you break down a script.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto surface-dim p-10 custom-scrollbar">
      {scenes.map((scene) => (
        <div key={scene.id} className="mb-12">
          {/* Scene Header - MD3 Surface Overlay Style */}
          <div className="mb-6 flex flex-col items-center">
            <div className="px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-3 border border-primary/20">
              Scene {scene.sceneNumber}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">
              {scene.location}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{scene.lighting}</p>
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
          </div>

          {/* Shots Table - MD3 Card Style */}
          <div className="rounded-[var(--radius-xl)] border border-border/50 bg-card overflow-hidden shadow-2">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 bg-muted/30">
                  <TableHead className="w-16 text-[10px] font-bold uppercase tracking-widest text-foreground/90 pl-6">#</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-foreground/90">Visual Composition</TableHead>
                  <TableHead className="w-16 text-center"><MessageSquare className="h-4 w-4 mx-auto text-muted-foreground/70" /></TableHead>
                  <TableHead className="w-24 text-[10px] font-bold uppercase tracking-widest text-foreground/90">Duration</TableHead>
                  <TableHead className="w-24 text-[10px] font-bold uppercase tracking-widest text-foreground/90">Size</TableHead>
                  <TableHead className="w-24 text-[10px] font-bold uppercase tracking-widest text-foreground/90">Angle</TableHead>
                  <TableHead className="w-24 text-[10px] font-bold uppercase tracking-widest text-foreground/90">Movement</TableHead>
                  <TableHead className="w-24 text-[10px] font-bold uppercase tracking-widest text-foreground/90 pr-6">Equipment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shots
                  .filter((shot) => shot.sceneId === scene.id)
                  .map((shot) => (
                    <TableRow
                      key={shot.id}
                      className={cn(
                        "cursor-pointer border-border/20 transition-all duration-200 group",
                        selectedShotId === shot.id ? "bg-primary/10" : "hover:bg-muted/30"
                      )}
                      onClick={() => setSelectedShotId(shot.id)}
                    >
                      <TableCell className="pl-6 text-sm font-black text-primary/50 group-hover:text-primary transition-colors">
                        {shot.shotNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4 py-2">
                          <div className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/50 shadow-sm transition-transform duration-500 group-hover:scale-105">
                            <img
                              src={shot.imageUrl || '/placeholder.svg'}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <p
                            className="text-sm font-medium leading-relaxed text-foreground/90 max-w-xl"
                            dangerouslySetInnerHTML={{ __html: highlightCharacters(shot.description) }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <MessageSquare className="mx-auto h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                      </TableCell>
                      <TableCell className="text-xs font-bold text-muted-foreground/90">{shot.duration}s</TableCell>
                      <TableCell className="text-xs font-bold tracking-tight text-foreground/90">{shot.shotSize}</TableCell>
                      <TableCell className="text-xs font-bold tracking-tight text-foreground/90">{shot.cameraAngle}</TableCell>
                      <TableCell className="text-xs font-bold tracking-tight text-foreground/90">{shot.movement}</TableCell>
                      <TableCell className="pr-6 text-xs font-bold tracking-tight text-foreground/90">{shot.equipment}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
