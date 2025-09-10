import { InferenceClient } from "@huggingface/inference";
import type {
  ChatCompletionInput,
  ChatCompletionOutput,
} from "@huggingface/tasks";

let client: InferenceClient | null = null;

interface GeneratedTextResponse {
  generated_text: string;
}

function getClient(): InferenceClient {
  if (!client) {
    client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
  }
  return client;
}

async function generateWithInput(
  model: string,
  prompt: string,
  systemPrompt: string,
  temperature: number | undefined,
  maxTokens: number | undefined,
  url?: string
): Promise<GeneratedTextResponse> {
  if (url) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: `${systemPrompt} ${prompt}`,
        parameters: {
          temperature: temperature ?? 0.7,
          max_new_tokens: maxTokens ?? 100,
        },
      }),
    });
    return (await response.json())[0];
  }

  const hf = getClient();
  return await hf.textGeneration({
    model,
    inputs: `${systemPrompt} ${prompt}`,
    parameters: {
      temperature: temperature ?? 0.7,
      max_new_tokens: maxTokens ?? 100,
    },
  });
}

export async function generateWithHuggingFace(
  prompt: string,
  type: string,
  model: string,
  systemPrompt: string,
  temperature: number = 0.7,
  maxTokens: number = 100,
  url?: string
): Promise<string> {
  if (type === "completion") {
    try {
      const response: GeneratedTextResponse = await generateWithInput(
        model,
        prompt,
        systemPrompt,
        temperature,
        maxTokens,
        url
      );

      return String(
        response.generated_text
          .replaceAll(systemPrompt, "")
          .replaceAll(prompt, "")
          .trim()
      );
    } catch (error) {
      console.error("HuggingFace Inference error:", error);
      return `[Generated response for: ${prompt.substring(0, 30)}...]`;
    }
  }
  try {
    const hf = getClient();

    const response: ChatCompletionOutput = await hf.chatCompletion({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
    } as ChatCompletionInput);

    const content: string | undefined =
      response?.choices?.[0]?.message?.content;
    if (!content) return "";
    if (typeof content === "string") return content;
    return String(content);
  } catch (error) {
    console.error("HuggingFace Inference error:", error);
    return `[Generated response for: ${prompt.substring(0, 30)}...]`;
  }
}
