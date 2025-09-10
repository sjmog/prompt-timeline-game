import { NextResponse } from "next/server";
import { generateWithOpenRouter } from "@/lib/openrouter";
import { generateWithHuggingFace } from "@/lib/huggingface";

type ModelConfig = {
  year: number;
  model: string;
  provider: string;
  type: string;
  modelId: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
};

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 70;

// Model configurations for different years
const MODEL_CONFIGS: ModelConfig[] = [
  // {
  //   year: 2017,
  //   model: "GPT-1",
  //   provider: "huggingface",
  //   type: "completion",
  //   modelId:
  //     "openai-community/openai-gpt",
  //   temperature: DEFAULT_TEMPERATURE,
  //   maxTokens: DEFAULT_MAX_TOKENS,
  //   systemPrompt: "",
  // },
  {
    year: 2018,
    model: "GPT-2",
    provider: "huggingface",
    type: "completion",
    modelId:
      "https://f76lt51xliydk53k.us-east-1.aws.endpoints.huggingface.cloud",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    systemPrompt: "",
  },
  {
    year: 2020,
    model: "GPT-3",
    modelId: "meta-llama/llama-2-70b-chat",
    provider: "huggingface",
    type: "completion",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    systemPrompt:
      "",
  },
  // {
  //   year: 2023,
  //   model: "GPT-4",
  //   modelId: "openai/gpt-4-0314",
  //   provider: "openrouter",
  //   type: "chat",
  //   temperature: DEFAULT_TEMPERATURE,
  //   maxTokens: DEFAULT_MAX_TOKENS,
  //   systemPrompt:
  //     "Respond only with plain text, no markdown or other formatting.",
  // },
  {
    year: 2023,
    model: "GPT-4",
    modelId: "openai/gpt-3.5-turbo",
    provider: "openrouter",
    type: "chat",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    systemPrompt:
      "Respond only with plain text, no markdown or other formatting.",
  },
  {
    year: 2025,
    model: "GPT-5",
    modelId: "openai/gpt-5-chat",
    provider: "openrouter",
    type: "chat",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    systemPrompt:
      "Respond only with plain text, no markdown or other formatting.",
  },
];

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const outputs = await Promise.all(
      MODEL_CONFIGS.map(async (config) => {
        let output: string | undefined = undefined;

        if (config.provider === "huggingface") {
          output = await generateWithHuggingFace(
            prompt,
            config.type,
            config.modelId,
            config.systemPrompt,
            config.temperature,
            config.maxTokens
          );
        } else if (config.provider === "openrouter") {
          output = await generateWithOpenRouter(
            prompt,
            config.type,
            config.modelId,
            config.systemPrompt,
            config.temperature,
            config.maxTokens
          );
        }

        // remove the trailing sentence of the output, but keep all other sentences

        const sentenceEnders = [".", "!", "?", "\n", "\r", "\t", "\""];

        const sentences = output?.split(sentenceEnders.join("|"));
        if (sentences) {
          if (sentences.length > 1) sentences.pop();
          output = sentences.join(".") + ".";
        } else {
          output = output?.trim() + ".";
        }

        return {
          year: config.year,
          model: config.model,
          modelId: config.modelId,
          output: output || `[${config.model} response]`,
        };
      })
    );

    return NextResponse.json({ outputs });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate outputs" },
      { status: 500 }
    );
  }
}
