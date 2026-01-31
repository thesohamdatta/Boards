
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Manual ENV parser since we can't reliably rely on dotenv/process in all environments
function getApiKey() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            const match = content.match(/VITE_GEMINI_API_KEY=(.*)/);
            if (match && match[1]) {
                let key = match[1].trim();
                // Remove quotes if present
                if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
                    key = key.slice(1, -1);
                }
                return key;
            }
        }
    } catch (e) {
        console.error("Error reading .env", e);
    }
    return process.env.VITE_GEMINI_API_KEY;
}

const API_KEY = getApiKey();

if (!API_KEY) {
    console.error("❌ NO API KEY FOUND. Please check .env file.");
    process.exit(1);
}

console.log(`🔑 API Key found: ${API_KEY.substring(0, 5)}...`);

const genAI = new GoogleGenerativeAI(API_KEY);

const MODELS_TO_TEST = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro"
];

async function testAllModels() {
    console.log("🔍 Testing Model Availability...\n");

    for (const modelName of MODELS_TO_TEST) {
        process.stdout.write(`Testing ${modelName.padEnd(25)}: `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test.");
            const response = await result.response;
            console.log(`✅ OK (${response.text().trim()})`);
        } catch (e) {
            if (e.message.includes('404')) {
                console.log(`❌ 404 Not Found (Model doesn't exist or no access)`);
            } else if (e.message.includes('API key')) {
                console.log(`❌ API Key Error`);
            } else {
                console.log(`❌ Error: ${e.message.split('[')[0].trim()}`);
            }
        }
    }
}

testAllModels();
