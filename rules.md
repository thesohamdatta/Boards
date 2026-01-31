# Bulletproof Development Prompt: Storyboard AI

## Critical Instruction Header

```
⚠️ ABSOLUTE REQUIREMENTS - READ BEFORE CODING ⚠️

You are NOT writing a demo. You are NOT creating a prototype.
You are building PRODUCTION SOFTWARE that MUST work COMPLETELY.

Every single line of code you write will be used by REAL USERS.
If something doesn't work, the APPLICATION FAILS.

ZERO TOLERANCE for:
❌ "This should work theoretically"
❌ Placeholder functions that do nothing
❌ Incomplete implementations
❌ Untested code
❌ "TODO" comments for critical features
❌ Mock data instead of real functionality
❌ Half-finished features

MANDATORY for EVERY response:
✅ Complete, working code only
✅ Full error handling for every operation
✅ Test each function mentally before writing
✅ Verify all imports/dependencies exist
✅ Check compatibility with existing code
✅ Ensure no breaking changes to working features
```

---

## Context Loading Protocol

**BEFORE writing ANY code, you MUST:**

### Step 1: Understand Current State
```
1. READ the existing codebase structure
2. IDENTIFY what already works
3. LIST all dependencies in package.json
4. MAP the current component hierarchy
5. LOCATE the state management approach
6. FIND existing API integration points
7. CHECK for any Lovable/cloud dependencies still present
```

### Step 2: Verify Prerequisites
```
ASK YOURSELF:
- Do I have ALL required dependencies installed?
- Are there any conflicting libraries?
- Is the existing code structure compatible with my changes?
- Will my code break existing functionality?
- Have I checked for TypeScript errors?

IF ANSWER IS "NO" TO ANY:
→ STOP and REQUEST clarification
→ DO NOT proceed with assumptions
```

### Step 3: Plan Implementation
```
BEFORE CODING:
1. Write step-by-step implementation plan
2. Identify potential failure points
3. Plan error handling for each step
4. Consider edge cases
5. Verify against requirements

ONLY THEN: Begin coding
```

---

## Coding Standards Enforcement

### Rule 1: Complete Implementations Only

```typescript
❌ NEVER DO THIS:
function generateStoryboard(script: string) {
  // TODO: Implement later
  return [];
}

✅ ALWAYS DO THIS:
function generateStoryboard(script: string): Shot[] {
  try {
    if (!script || script.trim().length === 0) {
      throw new Error('Script cannot be empty');
    }
    
    const scenes = parseScript(script);
    const shots = scenes.flatMap(scene => generateShotsFromScene(scene));
    
    return shots;
  } catch (error) {
    console.error('Failed to generate storyboard:', error);
    throw new Error(`Storyboard generation failed: ${error.message}`);
  }
}
```

### Rule 2: Bulletproof Error Handling

```typescript
❌ NEVER DO THIS:
async function saveProject(project: Project) {
  await storage.save(project);
}

✅ ALWAYS DO THIS:
async function saveProject(project: Project): Promise<SaveResult> {
  // Validate input
  if (!project || !project.id) {
    return {
      success: false,
      error: 'Invalid project: missing ID'
    };
  }

  try {
    // Check storage availability
    if (!isStorageAvailable()) {
      return {
        success: false,
        error: 'Storage not available. Please check browser settings.'
      };
    }

    // Check storage quota
    const quota = await checkStorageQuota();
    const projectSize = estimateProjectSize(project);
    
    if (quota.remaining < projectSize) {
      return {
        success: false,
        error: 'Not enough storage space. Please delete old projects.',
        needsCleanup: true
      };
    }

    // Perform save with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        await storage.save(project);
        return {
          success: true,
          savedAt: new Date(),
          size: projectSize
        };
      } catch (retryError) {
        attempts++;
        if (attempts >= maxAttempts) throw retryError;
        await delay(1000 * attempts); // Exponential backoff
      }
    }
  } catch (error) {
    console.error('Save project failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      technical: error
    };
  }
}

// Helper type
interface SaveResult {
  success: boolean;
  error?: string;
  savedAt?: Date;
  size?: number;
  needsCleanup?: boolean;
  technical?: any;
}
```

