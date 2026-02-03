/**
 * Production-grade Gemini API client with comprehensive error handling,
 * validation, retry logic, and observability.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// ============= CONFIGURATION =============

const CONFIG = {
    MAX_PROMPT_LENGTH: 30000, // Conservative limit to avoid token issues
    REQUEST_TIMEOUT_MS: 45000, // 45 seconds
    RETRY_DELAY_MS: 2000,
    MAX_RETRIES: 1, // Single retry only
    MODELS_PRIORITY: [
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite-001',
        'gemini-1.5-pro'
    ]
};

// ============= TYPES =============

export interface GeminiRequest {
    prompt: string;
    modelName?: string;
    temperature?: number;
}

export interface GeminiResponse {
    success: true;
    text: string;
    modelUsed: string;
    tokensUsed?: number;
}

export interface GeminiError {
    success: false;
    error: string;
    errorType: 'VALIDATION' | 'TIMEOUT' | 'RATE_LIMIT' | 'SAFETY_BLOCK' | 'INVALID_RESPONSE' | 'API_ERROR' | 'NETWORK';
    retryable: boolean;
    details?: any;
}

export type GeminiResult = GeminiResponse | GeminiError;

// ============= LOGGING =============

interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    operation: string;
    details: any;
}

class Logger {
    private logs: LogEntry[] = [];
    private maxLogs = 100;

    log(level: LogEntry['level'], operation: string, details: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            operation,
            details
        };

        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output for development
        const prefix = `[Gemini ${level}] ${operation}:`;
        if (level === 'ERROR') {
            console.error(prefix, details);
        } else if (level === 'WARN') {
            console.warn(prefix, details);
        } else {
            console.log(prefix, details);
        }
    }

    getLogs() {
        return [...this.logs];
    }

    clearLogs() {
        this.logs = [];
    }
}

const logger = new Logger();

// ============= VALIDATION =============

function validateRequest(request: GeminiRequest): { valid: boolean; error?: string } {
    if (!request.prompt || typeof request.prompt !== 'string') {
        return { valid: false, error: 'Prompt must be a non-empty string' };
    }

    if (request.prompt.trim().length === 0) {
        return { valid: false, error: 'Prompt cannot be empty' };
    }

    if (request.prompt.length > CONFIG.MAX_PROMPT_LENGTH) {
        return {
            valid: false,
            error: `Prompt exceeds maximum length of ${CONFIG.MAX_PROMPT_LENGTH} characters (got ${request.prompt.length})`
        };
    }

    return { valid: true };
}

function sanitizePrompt(prompt: string): string {
    // Remove potential prompt injection attempts
    // Keep it simple - just trim and limit length
    return prompt
        .trim()
        .slice(0, CONFIG.MAX_PROMPT_LENGTH);
}

// ============= TIMEOUT WRAPPER =============

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
        )
    ]);
}

// ============= RETRY LOGIC =============

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============= CORE CLIENT =============

export async function generateWithGemini(request: GeminiRequest): Promise<GeminiResult> {
    const requestId = crypto.randomUUID().slice(0, 8);

    logger.log('INFO', 'Request Started', {
        requestId,
        promptLength: request.prompt.length,
        modelRequested: request.modelName || 'default'
    });

    // Validate request
    const validation = validateRequest(request);
    if (!validation.valid) {
        logger.log('ERROR', 'Validation Failed', { requestId, error: validation.error });
        return {
            success: false,
            error: validation.error!,
            errorType: 'VALIDATION',
            retryable: false
        };
    }

    // Sanitize prompt
    const sanitizedPrompt = sanitizePrompt(request.prompt);

    // Determine models to try
    const modelsToTry = request.modelName
        ? [request.modelName, ...CONFIG.MODELS_PRIORITY]
        : CONFIG.MODELS_PRIORITY;
    const uniqueModels = [...new Set(modelsToTry)];

    let lastError: any = null;
    let attemptCount = 0;

    // Try each model
    for (const modelName of uniqueModels) {
        attemptCount++;

        try {
            logger.log('INFO', 'Attempting Model', { requestId, modelName, attempt: attemptCount });

            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    temperature: request.temperature ?? 0.7,
                }
            });

            // Make request with timeout
            const result = await withTimeout(
                model.generateContent(sanitizedPrompt),
                CONFIG.REQUEST_TIMEOUT_MS
            );

            const response = await result.response;
            const text = response.text();

            // Validate response
            if (!text || text.trim().length === 0) {
                throw new Error('Empty response from model');
            }

            logger.log('INFO', 'Request Succeeded', {
                requestId,
                modelUsed: modelName,
                responseLength: text.length,
                attempt: attemptCount
            });

            return {
                success: true,
                text,
                modelUsed: modelName
            };

        } catch (error: any) {
            lastError = error;
            const errorMessage = error.message || 'Unknown error';

            // Categorize error
            let errorType: GeminiError['errorType'] = 'API_ERROR';
            let retryable = true;

            if (errorMessage.includes('timeout') || errorMessage.includes('Request timeout')) {
                errorType = 'TIMEOUT';
            } else if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
                errorType = 'API_ERROR';
                retryable = false;
            } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
                errorType = 'RATE_LIMIT';
            } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                errorType = 'SAFETY_BLOCK';
                retryable = false;
            } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                // Model not available, try next one
                errorType = 'API_ERROR';
                retryable = true; // Ensure we try the next model
            }

            logger.log('WARN', 'Model Failed', {
                requestId,
                modelName,
                errorType,
                errorMessage,
                retryable
            });

            // If non-retryable, stop immediately
            if (!retryable) {
                break;
            }

            // Add delay before next attempt
            if (attemptCount < uniqueModels.length) {
                await delay(CONFIG.RETRY_DELAY_MS);
            }
        }
    }

    // All attempts failed
    const errorMessage = lastError?.message || 'All models failed';
    logger.log('ERROR', 'Request Failed', {
        requestId,
        totalAttempts: attemptCount,
        finalError: errorMessage
    });

    return {
        success: false,
        error: errorMessage,
        errorType: 'API_ERROR',
        retryable: false,
        details: lastError
    };
}

// ============= EXPORT LOGGER FOR DEBUGGING =============

export function getGeminiLogs() {
    return logger.getLogs();
}

export function clearGeminiLogs() {
    logger.clearLogs();
}
