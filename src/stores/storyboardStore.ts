import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Scene, Shot, Character, Genre, WizardStep, Settings, DEFAULT_SETTINGS } from '@/types/storyboard';
import storyboardSample1 from '@/assets/storyboard-sample-1.jpg';
import storyboardSample2 from '@/assets/storyboard-sample-2.jpg';
import storyboardSample3 from '@/assets/storyboard-sample-3.jpg';
import characterTyler from '@/assets/character-tyler.jpg';
import characterJack from '@/assets/character-jack.jpg';

interface StoryboardState {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  settings: Settings;

  // Wizard state
  wizardStep: WizardStep;
  storyInput: string;
  selectedGenre: Genre | null;
  isGenerating: boolean;
  generationProgress: string[];

  // Scenes & Shots
  scenes: Scene[];
  shots: Shot[];

  // Characters
  characters: Character[];

  // UI State
  activeView: 'storyboard' | 'shotlist' | 'story' | 'animatic';
  selectedShotId: string | null;
  isCharacterModalOpen: boolean;

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string) => Project;

  setWizardStep: (step: WizardStep) => void;
  setStoryInput: (input: string) => void;
  setSelectedGenre: (genre: Genre | null) => void;
  setIsGenerating: (generating: boolean) => void;
  addGenerationProgress: (progress: string) => void;
  clearGenerationProgress: () => void;

  setScenes: (scenes: Scene[]) => void;
  setShots: (shots: Shot[]) => void;
  updateShot: (shotId: string, updates: Partial<Shot>) => void;

  setCharacters: (characters: Character[]) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  deleteCharacter: (characterId: string) => void;

  setActiveView: (view: 'storyboard' | 'shotlist' | 'story' | 'animatic') => void;
  setSelectedShotId: (shotId: string | null) => void;
  setIsCharacterModalOpen: (open: boolean) => void;
  reorderShots: (activeId: string, overId: string) => void;

  resetWizard: () => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

// Mock data for demo
const mockScenes: Scene[] = [
  {
    id: 'scene-1',
    projectId: 'project-1',
    sceneNumber: 1,
    location: 'INT. HIGH-RISE SOCIAL ROOM',
    lighting: 'DIM ARTIFICIAL LIGHT',
    description: 'Night presses against the glass walls, the city seventy-one stories below.',
  },
];

const mockShots: Shot[] = [
  {
    id: 'shot-1',
    sceneId: 'scene-1',
    shotNumber: 1,
    description: 'Tyler pins Jack on the polished floor near the glass wall, forcing Jack\'s upper body back toward the window. The city glows far below.',
    cameraAngle: 'Low angle',
    shotSize: 'Wide',
    movement: 'Slow push-in',
    equipment: 'Steady cam',
    duration: 5,
    focalLength: '24mm',
    aspectRatio: '16:9',
    imageUrl: storyboardSample1,
  },
  {
    id: 'shot-2',
    sceneId: 'scene-1',
    shotNumber: 2,
    description: 'Jack\'s head is cranked back toward the glass as the suppressed handgun is jammed between his teeth. His jaw strains around the metal.',
    cameraAngle: 'Eye-level',
    shotSize: 'Close-up',
    movement: 'Static',
    equipment: 'Handheld',
    duration: 4,
    focalLength: '50mm',
    aspectRatio: '16:9',
    imageUrl: storyboardSample2,
  },
  {
    id: 'shot-3',
    sceneId: 'scene-1',
    shotNumber: 3,
    description: 'Jack\'s eyes fix on the gun barrel in his mouth, his expression going strangely calm despite the strain in his neck.',
    cameraAngle: 'High angle',
    shotSize: 'Close-up',
    movement: 'Static',
    equipment: 'Tripod',
    duration: 3,
    focalLength: '85mm',
    aspectRatio: '16:9',
    imageUrl: storyboardSample3,
  },
  {
    id: 'shot-4',
    sceneId: 'scene-1',
    shotNumber: 4,
    description: 'Tyler leans close over Jack, one hand grinding the gun deeper into Jack\'s mouth as he flicks a quick look at his watch.',
    cameraAngle: 'Over shoulder',
    shotSize: 'Medium',
    movement: 'Subtle track',
    equipment: 'Dolly',
    duration: 4,
    focalLength: '35mm',
    aspectRatio: '16:9',
    imageUrl: storyboardSample1,
  },
  {
    id: 'shot-5',
    sceneId: 'scene-1',
    shotNumber: 5,
    description: 'Jack forces a tiny movement of his jaw against the barrel, his lips dragging around the metal as he strains to form words.',
    cameraAngle: 'Eye-level',
    shotSize: 'Extreme close-up',
    movement: 'Static',
    equipment: 'Macro lens',
    duration: 3,
    focalLength: '100mm',
    aspectRatio: '16:9',
    imageUrl: storyboardSample2,
  },
  {
    id: 'shot-6',
    sceneId: 'scene-1',
    shotNumber: 6,
    description: 'Tyler heaves Jack sideways into the glass, forcing Jack\'s face to turn so his eyes point straight down the drop.',
    cameraAngle: 'Dutch angle',
    shotSize: 'Wide',
    movement: 'Whip pan',
    equipment: 'Handheld',
    duration: 2,
    focalLength: '24mm',
    aspectRatio: '16:9',
    imageUrl: storyboardSample3,
  },
];

