export interface Project {
  id: string;
  name: string;
  genre?: string;
  createdAt: Date;
  updatedAt: Date;
  script_text?: string | null;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface Scene {
  id: string;
  projectId: string;
  sceneNumber: number;
  location: string;
  lighting: string;
  description: string;
}

export interface Shot {
  id: string;
  sceneId: string;
  shotNumber: number;
  description: string;
  cameraAngle: string;
  shotSize: string;
  movement: string;
  equipment: string;
  duration: number;
  focalLength: string;
  aspectRatio: string;
  imageUrl?: string;
  promptUsed?: string;
  visualStyle?: string;
  lightingMood?: string;
  composition?: string;
}

export interface StoryboardPanel {
  id: string;
  shotId: string;
  imageUrl: string;
  promptUsed: string;
  version: number;
}

export type Genre =
  | 'Action'
  | 'Animation'
  | 'Comedy'
  | 'Commercial'
  | 'Documentary'
  | 'Drama'
  | 'Educational'
  | 'Fantasy'
  | 'Horror'
  | 'Music Video'
  | 'Mystery'
  | 'Romance'
  | 'Science Fiction'
  | 'Thriller';

export const GENRES: { name: Genre; description: string }[] = [
  { name: 'Action', description: 'Fast-paced, high-stakes scenes with movement and tension.' },
  { name: 'Animation', description: 'Stylized, imaginative visuals and exaggerated motion.' },
  { name: 'Comedy', description: 'Lighthearted, funny, and driven by timing.' },
  { name: 'Commercial', description: 'Short, impactful stories that promote a message or product.' },
  { name: 'Documentary', description: 'Real stories told with interviews and observation.' },
  { name: 'Drama', description: 'Emotional, character-driven storytelling.' },
  { name: 'Educational', description: 'Clear, structured content designed to explain or teach.' },
  { name: 'Fantasy', description: 'Magical worlds, mythical creatures, and epic themes.' },
  { name: 'Horror', description: 'Suspenseful, dark, and built to create fear.' },
  { name: 'Music Video', description: 'Visually rhythmic and expressive, led by music.' },
  { name: 'Mystery', description: 'Twists, clues, and uncovering the unknown.' },
  { name: 'Romance', description: 'Stories of love, connection, and emotion.' },
  { name: 'Science Fiction', description: 'Futuristic tech, space, or speculative ideas.' },
  { name: 'Thriller', description: 'Tense, fast-moving plots with danger and suspense.' },
];

export type WizardStep = 'story' | 'genre' | 'generating' | 'breakdown';

export interface Settings {
  // General
  autoSave: boolean;
  autoSaveInterval: number;
  defaultAspectRatio: string;
  defaultFrameRate: number;

  // Canvas
  showGrid: boolean;
  gridType: 'rule-of-thirds' | 'perspective' | 'square' | 'none';
  canvasBackground: string;
  strokeColor: string;
  strokeWidth: number;

  // AI
  aiModel: string;
  aiTemperature: number;
  autoGenerateImages: boolean;
  imageStyle: 'sketch' | 'wireframe' | 'detailed' | 'comic';

  // Interface
  theme: 'light' | 'dark';
  sidebarPosition: 'left' | 'right';
  showTimeline: boolean;
  compactMode: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autoSave: true,
  autoSaveInterval: 5,
  defaultAspectRatio: '16:9',
  defaultFrameRate: 24,
  showGrid: true,
  gridType: 'rule-of-thirds',
  canvasBackground: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 2,
  aiModel: 'gemini-pro',
  aiTemperature: 0.7,
  autoGenerateImages: true,
  imageStyle: 'sketch',
  theme: 'dark',
  sidebarPosition: 'left',
  showTimeline: true,
  compactMode: false,
};