### Rule 3: Defensive Programming

```typescript
❌ NEVER ASSUME ANYTHING EXISTS:
function getProjectTitle(project) {
  return project.title.toUpperCase(); // WILL CRASH
}

✅ ALWAYS VALIDATE:
function getProjectTitle(project: Project | null | undefined): string {
  if (!project) {
    return 'Untitled Project';
  }
  
  if (!project.title || typeof project.title !== 'string') {
    return 'Untitled Project';
  }
  
  return project.title.trim().toUpperCase();
}
```

### Rule 4: Type Safety

```typescript
❌ AVOID 'any' TYPE:
function processData(data: any) {
  return data.map(item => item.value); // Unsafe
}

✅ USE PROPER TYPES:
interface DataItem {
  id: string;
  value: number;
  metadata?: Record<string, unknown>;
}

function processData(data: DataItem[] | null): number[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return data
    .filter((item): item is DataItem => 
      item !== null && 
      typeof item === 'object' && 
      'value' in item &&
      typeof item.value === 'number'
    )
    .map(item => item.value);
}
```

---

## Component Implementation Checklist

### For EVERY Component You Create:

```tsx
✅ MANDATORY CHECKLIST:

□ Import statements (verify each import exists)
□ TypeScript interfaces/types defined
□ Props validation with default values
□ State initialization with proper types
□ Effect cleanup (useEffect return functions)
□ Error boundaries or try-catch blocks
□ Loading states handled
□ Empty states handled
□ Error states handled
□ Accessibility attributes (aria-labels, roles)
□ Keyboard navigation support
□ Responsive design considerations
□ Performance optimizations (useMemo, useCallback where needed)
□ No console.log in final code
□ Comments for complex logic only
```

### Example Perfect Component:

```tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

// ✅ Clear interfaces
interface Shot {
  id: string;
  imageUrl?: string;
  shotNumber: string;
  duration: number;
}

interface ShotListProps {
  shots: Shot[];
  onShotSelect: (shotId: string) => void;
  onShotDelete: (shotId: string) => void;
  selectedShotId?: string;
}

// ✅ Component with full implementation
export const ShotList: React.FC<ShotListProps> = ({
  shots = [], // Default value
  onShotSelect,
  onShotDelete,
  selectedShotId
}) => {
  // ✅ State with proper types
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Memoized calculations
  const totalDuration = useMemo(() => {
    return shots.reduce((sum, shot) => sum + (shot.duration || 0), 0);
  }, [shots]);

  // ✅ Callbacks to prevent re-renders
  const handleSelect = useCallback((shotId: string) => {
    try {
      onShotSelect(shotId);
      setError(null);
    } catch (err) {
      setError('Failed to select shot');
      console.error('Shot selection error:', err);
    }
  }, [onShotSelect]);

  const handleDelete = useCallback((shotId: string) => {
    if (!confirm('Delete this shot?')) return;
    
    try {
      onShotDelete(shotId);
      setError(null);
    } catch (err) {
      setError('Failed to delete shot');
      console.error('Shot deletion error:', err);
    }
  }, [onShotDelete]);

  // ✅ Effect with cleanup
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Async operations here
        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load shots');
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading shots...</div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500 rounded">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <span className="text-red-400">{error}</span>
      </div>
    );
  }

  // ✅ Empty state
  if (!shots || shots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-400 mb-4">No shots yet</p>
        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          Create First Shot
        </button>
      </div>
    );
  }

  // ✅ Main render with proper structure
  return (
    <div className="flex flex-col h-full">
      {/* Header with info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            Shots ({shots.length})
          </h3>
          <span className="text-sm text-gray-400">
            Total: {totalDuration}s
          </span>
        </div>
      </div>

      {/* Scrollable shot list */}
      <div className="flex-1 overflow-y-auto">
        {shots.map((shot) => (
          <div
            key={shot.id}
            className={`
              p-4 border-b border-gray-700 cursor-pointer
              hover:bg-gray-800 transition-colors
              ${selectedShotId === shot.id ? 'bg-purple-900/30 border-l-4 border-l-purple-500' : ''}
            `}
            onClick={() => handleSelect(shot.id)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSelect(shot.id);
              }
            }}
            aria-label={`Shot ${shot.shotNumber}`}
            aria-selected={selectedShotId === shot.id}
          >
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              {shot.imageUrl ? (
                <img
                  src={shot.imageUrl}
                  alt={`Shot ${shot.shotNumber}`}
                  className="w-20 h-12 object-cover rounded"
                  loading="lazy"
                />
              ) : (
                <div className="w-20 h-12 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">No image</span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="font-medium text-white">
                  Shot {shot.shotNumber}
                </div>
                <div className="text-sm text-gray-400">
                  {shot.duration}s
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(shot.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded"
                aria-label="Delete shot"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## API Integration Requirements

### For EVERY API Call:

```typescript
// ✅ COMPLETE API INTEGRATION TEMPLATE

