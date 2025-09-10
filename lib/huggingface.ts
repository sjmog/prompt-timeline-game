import { InferenceClient } from '@huggingface/inference';

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || process.env.HF_ACCESS_TOKEN || process.env.HUGGING_FACE_API_KEY;
const HF_ENDPOINT_URL = process.env.HUGGINGFACE_ENDPOINT_URL;

let client: InferenceClient | null = null;

function getClient(): InferenceClient {
  if (!client) {
    client = new InferenceClient(HF_TOKEN, HF_ENDPOINT_URL ? { endpointUrl: HF_ENDPOINT_URL } : undefined);
  }
  return client;
}

export async function generateWithHuggingFace(
  prompt: string,
  model: string,
  systemPrompt: string,
  temperature: number = 0.7,
  maxTokens: number = 100
): Promise<string> {
  try {
    const hf = getClient();

    const response = await hf.chatCompletion({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
    } as any);

    // Some providers return string content, others return array of parts; normalize
    const content = response?.choices?.[0]?.message?.content as any;
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map((c: any) => (typeof c === 'string' ? c : c?.text || '')).join('');
    }
    return String(content);
  } catch (error) {
    console.error('HuggingFace Inference error:', error);
    return `[Generated response for: ${prompt.substring(0, 30)}...]`;
  }
}


