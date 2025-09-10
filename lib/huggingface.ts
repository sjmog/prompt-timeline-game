import { InferenceClient } from "@huggingface/inference";

const HF_TOKEN =
  process.env.HUGGINGFACE_API_KEY ||
  process.env.HF_ACCESS_TOKEN ||
  process.env.HUGGING_FACE_API_KEY;

let client: InferenceClient | null = null;

interface GeneratedTextResponse {
  generated_text: string;
}

function getClient(): InferenceClient {
  if (!client) {
    client = new InferenceClient(HF_TOKEN);
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
        Authorization: `Bearer ${HF_TOKEN}`,
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

    const response = await hf.chatCompletion({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
    } as any);

    // Some providers return string content, others return array of parts; normalize
    const content = response?.choices?.[0]?.message?.content as any;
    if (!content) return "";
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .map((c: any) => (typeof c === "string" ? c : c?.text || ""))
        .join("");
    }
    return String(content);
  } catch (error) {
    console.error("HuggingFace Inference error:", error);
    return `[Generated response for: ${prompt.substring(0, 30)}...]`;
  }
}
