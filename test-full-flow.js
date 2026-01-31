import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Manual ENV parser
function getApiKey() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            const match = content.match(/VITE_GEMINI_API_KEY=(.*)/);
            if (match && match[1]) {
                let key = match[1].trim();
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
    console.error("❌ NO API KEY FOUND");
    process.exit(1);
}

console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);

const genAI = new GoogleGenerativeAI(API_KEY);

async function testFullFlow() {
    console.log("\n🧪 TESTING FULL IMAGE GENERATION FLOW\n");

    // Test 1: Simple text generation
    console.log("1️⃣ Testing basic text generation...");
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent("Say 'Hello World' and nothing else.");
        const response = await result.response;
        console.log(`   ✅ Text generation works: "${response.text().trim()}"`);
    } catch (e) {
        console.log(`   ❌ Text generation failed: ${e.message}`);
        return;
    }

    // Test 2: SVG generation (what the app actually does)
    console.log("\n2️⃣ Testing SVG generation (storyboard use case)...");
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `
      Create a simple, thick-line SVG illustration for a storyboard shot.
      Scene: INT. OFFICE - DAY. A detective sits at a desk.
      Shot Action: Close-up of detective's face, looking concerned
      Camera: Eye Level, Close-Up
      Style: sketch
      
      Return ONLY the raw SVG code starting with <svg and ending with </svg>. 
      Do not include markdown blocks. 
      Keep it simple, black and white, wireframe style.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let svgContent = response.text();

        // Cleanup
        svgContent = svgContent.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();

        if (svgContent.startsWith('<svg')) {
            console.log(`   ✅ SVG generation works!`);
            console.log(`   📏 SVG length: ${svgContent.length} characters`);

            // Save to file for inspection
            fs.writeFileSync('test-output.svg', svgContent);
            console.log(`   💾 Saved to test-output.svg`);

            // Create data URL (what the app uses)
            const dataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`;
            console.log(`   🔗 Data URL length: ${dataUrl.length} characters`);
            console.log(`   🔗 Data URL preview: ${dataUrl.substring(0, 100)}...`);
        } else {
            console.log(`   ❌ SVG generation returned invalid format`);
            console.log(`   📄 First 200 chars: ${svgContent.substring(0, 200)}`);
        }
    } catch (e) {
        console.log(`   ❌ SVG generation failed: ${e.message}`);
    }

    // Test 3: Fallback mechanism
    console.log("\n3️⃣ Testing fallback mechanism...");
    const modelsToTry = ['gemini-INVALID', 'gemini-2.5-flash', 'gemini-2.0-flash'];

    for (const modelName of modelsToTry) {
        try {
            const m = genAI.getGenerativeModel({ model: modelName });
            const result = await m.generateContent("Test");
            await result.response;
            console.log(`   ✅ ${modelName} works`);
            break;
        } catch (e) {
            console.log(`   ❌ ${modelName} failed: ${e.message.split('\n')[0]}`);
        }
    }

    console.log("\n✨ Test complete!\n");
}

testFullFlow();