const mockCharacters: Character[] = [
  { id: 'char-1', projectId: 'project-1', name: 'Tyler', description: 'Late 20s, blond hair sweat-plastered, eyes blazing with manic conviction.', imageUrl: characterTyler },
  { id: 'char-2', projectId: 'project-1', name: 'Jack', description: 'Early 30s, bruised and exhausted, fingers clawing desperately.', imageUrl: characterJack },
];

export const useStoryboardStore = create<StoryboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: [],
      currentProject: null,
      settings: DEFAULT_SETTINGS,

      wizardStep: 'story',
      storyInput: '',
      selectedGenre: null,
      isGenerating: false,
      generationProgress: [],

      scenes: [],
      shots: [],
      characters: [],

      activeView: 'storyboard',
      selectedShotId: null,
      isCharacterModalOpen: false,

      // Actions
      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),

      createProject: (name) => {
        const project: Project = {
          id: `project-${Date.now()}`,
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ projects: [...state.projects, project], currentProject: project }));
        return project;
      },

      setWizardStep: (step) => set({ wizardStep: step }),
      setStoryInput: (input) => set({ storyInput: input }),
      setSelectedGenre: (genre) => set({ selectedGenre: genre }),
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      addGenerationProgress: (progress) => set((state) => ({
        generationProgress: [...state.generationProgress, progress]
      })),
      clearGenerationProgress: () => set({ generationProgress: [] }),

      setScenes: (scenes) => set({ scenes }),
      setShots: (shots) => set({ shots }),
      updateShot: (shotId, updates) => set((state) => ({
        shots: state.shots.map((shot) =>
          shot.id === shotId ? { ...shot, ...updates } : shot
        ),
      })),

      setCharacters: (characters) => set({ characters }),
      addCharacter: (character) => set((state) => ({
        characters: [...state.characters, character]
      })),
      updateCharacter: (characterId, updates) => set((state) => ({
        characters: state.characters.map((char) =>
          char.id === characterId ? { ...char, ...updates } : char
        ),
      })),
      deleteCharacter: (characterId) => set((state) => ({
        characters: state.characters.filter((char) => char.id !== characterId),
      })),

      setActiveView: (view) => set({ activeView: view }),
      setSelectedShotId: (shotId) => set({ selectedShotId: shotId }),
      setIsCharacterModalOpen: (open) => set({ isCharacterModalOpen: open }),

      reorderShots: (activeId, overId) => {
        const { shots } = get();
        const activeIndex = shots.findIndex((s) => s.id === activeId);
        const overIndex = shots.findIndex((s) => s.id === overId);

        if (activeIndex === -1 || overIndex === -1) return;

        const newShots = [...shots];
        const [movedShot] = newShots.splice(activeIndex, 1);
        newShots.splice(overIndex, 0, movedShot);

        // Re-number shots within the scene to maintain sequence integrity
        const sceneId = movedShot.sceneId;
        let counter = 1;
        const normalizedShots = newShots.map((s) => {
          if (s.sceneId === sceneId) {
            return { ...s, shotNumber: counter++ };
          }
          return s;
        });

        set({ shots: normalizedShots });
      },

      resetWizard: () => set({
        wizardStep: 'story',
        storyInput: '',
        selectedGenre: null,
        isGenerating: false,
        generationProgress: [],
      }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'boards-storage',
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
        settings: state.settings,
      }),
    }
  )
);

// Helper to load mock data for demo
export const loadMockData = () => {
  const store = useStoryboardStore.getState();
  store.setScenes(mockScenes);
  store.setShots(mockShots);
  store.setCharacters(mockCharacters);
};
