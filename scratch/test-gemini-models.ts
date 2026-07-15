// Test Gemini API connectivity and model validity
import { ai } from '../lib/ai/gemini';

async function main() {
  const key = process.env.GEMINI_API_KEY;
  console.log('[1] GEMINI_API_KEY present:', !!key);
  console.log('[2] Key prefix:', key ? key.substring(0, 12) + '...' : 'NOT SET');

  if (!ai) {
    console.error("AI client is null");
    return;
  }

  console.log('\n[3] Testing gemini-3.5-flash (model used in themes.ts)...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Respond with: OK',
    });
    console.log('[3] gemini-3.5-flash response:', response.text);
  } catch (err: any) {
    console.error('[3] gemini-3.5-flash FAILED:', err.message || err);
  }

  console.log('\n[4] Testing gemini-2.0-flash (correct model name)...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Respond with: OK',
    });
    console.log('[4] gemini-2.0-flash response:', response.text);
  } catch (err: any) {
    console.error('[4] gemini-2.0-flash FAILED:', err.message || err);
  }

  console.log('\n[5] Testing gemini-1.5-flash (another valid model)...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'Respond with: OK',
    });
    console.log('[5] gemini-1.5-flash response:', response.text);
  } catch (err: any) {
    console.error('[5] gemini-1.5-flash FAILED:', err.message || err);
  }

  console.log('\nDone.');
}

main().catch(console.error);
