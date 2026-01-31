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
  PROJECTS: 'scene_weaver_projects',
  SCENES: 'scene_weaver_scenes',
  SHOTS: 'scene_weaver_shots',
  CHARACTERS: 'scene_weaver_characters',
  PANELS: 'scene_weaver_panels'
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

export async function createProject(title: string, genre?: string, aspectRatio?: string) {
  await delay(100);
  const projects = getList<Project>(KEYS.PROJECTS);
  const newProject: Project = {
    id: crypto.randomUUID(),
    user_id: 'local-user',
    title: title || "Untitled",
    genre: genre || null,
    aspect_ratio: aspectRatio || "16:9",
    script_text: null,
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

// ============= AI FUNCTIONS (MOCKED) =============

export async function parseScript(projectId: string, scriptText: string, genre?: string, modelName: string = "gemini-1.5-flash") {
  try {
    const prompt = `
      Analyze the following story concept or script and break it down into scenes and characters.
      Genre: ${genre || 'General'}
      
      Script/Story:
      "${scriptText}"
      
      Output strictly in JSON format with this structure:
      {
        "scenes": [
          {
            "scene_number": 1,
            "location": "INT. ROOM - DAY",
            "time_of_day": "DAY",
            "description": "Brief description of the action"
          }
        ],
        "characters": [
          {
            "name": "CHARACTER NAME",
            "description": "Brief visual description",
            "clothing": "Clothing style",
            "appearance": "Physical traits"
          }
        ]
      }
    `;

    const model = getModel(modelName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up JSON if md blocks are used
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    const scenes = getList<Scene>(KEYS.SCENES);
    const characters = getList<Character>(KEYS.CHARACTERS);

    let sceneCount = 0;
    let characterCount = 0;

    // Process Scenes
    if (Array.isArray(parsedData.scenes)) {
      for (const s of parsedData.scenes) {
        scenes.push({
          id: crypto.randomUUID(),
          project_id: projectId,
          scene_number: s.scene_number || (sceneCount + 1),
          location: s.location || "UNKNOWN",
          time_of_day: s.time_of_day || "DAY",
          description: s.description || "No description",
          created_at: new Date().toISOString()
        });
        sceneCount++;
      }
    }

    // Process Characters
    if (Array.isArray(parsedData.characters)) {
      for (const c of parsedData.characters) {
        characters.push({
          id: crypto.randomUUID(),
          project_id: projectId,
          name: c.name || "Unknown",
          description: c.description || "",
          appearance: c.appearance || null,
          clothing: c.clothing || null,
          reference_image_url: null,
          created_at: new Date().toISOString()
        });
        characterCount++;
      }
    }

    // Fallback if AI fails to return arrays
    if (sceneCount === 0) {
      scenes.push({
        id: crypto.randomUUID(),
        project_id: projectId,
        scene_number: 1,
        location: "UNKNOWN LOCATION",
        time_of_day: "DAY",
        description: "Auto-generated scene from script",
        created_at: new Date().toISOString()
      });
      sceneCount++;
    }

    if (characterCount === 0) {
      characters.push({
        id: crypto.randomUUID(),
        project_id: projectId,
        name: "Protagonist",
        description: "Main character",
        created_at: new Date().toISOString(),
        appearance: null,
        clothing: null,
        reference_image_url: null
      });
      characterCount++;
    }

    saveList(KEYS.SCENES, scenes);
    saveList(KEYS.CHARACTERS, characters);

    return {
      success: true,
      scenes_created: sceneCount,
      characters_created: characterCount,
      data: { scenes, characters }
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to dummy data on error
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI processing failed",
      scenes_created: 0,
      characters_created: 0
    }
  }
}

export async function generateStoryboard(projectId: string, style?: string) {
  await delay(1000);
  return {
    success: true,
    generated_count: 0,
    errors: [],
    error: undefined
  };
}

export async function generateShotImage(
  shotId: string,
  sceneDescription: string,
  shotDescription: string,
  cameraAngle: string,
  shotSize: string,
  characters?: { name: string; description: string }[],
  style?: string,
  aspectRatio?: string,
  modelName: string = "gemini-1.5-flash"
) {
  await delay(1000);
  // Return a placeholder image
  // Use Gemini to generate an SVG for the shot
  try {
    const prompt = `
      Create a simple, thick-line SVG illustration for a storyboard shot.
      Scene: ${sceneDescription}
      Shot Action: ${shotDescription}
      Camera: ${cameraAngle}, ${shotSize}
      Style: ${style || 'sketch'}
      
      Return ONLY the raw SVG code starting with <svg and ending with </svg>. 
      Do not include markdown blocks. 
      Keep it simple, black and white, wireframe style.
    `;

    const model = getModel(modelName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let svgContent = response.text();

    // Cleanup
    svgContent = svgContent.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();
    if (!svgContent.startsWith('<svg')) {
      // Fallback if not valid SVG
      throw new Error("Invalid SVG generation");
    }

    const placeholder = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`;


    // Save to panels
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
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    // Fallback to placeholder
    const placeholder = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600'%3E%3Crect fill='%23cccccc' width='800' height='600'/%3E%3Ctext fill='%23333333' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EMock Image (AI Failed)%3C/text%3E%3C/svg%3E";

    // Save to panels
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
