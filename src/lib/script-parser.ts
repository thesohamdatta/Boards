/**
 * Production-grade script parsing with Gemini
 * Includes strict validation, schema enforcement, and graceful degradation
 */

import { generateWithGemini, type GeminiResult } from './gemini-client';

// ============= TYPES =============

export interface ParsedScene {
    scene_number: number;
    location: string;
    time_of_day: string;
    description: string;
}

export interface ParsedCharacter {
    name: string;
    description: string;
    appearance?: string;
    clothing?: string;
}

export interface ParseScriptResult {
    success: true;
    scenes: ParsedScene[];
    characters: ParsedCharacter[];
    warnings: string[];
}

export interface ParseScriptError {
    success: false;
    error: string;
    userMessage: string;
    retryable: boolean;
}

export type ParseScriptResponse = ParseScriptResult | ParseScriptError;

// ============= VALIDATION SCHEMAS =============

function isValidScene(obj: any): obj is ParsedScene {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.scene_number === 'number' &&
        typeof obj.location === 'string' &&
        typeof obj.time_of_day === 'string' &&
        typeof obj.description === 'string' &&
        obj.location.trim().length > 0 &&
        obj.description.trim().length > 0
    );
}

function isValidCharacter(obj: any): obj is ParsedCharacter {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.name === 'string' &&
        typeof obj.description === 'string' &&
        obj.name.trim().length > 0
    );
}

function validateParsedData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof data !== 'object' || data === null) {
        errors.push('Response is not a valid object');
        return { valid: false, errors };
    }

    if (!Array.isArray(data.scenes)) {
        errors.push('Missing or invalid "scenes" array');
    }

    if (!Array.isArray(data.characters)) {
        errors.push('Missing or invalid "characters" array');
    }

    return { valid: errors.length === 0, errors };
}

// ============= PROMPT CONSTRUCTION =============

function buildScriptParsePrompt(scriptText: string, genre?: string): string {
    // Truncate script if too long (keep first portion which usually has setup)
    const maxScriptLength = 25000;
    const truncatedScript = scriptText.length > maxScriptLength
        ? scriptText.slice(0, maxScriptLength) + '\n\n[... content truncated for processing ...]'
        : scriptText;

    return `You are a professional script breakdown assistant. Analyze the following ${genre ? genre + ' ' : ''}story/script and extract scenes and characters.

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown, no explanations
2. Every scene MUST have: scene_number, location, time_of_day, description
3. Every character MUST have: name, description
4. If you cannot extract proper scenes, create at least ONE scene from the content
5. If you cannot identify characters, create at least ONE generic character

SCRIPT TEXT:
${truncatedScript}

OUTPUT FORMAT (strict JSON):
{
  "scenes": [
    {
      "scene_number": 1,
      "location": "INT. LOCATION - TIME",
      "time_of_day": "DAY",
      "description": "What happens in this scene"
    }
  ],
  "characters": [
    {
      "name": "CHARACTER NAME",
      "description": "Visual description for storyboard artist",
      "appearance": "Physical traits (optional)",
      "clothing": "Outfit description (optional)"
    }
  ]
}

Return ONLY the JSON object, nothing else.`;
}

// ============= JSON EXTRACTION & CLEANING =============

function extractJSON(text: string): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    // Try to find JSON object boundaries
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
    }

    return cleaned;
}

// ============= MAIN PARSING FUNCTION =============

export async function parseScriptWithGemini(
    scriptText: string,
    genre?: string,
    modelName?: string
): Promise<ParseScriptResponse> {

    // Input validation
    if (!scriptText || scriptText.trim().length === 0) {
        return {
            success: false,
            error: 'Empty script text',
            userMessage: 'Please provide a script or story to analyze.',
            retryable: false
        };
    }

    if (scriptText.trim().length < 50) {
        return {
            success: false,
            error: 'Script too short',
            userMessage: 'The script is too short to analyze. Please provide at least a few sentences describing your story.',
            retryable: false
        };
    }

    // Build prompt
    const prompt = buildScriptParsePrompt(scriptText, genre);

    // Call Gemini
    const result: GeminiResult = await generateWithGemini({
        prompt,
        modelName,
        temperature: 0.3 // Lower temperature for more consistent JSON
    });

    // Handle API failure
    if (!result.success) {
        // TypeScript should narrow `result` to the error type here, but explicit cast for clarity/safety
        const error = result; // `result` is already narrowed to { success: false, ... }
        const userMessages: Record<string, string> = {
            'TIMEOUT': 'The AI took too long to respond. Please try again with a shorter script.',
            'RATE_LIMIT': 'Too many requests. Please wait a moment and try again.',
            'SAFETY_BLOCK': 'The content was flagged by safety filters. Please review your script.',
            'VALIDATION': 'The script is too long or contains invalid characters.',
            'API_ERROR': 'The AI service is temporarily unavailable. Please try again in a moment.'
        };

        return {
            success: false,
            error: error.error,
            userMessage: userMessages[error.errorType] || 'Failed to process the script. Please try again.',
            retryable: error.retryable
        };
    }

    // Extract and parse JSON
    let parsedData: any;
    try {
        const cleanedText = extractJSON(result.text);
        parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw response:', result.text.slice(0, 500));

        return {
            success: false,
            error: 'Invalid JSON response from AI',
            userMessage: 'The AI returned an invalid response. Please try again or simplify your script.',
            retryable: true
        };
    }

    // Validate structure
    const validation = validateParsedData(parsedData);
    if (!validation.valid) {
        console.error('Schema validation failed:', validation.errors);

        return {
            success: false,
            error: `Schema validation failed: ${validation.errors.join(', ')}`,
            userMessage: 'The AI response was incomplete. Please try again.',
            retryable: true
        };
    }

    // Validate and clean scenes
    const warnings: string[] = [];
    const validScenes: ParsedScene[] = [];

    for (const scene of parsedData.scenes) {
        if (isValidScene(scene)) {
            validScenes.push({
                scene_number: scene.scene_number,
                location: scene.location.trim(),
                time_of_day: scene.time_of_day.trim().toUpperCase(),
                description: scene.description.trim()
            });
        } else {
            warnings.push(`Skipped invalid scene: ${JSON.stringify(scene).slice(0, 100)}`);
        }
    }

    // Validate and clean characters
    const validCharacters: ParsedCharacter[] = [];

    for (const char of parsedData.characters) {
        if (isValidCharacter(char)) {
            validCharacters.push({
                name: char.name.trim(),
                description: char.description.trim(),
                appearance: char.appearance?.trim() || undefined,
                clothing: char.clothing?.trim() || undefined
            });
        } else {
            warnings.push(`Skipped invalid character: ${JSON.stringify(char).slice(0, 100)}`);
        }
    }

    // Ensure minimum data (graceful degradation)
    if (validScenes.length === 0) {
        warnings.push('No valid scenes found, creating default scene');
        validScenes.push({
            scene_number: 1,
            location: 'INT. SCENE - DAY',
            time_of_day: 'DAY',
            description: scriptText.slice(0, 200).trim() + '...'
        });
    }

    if (validCharacters.length === 0) {
        warnings.push('No valid characters found, creating default character');
        validCharacters.push({
            name: 'Protagonist',
            description: 'Main character'
        });
    }

    return {
        success: true,
        scenes: validScenes,
        characters: validCharacters,
        warnings
    };
}
