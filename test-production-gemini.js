/**
 * Quick test to verify the production Gemini integration works end-to-end
 */

import { parseScriptWithGemini } from './src/lib/script-parser.js';
import { generateStoryboardImage } from './src/lib/image-generator.js';
import { getGeminiLogs } from './src/lib/gemini-client.js';
import fs from 'fs';

const testScript = `
INT. COFFEE SHOP - DAY

SARAH, a young detective in her 30s, sits across from MIKE, a nervous witness.

SARAH
Tell me what you saw that night.

MIKE shifts uncomfortably, avoiding eye contact.

MIKE
I... I'm not sure I should be talking to you.

SARAH leans forward, her expression softening.

SARAH
Mike, I need your help. A woman's life could depend on it.

MIKE takes a deep breath, finally meeting her gaze.

MIKE
Okay. I'll tell you everything.
`;

async function runTests() {
    console.log('🧪 TESTING PRODUCTION GEMINI INTEGRATION\n');

    // Test 1: Script Parsing
    console.log('1️⃣ Testing script parsing...');
    const parseResult = await parseScriptWithGemini(testScript, 'Mystery');

    if (!parseResult.success) {
        console.error('❌ Parse failed:', parseResult.userMessage);
        console.error('   Error:', parseResult.error);
        return;
    }

    console.log('✅ Parse succeeded!');
    console.log(`   Scenes: ${parseResult.scenes.length}`);
    console.log(`   Characters: ${parseResult.characters.length}`);
    console.log(`   Warnings: ${parseResult.warnings.length}`);

    if (parseResult.scenes.length > 0) {
        console.log('\n   First Scene:');
        console.log(`   - Location: ${parseResult.scenes[0].location}`);
        console.log(`   - Time: ${parseResult.scenes[0].time_of_day}`);
        console.log(`   - Description: ${parseResult.scenes[0].description.slice(0, 80)}...`);
    }

    if (parseResult.characters.length > 0) {
        console.log('\n   Characters:');
        parseResult.characters.forEach(char => {
            console.log(`   - ${char.name}: ${char.description.slice(0, 60)}...`);
        });
    }

    // Test 2: Image Generation
    console.log('\n2️⃣ Testing image generation...');
    const imageResult = await generateStoryboardImage(
        'INT. COFFEE SHOP - DAY. Detective interrogates witness.',
        'Sarah leans forward, her expression softening',
        'Eye Level',
        'Medium',
        parseResult.characters,
        'sketch'
    );

    if (!imageResult.success) {
        console.log('⚠️  Image generation failed (using placeholder)');
        console.log(`   Error: ${imageResult.userMessage}`);
        console.log(`   Placeholder URL length: ${imageResult.placeholderUrl.length}`);
    } else {
        console.log('✅ Image generated!');
        console.log(`   Format: ${imageResult.format}`);
        console.log(`   URL length: ${imageResult.imageUrl.length} chars`);

        // Save SVG to file
        const svg = decodeURIComponent(imageResult.imageUrl.replace('data:image/svg+xml;charset=UTF-8,', ''));
        fs.writeFileSync('test-storyboard-output.svg', svg);
        console.log('   💾 Saved to test-storyboard-output.svg');
    }

    // Test 3: Error Handling
    console.log('\n3️⃣ Testing error handling...');
    const emptyResult = await parseScriptWithGemini('', 'Drama');
    console.log(`   Empty script: ${emptyResult.success ? '❌ Should fail' : '✅ Correctly rejected'}`);
    if (!emptyResult.success) {
        console.log(`   Message: "${emptyResult.userMessage}"`);
    }

    const shortResult = await parseScriptWithGemini('A man.', 'Drama');
    console.log(`   Too short: ${shortResult.success ? '❌ Should fail' : '✅ Correctly rejected'}`);
    if (!shortResult.success) {
        console.log(`   Message: "${shortResult.userMessage}"`);
    }

    // Show logs
    console.log('\n📋 Gemini API Logs:');
    const logs = getGeminiLogs();
    logs.slice(-5).forEach(log => {
        console.log(`   [${log.level}] ${log.operation}`);
    });

    console.log('\n✨ All tests complete!\n');
}

runTests().catch(err => {
    console.error('💥 Test failed:', err);
    process.exit(1);
});
