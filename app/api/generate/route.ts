import { NextResponse } from "next/server";
import { generateWithOpenRouter } from "@/lib/openrouter";

// Model configurations for different years
const MODEL_CONFIGS = [
  {
    year: 2019,
    model: "GPT-2",
    modelId: "openai/gpt-5-chat", // We'll simulate GPT-2 with temperature/prompting
    temperature: 1.5,
    maxTokens: 50,
    systemPrompt:
      "You are GPT-2 from 2019. Your responses should feel primitive and often nonsensical.",
  },
  {
    year: 2020,
    model: "GPT-3",
    modelId: "meta-llama/llama-2-70b-chat",
    temperature: 0.7,
    maxTokens: 50,
    systemPrompt:
      "Respond only with plain text, no markdown or other formatting.",
  },
  {
    year: 2023,
    model: "GPT-4",
    modelId: "openai/gpt-4",
    temperature: 0.7,
    maxTokens: 50,
    systemPrompt:
      "Respond only with plain text, no markdown or other formatting.",
  },
  {
    year: 2024,
    model: "GPT-4o",
    modelId: "openai/gpt-4o",
    temperature: 0.7,
    maxTokens: 50,
    systemPrompt:
      "Respond only with plain text, no markdown or other formatting.",
  },
  {
    year: 2025,
    model: "GPT-5",
    modelId: "openai/gpt-5-chat",
    temperature: 0.7,
    maxTokens: 50,
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

    // Generate outputs for each year
    const outputs = await Promise.all(
      MODEL_CONFIGS.map(async (config) => {
        const output = await generateWithOpenRouter(
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
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate outputs" },
      { status: 500 }
    );
  }
}
