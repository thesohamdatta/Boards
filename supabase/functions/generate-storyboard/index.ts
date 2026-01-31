import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { project_id, style = "cinematic storyboard" } = await req.json();

    if (!project_id) {
      return new Response(
        JSON.stringify({ error: "project_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all scenes and shots for the project
    const { data: scenes, error: scenesError } = await supabase
      .from("scenes")
      .select(`
        id,
        scene_number,
        location,
        time_of_day,
        description,
        shots (
          id,
          shot_number,
          camera_angle,
          shot_size,
          movement,
          description
        )
      `)
      .eq("project_id", project_id)
      .order("scene_number");

    if (scenesError) {
      throw new Error(`Failed to fetch scenes: ${scenesError.message}`);
    }

    // Fetch characters for the project
    const { data: characters } = await supabase
      .from("characters")
      .select("name, description")
      .eq("project_id", project_id);

    // Fetch project aspect ratio
    const { data: project } = await supabase
      .from("projects")
      .select("aspect_ratio")
      .eq("id", project_id)
      .single();

    const aspectRatio = project?.aspect_ratio || "16:9";
    let generatedCount = 0;
    const errors: string[] = [];

    // Generate images for each shot
    for (const scene of scenes || []) {
      for (const shot of scene.shots || []) {
        // Check if panel already exists for this shot
        const { data: existingPanel } = await supabase
          .from("storyboard_panels")
          .select("id")
          .eq("shot_id", shot.id)
          .limit(1);

        if (existingPanel && existingPanel.length > 0) {
          console.log(`Skipping shot ${shot.id} - panel already exists`);
          continue;
        }

        // Build character descriptions
        const characterDescriptions = (characters || [])
          .map((c) => `${c.name}: ${c.description}`)
          .join("\n");

        // Build the image generation prompt
        const imagePrompt = `Storyboard frame, ${style} style.
Camera: ${shot.camera_angle}, ${shot.shot_size} shot.
Scene: ${scene.location} - ${scene.time_of_day || "DAY"}. ${scene.description}
Action: ${shot.description}
${characterDescriptions ? `Characters:\n${characterDescriptions}` : ""}
Aspect ratio: ${aspectRatio}
High contrast, clear silhouettes, professional storyboard quality, dramatic lighting, cinematic composition.`;

        try {
          const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [{ role: "user", content: imagePrompt }],
              modalities: ["image", "text"],
            }),
          });

          if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            errors.push(`Shot ${shot.shot_number}: API error ${imageResponse.status}`);
            console.error(`Image generation failed for shot ${shot.id}:`, errorText);
            continue;
          }

          const imageData = await imageResponse.json();
          const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (!generatedImage) {
            errors.push(`Shot ${shot.shot_number}: No image returned`);
            continue;
          }

          // Upload to storage
          const imageBytes = Uint8Array.from(
            atob(generatedImage.split(",")[1]),
            (c) => c.charCodeAt(0)
          );
          const fileName = `${shot.id}_${Date.now()}.png`;

          const { error: uploadError } = await supabase.storage
            .from("storyboard-images")
            .upload(fileName, imageBytes, {
              contentType: "image/png",
              upsert: true,
            });

          if (uploadError) {
            errors.push(`Shot ${shot.shot_number}: Upload failed`);
            continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from("storyboard-images")
            .getPublicUrl(fileName);

          // Save panel
          await supabase.from("storyboard_panels").insert({
            shot_id: shot.id,
            image_url: publicUrlData.publicUrl,
            prompt_used: imagePrompt,
            version: 1,
          });

          generatedCount++;
          console.log(`Generated panel for shot ${shot.id}`);

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Unknown error";
          errors.push(`Shot ${shot.shot_number}: ${errMsg}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated_count: generatedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Generated ${generatedCount} storyboard panels`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate storyboard error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
