import { NextResponse } from "next/server";
import { generateWithHuggingFace } from "@/lib/huggingface";

// Model configurations for different years (HuggingFace-friendly models)
const MODEL_CONFIGS = [
  {
    year: 2019,
    model: "GPT-2",
    modelId: "openai-community/gpt2", // approximate with instruction model
    temperature: 1.5,
    maxTokens: 50,
    systemPrompt:
      "You are GPT-2 from 2019. Your responses should feel primitive and often nonsensical.",
  },
  {
    year: 2020,
    model: "GPT-3",
    modelId: "mistralai/Mistral-7B-Instruct-v0.3",
    temperature: 0.7,
    maxTokens: 50,
    systemPrompt: "Respond only with plain text, no markdown or other formatting.",
  },
  {
    year: 2023,
    model: "GPT-4",
    modelId: "meta-llama/Llama-3-70b-instruct",
    temperature: 0.7,
    maxTokens: 50,
    systemPrompt: "Respond only with plain text, no markdown or other formatting.",
  },
  {
    year: 2024,
    model: "GPT-4o",
    modelId: "meta-llama/Llama-3.1-70B-Instruct",
    temperature: 0.7,
    maxTokens: 50,
    systemPrompt: "Respond only with plain text, no markdown or other formatting.",
  },
  {
    year: 2025,
    model: "GPT-5",
    modelId: "Qwen/Qwen2.5-72B-Instruct",
    temperature: 0.7,
    maxTokens: 50,
    systemPrompt: "Respond only with plain text, no markdown or other formatting.",
  },
];

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const outputs = await Promise.all(
      MODEL_CONFIGS.map(async (config) => {
        const output = await generateWithHuggingFace(
          prompt,
          config.modelId,
          config.systemPrompt,
          config.temperature,
          config.maxTokens
        );

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
    console.error("HF API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate outputs (HF)" },
      { status: 500 }
    );
  }
}


