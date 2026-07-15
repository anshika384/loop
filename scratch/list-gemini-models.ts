// List available Gemini models for the current API key
import { ai } from '../lib/ai/gemini';

async function main() {
  const key = process.env.GEMINI_API_KEY;
  console.log('[1] GEMINI_API_KEY prefix:', key ? key.substring(0, 12) + '...' : 'NOT SET');

  console.log('\n[2] Listing available models...');
  if (!ai) {
    console.error("AI client is null");
    return;
  }

  try {
    const models = await ai.models.list();
    const modelList: string[] = [];
    for await (const model of models) {
      modelList.push((model as any).name || JSON.stringify(model));
    }
    console.log('Available models:');
    modelList.forEach(m => console.log(' -', m));
  } catch (err: any) {
    console.error('List models FAILED:', err.message || err);
  }

  console.log('\nDone.');
}

main().catch(console.error);
