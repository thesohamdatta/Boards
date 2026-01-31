import { useStoryboardStore } from '@/stores/storyboardStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MessageSquare } from 'lucide-react';

export function ShotList() {
  const { scenes, shots, selectedShotId, setSelectedShotId } = useStoryboardStore();

  const getSceneForShot = (sceneId: string) => {
    return scenes.find((s) => s.id === sceneId);
  };

  // Highlight character names in blue
  const highlightCharacters = (text: string) => {
    const characters = ['Tyler', 'Jack', 'Bob', 'Marcus', 'Rourke', 'Mary', 'James'];
    let result = text;
    characters.forEach((char) => {
      const regex = new RegExp(`\\b${char}\\b`, 'gi');
      result = result.replace(
        regex,
        `<span class="text-link font-medium">${char}</span>`
      );
    });
    return result;
  };

  if (scenes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6">
        <p className="text-muted-foreground">No scenes available</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8">
      {scenes.map((scene) => (
        <div key={scene.id} className="mb-8">
          {/* Scene Header */}
          <div className="mb-4 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              SCENE {scene.sceneNumber}: {scene.location} – NIGHT
            </h2>
            <p className="text-sm text-muted-foreground">● {scene.lighting}</p>
          </div>

          {/* Shots Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/50">
                  <TableHead className="w-16 text-foreground font-semibold">SCENE</TableHead>
                  <TableHead className="w-16 text-foreground font-semibold">SHOT</TableHead>
                  <TableHead className="w-64 text-foreground font-semibold">DESCRIPTION</TableHead>
                  <TableHead className="w-16 text-foreground font-semibold">DIALOGUE</TableHead>
                  <TableHead className="w-16 text-foreground font-semibold">ERT</TableHead>
                  <TableHead className="w-20 text-foreground font-semibold">SIZE</TableHead>
                  <TableHead className="w-24 text-foreground font-semibold">PERSPECTIVE</TableHead>
                  <TableHead className="w-24 text-foreground font-semibold">MOVEMENT</TableHead>
                  <TableHead className="w-24 text-foreground font-semibold">EQUIPMENT</TableHead>
                  <TableHead className="w-20 text-foreground font-semibold">FOCAL LENGTH</TableHead>
                  <TableHead className="w-20 text-foreground font-semibold">ASPECT RATIO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shots
                  .filter((shot) => shot.sceneId === scene.id)
                  .map((shot) => (
                    <TableRow
                      key={shot.id}
                      className={`cursor-pointer border-border transition-colors ${
                        selectedShotId === shot.id
                          ? 'bg-link/10'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedShotId(shot.id)}
                    >
                      <TableCell className="text-center text-foreground">{scene.sceneNumber}</TableCell>
                      <TableCell className="text-center text-foreground">{shot.shotNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded bg-muted">
                            <img
                              src={shot.imageUrl || '/placeholder.svg'}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <p
                            className="text-sm text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: highlightCharacters(shot.description) }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <MessageSquare className="mx-auto h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="text-center text-foreground">{shot.duration} sec</TableCell>
                      <TableCell className="text-foreground">{shot.shotSize}</TableCell>
                      <TableCell className="text-foreground">{shot.cameraAngle}</TableCell>
                      <TableCell className="text-foreground">{shot.movement}</TableCell>
                      <TableCell className="text-foreground">{shot.equipment}</TableCell>
                      <TableCell className="text-foreground">{shot.focalLength}</TableCell>
                      <TableCell className="text-foreground">{shot.aspectRatio}</TableCell>
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