interface APIConfig {
  provider: 'gemini' | 'openai' | 'local';
  apiKey?: string;
  endpoint?: string;
  timeout?: number;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  retryable?: boolean;
}

class APIService {
  private config: APIConfig;
  private controller: AbortController | null = null;

  constructor(config: APIConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  // ✅ Validation before any operation
  private validateConfig(config: APIConfig): void {
    if (!config.provider) {
      throw new Error('API provider is required');
    }

    if (config.provider !== 'local' && !config.apiKey) {
      throw new Error(`API key required for ${config.provider}`);
    }

    if (config.provider === 'local' && !config.endpoint) {
      throw new Error('Endpoint required for local provider');
    }
  }

  // ✅ Full request implementation
  async generateImage(prompt: string, options: GenerationOptions): Promise<APIResponse<GeneratedImage>> {
    // Input validation
    if (!prompt || prompt.trim().length === 0) {
      return {
        success: false,
        error: 'Prompt cannot be empty'
      };
    }

    // Cancel previous request if exists
    if (this.controller) {
      this.controller.abort();
    }

    this.controller = new AbortController();
    const timeout = this.config.timeout || 60000;

    try {
      // Timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      );

      // Actual request
      const requestPromise = this.makeRequest(prompt, options);

      // Race between request and timeout
      const response = await Promise.race([requestPromise, timeoutPromise]);

      return {
        success: true,
        data: response,
        statusCode: 200
      };

    } catch (error: any) {
      console.error('API request failed:', error);

      // Handle specific error types
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request was cancelled',
          retryable: false
        };
      }

      if (error.message === 'Request timeout') {
        return {
          success: false,
          error: 'Request timed out. Please try again.',
          retryable: true
        };
      }

      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid API key. Please check your settings.',
          statusCode: 401,
          retryable: false
        };
      }

      if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please wait and try again.',
          statusCode: 429,
          retryable: true
        };
      }

      if (error.response?.status >= 500) {
        return {
          success: false,
          error: 'Server error. Please try again later.',
          statusCode: error.response.status,
          retryable: true
        };
      }

      // Network errors
      if (!error.response) {
        return {
          success: false,
          error: 'Network error. Please check your connection.',
          retryable: true
        };
      }

      // Generic error
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        retryable: false
      };
    } finally {
      this.controller = null;
    }
  }

  // ✅ Actual request implementation based on provider
  private async makeRequest(prompt: string, options: GenerationOptions): Promise<GeneratedImage> {
    switch (this.config.provider) {
      case 'gemini':
        return this.requestGemini(prompt, options);
      case 'openai':
        return this.requestOpenAI(prompt, options);
      case 'local':
        return this.requestLocal(prompt, options);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async requestGemini(prompt: string, options: GenerationOptions): Promise<GeneratedImage> {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.config.apiKey!
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2048
        }
      }),
      signal: this.controller?.signal
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse and validate response
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('Invalid response from Gemini API');
    }

    return {
      url: data.candidates[0].content.parts[0].text,
      provider: 'gemini',
      generatedAt: new Date()
    };
  }

  // ✅ Implement for other providers similarly
  private async requestOpenAI(prompt: string, options: GenerationOptions): Promise<GeneratedImage> {
    // Full OpenAI implementation here
    throw new Error('OpenAI provider not yet implemented');
  }

  private async requestLocal(prompt: string, options: GenerationOptions): Promise<GeneratedImage> {
    // Full local model implementation here
    throw new Error('Local provider not yet implemented');
  }

  // ✅ Cleanup method
  cancel(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
}
```

---

## State Management Requirements

```typescript
// ✅ COMPLETE STATE MANAGEMENT EXAMPLE

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoryboardState {
  // Data
  currentProject: Project | null;
  projects: ProjectMetadata[];
  shots: Shot[];
  selectedShotId: string | null;
  
  // UI State
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions - ALL must be implemented
  setCurrentProject: (project: Project | null) => void;
  addShot: (shot: Shot) => void;
  updateShot: (id: string, updates: Partial<Shot>) => void;
  deleteShot: (id: string) => void;
  selectShot: (id: string | null) => void;
  saveProject: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  generateShots: (script: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useStoryboardStore = create<StoryboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProject: null,
      projects: [],
      shots: [],
      selectedShotId: null,
      isGenerating: false,
      isSaving: false,
      error: null,

      // ✅ Simple setters
      setCurrentProject: (project) => set({ currentProject: project }),
      selectShot: (id) => set({ selectedShotId: id }),
      setError: (error) => set({ error }),

      // ✅ Complex operations with full implementation
      addShot: (shot) => set((state) => ({
        shots: [...state.shots, shot],
        error: null
      })),

      updateShot: (id, updates) => set((state) => ({
        shots: state.shots.map(shot =>
          shot.id === id ? { ...shot, ...updates } : shot
        ),
        error: null
      })),

      deleteShot: (id) => set((state) => ({
        shots: state.shots.filter(shot => shot.id !== id),
        selectedShotId: state.selectedShotId === id ? null : state.selectedShotId,
        error: null
      })),

      // ✅ Async operations with full error handling
      saveProject: async () => {
        const { currentProject } = get();
        
        if (!currentProject) {
          set({ error: 'No project to save' });
          return;
        }

        set({ isSaving: true, error: null });

        try {
          const storageService = new StorageService();
          const result = await storageService.saveProject(currentProject);

          if (!result.success) {
            throw new Error(result.error || 'Save failed');
          }

          set({ 
            isSaving: false,
            currentProject: {
              ...currentProject,
              updatedAt: new Date()
            }
          });

        } catch (error: any) {
          console.error('Save project failed:', error);
          set({ 
            isSaving: false,
            error: `Failed to save: ${error.message}`
          });
        }
      },

      loadProject: async (id) => {
        set({ isGenerating: true, error: null });

        try {
          const storageService = new StorageService();
          const project = await storageService.loadProject(id);

          if (!project) {
            throw new Error('Project not found');
          }

          set({
            currentProject: project,
            shots: project.shots || [],
            selectedShotId: null,
            isGenerating: false,
            error: null
          });

        } catch (error: any) {
          console.error('Load project failed:', error);
          set({
            isGenerating: false,
            error: `Failed to load: ${error.message}`
          });
        }
      },

      generateShots: async (script) => {
        set({ isGenerating: true, error: null });

        try {
          // Validate input
          if (!script || script.trim().length === 0) {
            throw new Error('Script cannot be empty');
          }

          // Parse script
          const parser = new ScriptParser();
          const scenes = parser.parse(script);

          if (!scenes || scenes.length === 0) {
            throw new Error('No scenes found in script');
          }

          // Generate shots
          const generator = new ShotGenerator();
          const newShots: Shot[] = [];

          for (const scene of scenes) {
            const sceneShots = await generator.generateFromScene(scene);
            newShots.push(...sceneShots);
          }

          // Update state
          set({
            shots: newShots,
            isGenerating: false,
            error: null
          });

        } catch (error: any) {
          console.error('Generate shots failed:', error);
          set({
            isGenerating: false,
            error: `Generation failed: ${error.message}`
          });
        }
      }
    }),
    {
      name: 'storyboard-storage',
      partialize: (state) => ({
        // Only persist these fields
        currentProject: state.currentProject,
        projects: state.projects
      })
    }
  )
);
```

---

## Testing Your Code Mentally

### BEFORE submitting code, ask yourself:

```
1. DATA FLOW
   ✓ Where does the data come from?
   ✓ How is it transformed?
   ✓ Where does it go?
   ✓ What happens if it's null/undefined?

