/**
 * Production-grade SVG storyboard image generation with Gemini
 * Includes validation, fallback placeholders, and error recovery
 */

import { generateWithGemini, type GeminiResult } from './gemini-client';

// ============= TYPES =============

export interface GenerateImageResult {
    success: true;
    imageUrl: string;
    format: 'svg' | 'placeholder';
    prompt: string;
}

export interface GenerateImageError {
    success: false;
    error: string;
    userMessage: string;
    placeholderUrl: string; // Always provide a fallback
}

export type GenerateImageResponse = GenerateImageResult | GenerateImageError;

// ============= SVG VALIDATION =============

function isValidSVG(content: string): boolean {
    const trimmed = content.trim();
    return (
        trimmed.startsWith('<svg') &&
        trimmed.includes('</svg>') &&
        trimmed.length > 50 && // Minimum reasonable SVG size
        trimmed.length < 100000 // Maximum to prevent memory issues
    );
}

function extractSVG(text: string): string | null {
    // Remove markdown code blocks
    let cleaned = text
        .replace(/```svg\s*/gi, '')
        .replace(/```xml\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

    // Find SVG boundaries
    const svgStart = cleaned.indexOf('<svg');
    const svgEnd = cleaned.lastIndexOf('</svg>');

    if (svgStart === -1 || svgEnd === -1 || svgEnd <= svgStart) {
        return null;
    }

    const svg = cleaned.slice(svgStart, svgEnd + 6); // +6 for '</svg>'

    return isValidSVG(svg) ? svg : null;
}

// ============= FALLBACK PLACEHOLDER =============

function createPlaceholderSVG(
    shotDescription: string,
    cameraAngle: string,
    shotSize: string
): string {
    // Create a simple, informative placeholder
    const text = `${shotSize} - ${cameraAngle}`;
    const desc = shotDescription.slice(0, 80);

    return `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f5f5f5" stroke="#333" stroke-width="2"/>
  <rect x="50" y="50" width="300" height="200" fill="none" stroke="#999" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="200" y="130" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle">${text}</text>
  <text x="200" y="160" font-family="Arial, sans-serif" font-size="12" fill="#999" text-anchor="middle">${desc}</text>
  <circle cx="200" cy="190" r="30" fill="none" stroke="#ccc" stroke-width="2"/>
  <path d="M 180 190 L 220 190 M 200 170 L 200 210" stroke="#ccc" stroke-width="2"/>
</svg>`;
}

// ============= PROMPT CONSTRUCTION =============

function buildImagePrompt(
    sceneDescription: string,
    shotDescription: string,
    cameraAngle: string,
    shotSize: string,
    characters?: { name: string; description: string }[],
    style?: string
): string {
    const charInfo = characters && characters.length > 0
        ? `\nCharacters: ${characters.map(c => `${c.name} (${c.description})`).join(', ')}`
        : '';

    return `Create a simple, clean SVG illustration for a storyboard panel.

SCENE CONTEXT: ${sceneDescription}
SHOT DESCRIPTION: ${shotDescription}
CAMERA: ${cameraAngle}
SHOT SIZE: ${shotSize}
STYLE: ${style || 'Simple line drawing, black and white'}${charInfo}

REQUIREMENTS:
1. Return ONLY raw SVG code (no markdown, no explanations)
2. Start with <svg and end with </svg>
3. Use simple shapes and thick lines (stroke-width: 3-5)
4. Black and white only (#000 for lines, #fff for fills)
5. Viewbox: 400x300
6. Keep it minimal and clear - this is a storyboard sketch
7. Focus on composition and framing for the ${shotSize} shot

Return ONLY the SVG code.`;
}

// ============= MAIN GENERATION FUNCTION =============

export async function generateStoryboardImage(
    sceneDescription: string,
    shotDescription: string,
    cameraAngle: string,
    shotSize: string,
    characters?: { name: string; description: string }[],
    style?: string,
    modelName?: string
): Promise<GenerateImageResponse> {

    // Input validation
    if (!shotDescription || shotDescription.trim().length === 0) {
        const placeholderSVG = createPlaceholderSVG('No description', cameraAngle, shotSize);
        const placeholderUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(placeholderSVG)}`;

        return {
            success: false,
            error: 'Empty shot description',
            userMessage: 'Shot description is required',
            placeholderUrl
        };
    }

    // Build prompt
    const prompt = buildImagePrompt(
        sceneDescription,
        shotDescription,
        cameraAngle,
        shotSize,
        characters,
        style
    );

    // Call Gemini
    const result: GeminiResult = await generateWithGemini({
        prompt,
        modelName,
        temperature: 0.7
    });

    // Create fallback placeholder
    const placeholderSVG = createPlaceholderSVG(shotDescription, cameraAngle, shotSize);
    const placeholderUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(placeholderSVG)}`;

    // Handle API failure
    if (!result.success) {
        console.warn('Image generation failed:', result.error);

        return {
            success: false,
            error: result.error,
            userMessage: 'Could not generate image. Using placeholder.',
            placeholderUrl
        };
    }

    // Extract SVG
    const svg = extractSVG(result.text);

    if (!svg) {
        console.warn('Invalid SVG in response');
        console.warn('Response preview:', result.text.slice(0, 200));

        return {
            success: false,
            error: 'Invalid SVG response',
            userMessage: 'AI returned invalid image. Using placeholder.',
            placeholderUrl
        };
    }

    // Create data URL
    const imageUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

    return {
        success: true,
        imageUrl,
        format: 'svg',
        prompt: shotDescription
    };
}

// ============= BATCH GENERATION WITH PROGRESS =============

export interface BatchProgress {
    total: number;
    completed: number;
    failed: number;
    currentShot?: string;
}

export type ProgressCallback = (progress: BatchProgress) => void;

export async function generateStoryboardBatch(
    shots: Array<{
        id: string;
        sceneDescription: string;
        shotDescription: string;
        cameraAngle: string;
        shotSize: string;
    }>,
    characters?: { name: string; description: string }[],
    style?: string,
    modelName?: string,
    onProgress?: ProgressCallback
): Promise<Map<string, GenerateImageResponse>> {

    const results = new Map<string, GenerateImageResponse>();
    let completed = 0;
    let failed = 0;

    for (const shot of shots) {
        if (onProgress) {
            onProgress({
                total: shots.length,
                completed,
                failed,
                currentShot: shot.shotDescription.slice(0, 50)
            });
        }

        const result = await generateStoryboardImage(
            shot.sceneDescription,
            shot.shotDescription,
            shot.cameraAngle,
            shot.shotSize,
            characters,
            style,
            modelName
        );

        results.set(shot.id, result);

        if (result.success) {
            completed++;
        } else {
            failed++;
        }

        // Small delay between requests to avoid rate limits
        if (completed + failed < shots.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    if (onProgress) {
        onProgress({
            total: shots.length,
            completed,
            failed
        });
    }

    return results;
}
