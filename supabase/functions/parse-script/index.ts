import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParsedScene {
  scene_number: number;
  location: string;
  time_of_day: string;
  description: string;
  characters: string[];
}

interface ParsedShot {
  shot_number: number;
  camera_angle: string;
  shot_size: string;
  movement: string;
  description: string;
  dialogue?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { script_text, project_id, genre } = await req.json();

    if (!script_text || !project_id) {
      return new Response(
        JSON.stringify({ error: "script_text and project_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Parse script into scenes using AI
    const sceneParsePrompt = `You are a professional screenplay analyst. Parse the following script/story into structured scenes.

For each scene, identify:
- scene_number (sequential integer starting from 1)
- location (e.g., "INT. COFFEE SHOP", "EXT. CITY STREET")
- time_of_day (e.g., "DAY", "NIGHT", "DAWN", "DUSK")
- description (detailed summary of what happens in the scene, 2-4 sentences)
- characters (array of character names that appear in this scene)

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation. Just the JSON array.

Script/Story:
${script_text}

Return JSON in this exact format:
{
  "scenes": [
    {
      "scene_number": 1,
      "location": "INT. LOCATION - TIME",
      "time_of_day": "DAY",
      "description": "Description of action...",
      "characters": ["Character1", "Character2"]
    }
  ],
  "characters": [
    {
      "name": "Character1",
      "description": "Brief physical description based on story context"
    }
  ]
}`;

    const sceneResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a screenplay parser. Return only valid JSON." },
          { role: "user", content: sceneParsePrompt },
        ],
      }),
    });

    if (!sceneResponse.ok) {
      const errorText = await sceneResponse.text();
      console.error("AI scene parse error:", sceneResponse.status, errorText);
      throw new Error(`AI scene parsing failed: ${sceneResponse.status}`);
    }

    const sceneData = await sceneResponse.json();
    let sceneContent = sceneData.choices?.[0]?.message?.content || "";
    
    // Clean JSON from markdown if present
    sceneContent = sceneContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let parsedData: { scenes: ParsedScene[]; characters: { name: string; description: string }[] };
    try {
      parsedData = JSON.parse(sceneContent);
    } catch (e) {
      console.error("Failed to parse scene JSON:", sceneContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Step 2: For each scene, generate shots using AI with rule-based constraints
    const allShots: { sceneIndex: number; shots: ParsedShot[] }[] = [];
    
    for (let i = 0; i < parsedData.scenes.length; i++) {
      const scene = parsedData.scenes[i];
      
      const shotPrompt = `You are a professional cinematographer. Break down this scene into specific camera shots.

Scene ${scene.scene_number}: ${scene.location}
${scene.description}
Genre: ${genre || "Drama"}

Rules:
- Generate 3-6 shots per scene
- Include establishing wide shot first
- Mix shot sizes (Wide, Medium, Close-up, Extreme Close-up)
- Vary camera angles (Eye-level, Low angle, High angle, Dutch angle, Over shoulder)
- Include camera movement when dramatic (Static, Pan, Tilt, Track, Dolly, Handheld)

Return ONLY valid JSON array with no markdown:
[
  {
    "shot_number": 1,
    "camera_angle": "Eye-level",
    "shot_size": "Wide",
    "movement": "Static",
    "description": "Establishing shot showing..."
  }
]`;

      const shotResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a cinematographer. Return only valid JSON array." },
            { role: "user", content: shotPrompt },
          ],
        }),
      });

      if (!shotResponse.ok) {
        console.error("AI shot generation failed for scene", i);
        continue;
      }

      const shotData = await shotResponse.json();
      let shotContent = shotData.choices?.[0]?.message?.content || "[]";
      shotContent = shotContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      try {
        const shots = JSON.parse(shotContent);
        allShots.push({ sceneIndex: i, shots });
      } catch (e) {
        console.error("Failed to parse shot JSON for scene", i);
        // Create default shots if AI fails
        allShots.push({
          sceneIndex: i,
          shots: [
            { shot_number: 1, camera_angle: "Eye-level", shot_size: "Wide", movement: "Static", description: `Establishing shot of ${scene.location}` },
            { shot_number: 2, camera_angle: "Eye-level", shot_size: "Medium", movement: "Static", description: scene.description },
            { shot_number: 3, camera_angle: "Eye-level", shot_size: "Close-up", movement: "Static", description: "Close-up on key action" },
          ],
        });
      }
    }

    // Step 3: Save to database
    const createdSceneIds: string[] = [];
    
    // Insert scenes
    for (const scene of parsedData.scenes) {
      const { data: sceneRow, error: sceneError } = await supabase
        .from("scenes")
        .insert({
          project_id,
          scene_number: scene.scene_number,
          location: scene.location,
          time_of_day: scene.time_of_day,
          description: scene.description,
        })
        .select()
        .single();

      if (sceneError) {
        console.error("Failed to insert scene:", sceneError);
        continue;
      }
      createdSceneIds.push(sceneRow.id);

      // Insert shots for this scene
      const sceneShots = allShots.find((s) => s.sceneIndex === scene.scene_number - 1);
      if (sceneShots) {
        for (const shot of sceneShots.shots) {
          await supabase.from("shots").insert({
            scene_id: sceneRow.id,
            shot_number: shot.shot_number,
            camera_angle: shot.camera_angle,
            shot_size: shot.shot_size,
            movement: shot.movement,
            description: shot.description,
            dialogue: shot.dialogue || null,
          });
        }
      }
    }

    // Insert characters
    for (const character of parsedData.characters || []) {
      await supabase.from("characters").insert({
        project_id,
        name: character.name,
        description: character.description,
      });
    }

    // Update project with script text
    await supabase
      .from("projects")
      .update({ script_text })
      .eq("id", project_id);

    return new Response(
      JSON.stringify({
        success: true,
        scenes_created: createdSceneIds.length,
        characters_created: parsedData.characters?.length || 0,
        message: "Script parsed and breakdown created successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Parse script error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
