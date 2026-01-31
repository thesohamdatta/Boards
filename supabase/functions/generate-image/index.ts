import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateImageRequest {
  shot_id: string;
  scene_description: string;
  shot_description: string;
  camera_angle: string;
  shot_size: string;
  characters?: { name: string; description: string }[];
  style?: string;
  aspect_ratio?: string;
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

    const requestData: GenerateImageRequest = await req.json();
    const {
      shot_id,
      scene_description,
      shot_description,
      camera_angle,
      shot_size,
      characters = [],
      style = "cinematic storyboard",
      aspect_ratio = "16:9",
    } = requestData;

    if (!shot_id || !shot_description) {
      return new Response(
        JSON.stringify({ error: "shot_id and shot_description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build character descriptions for prompt consistency
    const characterDescriptions = characters
      .map((c) => `${c.name}: ${c.description}`)
      .join("\n");

    // Build the image generation prompt
    const imagePrompt = `Storyboard frame, ${style} style.
Camera: ${camera_angle}, ${shot_size} shot.
Scene: ${scene_description || "Interior scene"}
Action: ${shot_description}
${characterDescriptions ? `Characters:\n${characterDescriptions}` : ""}
Aspect ratio: ${aspect_ratio}
High contrast, clear silhouettes, professional storyboard quality, dramatic lighting, cinematic composition.`;

    console.log("Generating image with prompt:", imagePrompt);

    // Generate image using Lovable AI (Gemini image model)
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: imagePrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!imageResponse.ok) {
      if (imageResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (imageResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await imageResponse.text();
      console.error("Image generation failed:", imageResponse.status, errorText);
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error("No image returned from AI");
    }

    // Upload to storage
    const imageBytes = Uint8Array.from(atob(generatedImage.split(",")[1]), (c) => c.charCodeAt(0));
    const fileName = `${shot_id}_${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("storyboard-images")
      .upload(fileName, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("storyboard-images")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Get current version count for this shot
    const { data: existingPanels } = await supabase
      .from("storyboard_panels")
      .select("version")
      .eq("shot_id", shot_id)
      .order("version", { ascending: false })
      .limit(1);

    const nextVersion = existingPanels && existingPanels.length > 0 ? existingPanels[0].version + 1 : 1;

    // Save panel to database
    const { data: panel, error: panelError } = await supabase
      .from("storyboard_panels")
      .insert({
        shot_id,
        image_url: imageUrl,
        prompt_used: imagePrompt,
        version: nextVersion,
      })
      .select()
      .single();

    if (panelError) {
      console.error("Panel insert error:", panelError);
      throw new Error(`Failed to save panel: ${panelError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        panel: {
          id: panel.id,
          image_url: imageUrl,
          prompt_used: imagePrompt,
          version: nextVersion,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate image error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
