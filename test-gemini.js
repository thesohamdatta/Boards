import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Simple .env parser
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split('\n').forEach(line => {
                const [key, ...values] = line.split('=');
                if (key && values.length > 0) {
                    let val = values.join('=').trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    process.env[key.trim()] = val;
                }
            });
        }
    } catch (e) {
        console.error("Error reading .env", e);
    }
};

loadEnv();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Error: VITE_GEMINI_API_KEY not found in .env file");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
    console.log("Testing with API Key: " + API_KEY.substring(0, 5) + "...");

    try {
        console.log("Listing available models...");
        // Note: listModels might not be available on the client SDK, but let's try a direct generation
        // to see exactly what fails.

        const modelsToTest = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

        for (const modelName of modelsToTest) {
            console.log(`\nTesting model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello, are you working?");
                const response = await result.response;
                console.log(`✅ Success with ${modelName}:`, response.text().substring(0, 50));
            } catch (e) {
                console.error(`❌ Failed with ${modelName}:`, e.message);
            }
        }

    } catch (error) {
        console.error("Global Error:", error);
    }
}

test();
