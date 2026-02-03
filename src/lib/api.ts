import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const getModel = (modelName: string = "gemini-1.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Project {
  id: string;
  user_id: string;
  title: string;
  genre: string | null;
  aspect_ratio: string | null;
  script_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  project_id: string;
  scene_number: number;
  location: string | null;
  time_of_day: string | null;
  description: string;
  created_at: string;
}

export interface Shot {
  id: string;
  scene_id: string;
  shot_number: number;
  camera_angle: string;
  shot_size: string;
  movement: string | null;
  duration: number;
  description: string;
  dialogue: string | null;
  notes: string | null;
  order: number;
  equipment: string | null;
  focal_length: string | null;
  visual_style: string | null;
  lighting_mood: string | null;
  composition: string | null;
  created_at: string;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  description: string;
  appearance: string | null;
  clothing: string | null;
  reference_image_url: string | null;
  created_at: string;
}

export interface StoryboardPanel {
  id: string;
  shot_id: string;
  version: number;
  image_url: string;
  prompt_used: string;
  seed: string | null;
  created_at: string;
}

// Storage keys
const KEYS = {
  PROJECTS: 'boards_projects',
  SCENES: 'boards_scenes',
  SHOTS: 'boards_shots',
  CHARACTERS: 'boards_characters',
  PANELS: 'boards_panels'
};

// Generic get/set
const getList = <T>(key: string): T[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (e) {
    console.error("Error reading from localStorage", e);
    return [];
  }
};

const saveList = <T>(key: string, list: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error("Error writing to localStorage", e);
  }
};

// ============= PROJECT API =============

