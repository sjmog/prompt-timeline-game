import { NextResponse } from "next/server";
import { generateWithOpenRouter } from "@/lib/openrouter";
import { generateWithHuggingFace } from "@/lib/huggingface";
import { sanitized } from "@/lib/utils";
import { MODEL_CONFIGS } from "@/data";

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
        let output: string = `[${config.model} response]`;

        if (config.provider === "huggingface") {
          output = await generateWithHuggingFace(
            prompt,
            config.type,
            config.modelId,
            config.systemPrompt,
            config.temperature,
            config.maxTokens,
            config.url
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

        return {
          year: config.year,
          model: config.model,
          modelId: config.modelId,
          output: sanitized(output),
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
