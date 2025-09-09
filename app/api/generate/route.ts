import { NextResponse } from "next/server";
import { generateWithOpenRouter } from "@/lib/openrouter";

// Model configurations for different years
const MODEL_CONFIGS = [
  {
    year: 2019,
    model: "GPT-2",
    modelId: "openai/gpt-3.5-turbo", // We'll simulate GPT-2 with temperature/prompting
    temperature: 1.5,
    maxTokens: 50,
    systemPrompt:
      "You are a very early AI from 2019. Be somewhat incoherent, make grammatical errors, and lose track of the topic. Your responses should feel primitive and often nonsensical.",
  },
  {
    year: 2020,
    model: "GPT-3",
    modelId: "openai/gpt-3.5-turbo",
    temperature: 1.2,
    maxTokens: 60,
    systemPrompt:
      "You are GPT-3 from 2020. You can form coherent sentences but sometimes drift off-topic or make logical errors. Be creative but occasionally inconsistent.",
  },
  {
    year: 2022,
    model: "GPT-3.5",
    modelId: "openai/gpt-3.5-turbo",
    temperature: 0.9,
    maxTokens: 80,
    systemPrompt:
      "You are an AI from 2022. Provide coherent, mostly accurate responses but occasionally make small mistakes or have slight inconsistencies.",
  },
  {
    year: 2023,
    model: "ChatGPT",
    modelId: "openai/gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 100,
    systemPrompt:
      "You are ChatGPT from 2023. Provide clear, helpful, and accurate responses.",
  },
  {
    year: 2024,
    model: "GPT-4",
    modelId: "openai/gpt-4-turbo-preview",
    temperature: 0.7,
    maxTokens: 100,
    systemPrompt:
      "You are GPT-4 from 2024. Provide sophisticated, nuanced, and highly accurate responses with excellent reasoning.",
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