export async function createProject(title: string, genre?: string, aspectRatio?: string, scriptText?: string) {
  await delay(100);
  const projects = getList<Project>(KEYS.PROJECTS);
  const newProject: Project = {
    id: crypto.randomUUID(),
    user_id: 'local-user',
    title: title || "Untitled",
    genre: genre || null,
    aspect_ratio: aspectRatio || "16:9",
    script_text: scriptText || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  projects.unshift(newProject);
  saveList(KEYS.PROJECTS, projects);
  return newProject;
}

export async function getProjects() {
  await delay(100);
  return getList<Project>(KEYS.PROJECTS);
}

export async function getProject(projectId: string) {
  await delay(50);
  const projects = getList<Project>(KEYS.PROJECTS);
  return projects.find(p => p.id === projectId) || null;
}

export async function updateProject(projectId: string, updates: { title?: string; genre?: string; aspect_ratio?: string; script_text?: string }) {
  await delay(50);
  const projects = getList<Project>(KEYS.PROJECTS);
  const index = projects.findIndex(p => p.id === projectId);
  if (index === -1) throw new Error("Project not found");

  projects[index] = { ...projects[index], ...updates, updated_at: new Date().toISOString() };
  saveList(KEYS.PROJECTS, projects);
  return projects[index];
}

export async function deleteProject(projectId: string) {
  await delay(50);
  let projects = getList<Project>(KEYS.PROJECTS);
  projects = projects.filter(p => p.id !== projectId);
  saveList(KEYS.PROJECTS, projects);

  // Clean up related data
  // Scenes
  let scenes = getList<Scene>(KEYS.SCENES);
  const sceneIds = scenes.filter(s => s.project_id === projectId).map(s => s.id);
  scenes = scenes.filter(s => s.project_id !== projectId);
  saveList(KEYS.SCENES, scenes);

  // Characters
  let characters = getList<Character>(KEYS.CHARACTERS);
  characters = characters.filter(c => c.project_id !== projectId);
  saveList(KEYS.CHARACTERS, characters);

  // Shots
  let shots = getList<Shot>(KEYS.SHOTS);
  const shotIds = shots.filter(s => sceneIds.includes(s.scene_id)).map(s => s.id);
  shots = shots.filter(s => !sceneIds.includes(s.scene_id));
  saveList(KEYS.SHOTS, shots);

  // Panels
  let panels = getList<StoryboardPanel>(KEYS.PANELS);
  panels = panels.filter(p => !shotIds.includes(p.shot_id));
  saveList(KEYS.PANELS, panels);
}

// ============= SCENES API =============

export async function getScenes(projectId: string) {
  await delay(50);
  const scenes = getList<Scene>(KEYS.SCENES);
  const shots = getList<Shot>(KEYS.SHOTS);
  const panels = getList<StoryboardPanel>(KEYS.PANELS);

  // Join data effectively
  // We need to return scenes with shots and shots with panels
  // This matches the Supabase query structure
  /*
    .select(`
      *,
      shots (
        *,
        storyboard_panels (*)
      )
    `)
  */

  const projectScenes = scenes.filter(s => s.project_id === projectId).sort((a, b) => a.scene_number - b.scene_number);

  return projectScenes.map(scene => {
    const sceneShots = shots
      .filter(shot => shot.scene_id === scene.id)
      .sort((a, b) => (a.order || a.shot_number) - (b.order || b.shot_number))
      .map(shot => ({
        ...shot,
        storyboard_panels: panels.filter(p => p.shot_id === shot.id).sort((a, b) => b.version - a.version)
      }));

    return {
      ...scene,
      shots: sceneShots
    };
  });
}

export async function updateScene(sceneId: string, updates: { location?: string; time_of_day?: string; description?: string }) {
  await delay(50);
  const scenes = getList<Scene>(KEYS.SCENES);
  const index = scenes.findIndex(s => s.id === sceneId);
  if (index === -1) throw new Error("Scene not found");

  scenes[index] = { ...scenes[index], ...updates };
  saveList(KEYS.SCENES, scenes);
  return scenes[index];
}

// ============= SHOTS API =============

export async function updateShot(shotId: string, updates: {
  camera_angle?: string;
  shot_size?: string;
  movement?: string;
  duration?: number;
  description?: string;
  dialogue?: string;
  notes?: string;
  equipment?: string;
  focal_length?: string;
  visual_style?: string;
  lighting_mood?: string;
  composition?: string;
}) {
  await delay(50);
  const shots = getList<Shot>(KEYS.SHOTS);
  const index = shots.findIndex(s => s.id === shotId);
  if (index === -1) throw new Error("Shot not found");

  shots[index] = { ...shots[index], ...updates };
  saveList(KEYS.SHOTS, shots);
  return shots[index];
}

// ============= CHARACTERS API =============

export async function getCharacters(projectId: string) {
  await delay(50);
  const characters = getList<Character>(KEYS.CHARACTERS);
  return characters.filter(c => c.project_id === projectId).sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCharacter(projectId: string, character: {
  name: string;
  description: string;
  appearance?: string;
  clothing?: string;
  reference_image_url?: string;
}) {
  await delay(50);
  const characters = getList<Character>(KEYS.CHARACTERS);
  const newCharacter: Character = {
    id: crypto.randomUUID(),
    project_id: projectId,
    created_at: new Date().toISOString(),
    name: character.name,
    description: character.description,
    appearance: character.appearance || null,
    clothing: character.clothing || null,
    reference_image_url: character.reference_image_url || null
  };
  characters.push(newCharacter);
  saveList(KEYS.CHARACTERS, characters);
  return newCharacter;
}

export async function updateCharacter(characterId: string, updates: {
  name?: string;
  description?: string;
  appearance?: string;
  clothing?: string;
  reference_image_url?: string;
}) {
  await delay(50);
  const characters = getList<Character>(KEYS.CHARACTERS);
  const index = characters.findIndex(c => c.id === characterId);
  if (index === -1) throw new Error("Character not found");

  characters[index] = { ...characters[index], ...updates };
  saveList(KEYS.CHARACTERS, characters);
  return characters[index];
}

export async function deleteCharacter(characterId: string) {
  await delay(50);
  let characters = getList<Character>(KEYS.CHARACTERS);
  characters = characters.filter(c => c.id !== characterId);
  saveList(KEYS.CHARACTERS, characters);
}

// ============= AI FUNCTIONS (PRODUCTION-GRADE) =============

import { parseScriptWithGemini, type ParseScriptResponse, type ParseScriptError } from './script-parser';

export async function parseScript(projectId: string, scriptText: string, genre?: string, modelName: string = "gemini-pro") {
  try {
    console.log('[parseScript] Starting script analysis', {
      projectId,
      scriptLength: scriptText.length,
      genre,
      modelName
    });

    // Call hardened parser
    const result: ParseScriptResponse = await parseScriptWithGemini(
      scriptText,
      genre,
      modelName
    );

    // Handle parsing failure
    if (!result.success) {
      console.error('[parseScript] Parsing failed:', result.error);
      return {
        success: false,
        error: result.userMessage,
        scenes_created: 0,
        characters_created: 0
      };
    }

    // Log warnings if any
    if (result.warnings.length > 0) {
      console.warn('[parseScript] Warnings:', result.warnings);
    }

    console.log('[parseScript] Parsing succeeded', {
      scenesFound: result.scenes.length,
      charactersFound: result.characters.length
    });

    // Save to localStorage
    const scenes = getList<Scene>(KEYS.SCENES);
    const characters = getList<Character>(KEYS.CHARACTERS);
    const shots = getList<Shot>(KEYS.SHOTS);

    let sceneCount = 0;
    let characterCount = 0;
    let shotCount = 0;

    // Process Scenes and generate Shots
    for (const parsedScene of result.scenes) {
      const sceneId = crypto.randomUUID();

      scenes.push({
        id: sceneId,
        project_id: projectId,
        scene_number: parsedScene.scene_number,
        location: parsedScene.location,
        time_of_day: parsedScene.time_of_day,
        description: parsedScene.description,
        created_at: new Date().toISOString()
      });
      sceneCount++;

      // Generate default shots for each scene
      const defaultShots = generateDefaultShots(sceneId, parsedScene.description);
      shots.push(...defaultShots);
      shotCount += defaultShots.length;
    }

    // Process Characters
    for (const parsedChar of result.characters) {
      characters.push({
        id: crypto.randomUUID(),
        project_id: projectId,
        name: parsedChar.name,
        description: parsedChar.description,
        appearance: parsedChar.appearance || null,
        clothing: parsedChar.clothing || null,
        reference_image_url: null,
        created_at: new Date().toISOString()
      });
      characterCount++;
    }

    // Save all data atomically
    saveList(KEYS.SCENES, scenes);
    saveList(KEYS.CHARACTERS, characters);
    saveList(KEYS.SHOTS, shots);

    return {
      success: true,
      scenes_created: sceneCount,
      characters_created: characterCount,
      shots_created: shotCount,
      data: { scenes, characters, shots }
    };

  } catch (error) {
    console.error("[parseScript] Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
      scenes_created: 0,
      characters_created: 0
    };
  }
}

// Helper to generate default shots for a scene
function generateDefaultShots(sceneId: string, sceneDescription: string): Shot[] {
  const shotTypes = [
    { size: 'Wide', angle: 'Eye Level', description: 'Establishing shot' },
    { size: 'Medium', angle: 'Eye Level', description: 'Main action' },
    { size: 'Close-Up', angle: 'Eye Level', description: 'Detail or reaction' }
  ];

  return shotTypes.map((shotType, index) => ({
    id: crypto.randomUUID(),
    scene_id: sceneId,
    shot_number: index + 1,
    camera_angle: shotType.angle,
    shot_size: shotType.size,
    movement: 'Static',
    duration: 3,
    description: `${shotType.description}: ${sceneDescription.slice(0, 100)}`,
    dialogue: null,
    notes: null,
    order: index + 1,
    equipment: 'Tripod',
    focal_length: '50mm',
    visual_style: null,
    lighting_mood: null,
    composition: null,
    created_at: new Date().toISOString()
  }));
}

// ============= GENERATION API =============

import { generateStoryboardImage } from './image-generator';

export async function generateStoryboard(projectId: string, style?: string, modelName: string = "gemini-pro") {
  // 1. Get all shots for the project
  const scenes = getList<Scene>(KEYS.SCENES).filter(s => s.project_id === projectId);
  let shots = getList<Shot>(KEYS.SHOTS).filter(s => scenes.some(scene => scene.id === s.scene_id));

  // Sort shots strictly by scene and order
  shots.sort((a, b) => {
    const SceneA = scenes.find(s => s.id === a.scene_id);
    const SceneB = scenes.find(s => s.id === b.scene_id);
    if (!SceneA || !SceneB) return 0;
    if (SceneA.scene_number !== SceneB.scene_number) return SceneA.scene_number - SceneB.scene_number;
    return (a.order || a.shot_number) - (b.order || b.shot_number);
  });

  // 2. Filter shots that don't have panels yet (or valid ones)
  const panels = getList<StoryboardPanel>(KEYS.PANELS);
  const shotsToGenerate = shots.filter(shot => !panels.some(p => p.shot_id === shot.id));

  let generatedCount = 0;
  const errors: any[] = [];
  const characters = getList<Character>(KEYS.CHARACTERS).filter(c => c.project_id === projectId);

  // 3. Sequential Generation Loop
  for (const shot of shotsToGenerate) {
    try {
      const scene = scenes.find(s => s.id === shot.scene_id);
      if (!scene) continue;

      const characterList = characters.map(c => ({
        name: c.name,
        description: c.description,
        appearance: c.appearance || undefined
      }));

      await generateShotImage(
        shot.id,
        `${scene.location} - ${scene.time_of_day}. ${scene.description}`,
        shot.description,
        shot.camera_angle,
        shot.shot_size,
        characterList,
        {
          style: shot.visual_style || style,
          mood: shot.lighting_mood || undefined,
          composition: shot.composition || undefined
        },
        modelName
      );
      generatedCount++;
    } catch (e: any) {
      console.error(`Failed to generate shot ${shot.id}:`, e);
      errors.push({ shotId: shot.id, error: e.message });
    }
  }

  return {
    success: true,
    generated_count: generatedCount,
    errors: errors,
    error: undefined
  };
}

export async function generateShotImage(
  shotId: string,
  sceneDescription: string,
  shotDescription: string,
  cameraAngle: string,
  shotSize: string,
  characters?: { name: string; description: string; appearance?: string }[],
  options?: {
    style?: string,
    mood?: string,
    composition?: string
  },
  modelName: string = "gemini-pro"
) {
  try {
    const result = await generateStoryboardImage(
      sceneDescription,
      shotDescription,
      cameraAngle,
      shotSize,
      characters,
      options,
      modelName
    );

    if (result.success && result.imageUrl) {
      const panels = getList<StoryboardPanel>(KEYS.PANELS);
      const newPanel: StoryboardPanel = {
        id: crypto.randomUUID(),
        shot_id: shotId,
        version: 1, // Logic to increment version could be added
        image_url: result.imageUrl,
        prompt_used: shotDescription,
        seed: null,
        created_at: new Date().toISOString()
      };

      // Keep only most recent panel if that's desired, or add versioning
      panels.push(newPanel);
      saveList(KEYS.PANELS, panels);

      return {
        success: true,
        panel: newPanel
      };
    }

    throw new Error(result.error || "Generation failed");

  } catch (error) {
    console.error("generateShotImage Error:", error);
    // Placeholder fallback
    const placeholder = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600'%3E%3Crect fill='%23cccccc' width='800' height='600'/%3E%3Ctext fill='%23333333' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EMock Image (AI Failed)%3C/text%3E%3C/svg%3E";

    const panels = getList<StoryboardPanel>(KEYS.PANELS);
    const newPanel: StoryboardPanel = {
      id: crypto.randomUUID(),
      shot_id: shotId,
      version: 1,
      image_url: placeholder,
      prompt_used: shotDescription,
      seed: null,
      created_at: new Date().toISOString()
    };
    panels.push(newPanel);
    saveList(KEYS.PANELS, panels);

    return {
      success: true,
      panel: newPanel
    };
  }
}

// ============= STORYBOARD PANELS API =============

export async function getStoryboardPanels(shotId: string) {
  await delay(50);
  const panels = getList<StoryboardPanel>(KEYS.PANELS);
  return panels.filter(p => p.shot_id === shotId).sort((a, b) => b.version - a.version);
}

// ============= EXPORT / IMPORT =============

export async function getProjectFull(projectId: string) {
  const project = await getProject(projectId);
  if (!project) throw new Error("Project not found");
  const scenes = await getScenes(projectId);
  const characters = await getCharacters(projectId);
  return {
    project,
    scenes,
    characters,
    version: "1.0",
    exported_at: new Date().toISOString()
  };
}

export async function importProject(data: any) {
  await delay(200);
  if (!data.project || !Array.isArray(data.scenes)) throw new Error("Invalid project file format");

  // 1. Create Project
  const oldProject = data.project;
  const newProjectId = crypto.randomUUID();

  const projects = getList<Project>(KEYS.PROJECTS);
  const newProject: Project = {
    ...oldProject,
    id: newProjectId,
    title: (oldProject.title || "Untitled") + " (Imported)",
    user_id: 'local-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  projects.unshift(newProject);
  saveList(KEYS.PROJECTS, projects);

  // 2. Characters
  const characters = getList<Character>(KEYS.CHARACTERS);
  if (Array.isArray(data.characters)) {
    for (const char of data.characters) {
      if (!char.name) continue;
      characters.push({
        ...char,
        id: crypto.randomUUID(),
        project_id: newProjectId,
        created_at: new Date().toISOString()
      });
    }
  }
  saveList(KEYS.CHARACTERS, characters);

  // 3. Scenes, Shots, Panels
  const scenesList = getList<Scene>(KEYS.SCENES);
  const shotsList = getList<Shot>(KEYS.SHOTS);
  const panelsList = getList<StoryboardPanel>(KEYS.PANELS);

  for (const scene of data.scenes) {
    const newSceneId = crypto.randomUUID();
    scenesList.push({
      id: newSceneId,
      project_id: newProjectId,
      scene_number: scene.scene_number || 0,
      location: scene.location || null,
      time_of_day: scene.time_of_day || null,
      description: scene.description || "",
      created_at: new Date().toISOString()
    });

    if (Array.isArray(scene.shots)) {
      for (const shot of scene.shots) {
        const newShotId = crypto.randomUUID();
        shotsList.push({
          id: newShotId,
          scene_id: newSceneId,
          shot_number: shot.shot_number || 0,
          camera_angle: shot.camera_angle || "",
          shot_size: shot.shot_size || "",
          movement: shot.movement || null,
          duration: shot.duration || 0,
          description: shot.description || "",
          dialogue: shot.dialogue || null,
          notes: shot.notes || null,
          order: shot.order || 0,
          equipment: shot.equipment || null,
          focal_length: shot.focal_length || null,
          created_at: new Date().toISOString()
        });

        if (Array.isArray(shot.storyboard_panels)) {
          for (const panel of shot.storyboard_panels) {
            panelsList.push({
              id: crypto.randomUUID(),
              shot_id: newShotId,
              version: panel.version || 1,
              image_url: panel.image_url || "",
              prompt_used: panel.prompt_used || "",
              seed: panel.seed || null,
              created_at: new Date().toISOString()
            });
          }
        }
      }
    }
  }

  saveList(KEYS.SCENES, scenesList);
  saveList(KEYS.SHOTS, shotsList);
  saveList(KEYS.PANELS, panelsList);

  return newProject;
}
