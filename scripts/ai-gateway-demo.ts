import { generateText } from 'ai';

async function main() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    console.error('Set AI_GATEWAY_API_KEY in .env.local before running the demo.');
    process.exitCode = 1;
    return;
  }

  try {
    const { text } = await generateText({
      model: 'openai/gpt-5.5',
      prompt: 'Invent a new holiday and describe its traditions.',
    });

    console.log(text);
  } catch {
    // SDK errors may contain request details; never print credentials.
    console.error('AI Gateway request failed. Verify the key, model ID, and account access.');
    process.exitCode = 1;
  }
}

void main();