2. ERROR CASES
   ✓ What if the network fails?
   ✓ What if storage is full?
   ✓ What if the user provides invalid input?
   ✓ What if the API returns an error?
   ✓ What if a dependency is missing?

3. EDGE CASES
   ✓ Empty arrays/objects
   ✓ Very large datasets (1000+ items)
   ✓ Special characters in strings
   ✓ Concurrent operations
   ✓ Browser compatibility

4. PERFORMANCE
   ✓ Will this cause unnecessary re-renders?
   ✓ Is this operation expensive?
   ✓ Should this be memoized?
   ✓ Will this block the UI?

5. USER EXPERIENCE
   ✓ Does the user know what's happening?
   ✓ Is there feedback for long operations?
   ✓ Can the user recover from errors?
   ✓ Is the interface responsive?
```

---

## Final Output Format

### When providing code, ALWAYS include:

```markdown
## Implementation: [Feature Name]

### What This Does
[2-3 sentences explaining the feature]

### Files Modified/Created
- `src/components/FeatureName.tsx` - Main component
- `src/hooks/useFeature.ts` - Custom hook
- `src/types/feature.ts` - Type definitions

### Dependencies Required
```json
{
  "dependency-name": "^1.0.0"
}
```
(If none needed, state "No new dependencies")

### Code

[Full, complete, working code here]

### How to Test
1. Step 1
2. Step 2
3. Expected result

### Error Handling
- Network failure: [what happens]
- Invalid input: [what happens]
- Storage full: [what happens]

### Known Limitations
- [Any limitations, if applicable]

### Next Steps
- [What should be implemented next]
```

---

## Emergency Checklist (Use Before Every Response)

```
⚠️ BEFORE CLICKING SEND:

□ Did I read the existing code structure?
□ Did I verify all imports exist?
□ Did I handle ALL error cases?
□ Did I include loading states?
□ Did I include empty states?
□ Did I add proper TypeScript types?
□ Did I test the logic mentally?
□ Did I avoid placeholder/TODO code?
□ Did I write complete implementations?
□ Did I follow the design system?
□ Did I include error messages for users?
□ Did I consider performance?
□ Did I add accessibility attributes?
□ Can a developer copy-paste this and it WILL work?

IF ANY ANSWER IS "NO" → REVISE BEFORE SENDING
```

---

## The Ultimate Rule

```
🎯 THE GOLDEN RULE 🎯

If you wouldn't ship this code to production yourself,
DON'T write it.

Every function must work.
Every error must be handled.
Every edge case must be considered.

The user deserves WORKING software, not excuses.
```

---

**Now, with this prompt in mind, implement the feature completely and correctly. No shortcuts. No placeholders. Production-ready code only.**