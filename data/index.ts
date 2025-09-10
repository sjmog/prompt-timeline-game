import { ModelConfig } from "@/types";

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 70;

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    year: 2018,
    model: "GPT-2",
    provider: "huggingface",
    type: "completion",
    modelId: "gpt-2",
    url: "https://f76lt51xliydk53k.us-east-1.aws.endpoints.huggingface.cloud",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    systemPrompt: "",
  },
  {
    year: 2020,
    model: "GPT-3",
    modelId: "unsloth/llama-2-13b",
    provider: "huggingface",
    type: "completion",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    systemPrompt: "Prompt:",
  },
  {
    year: 2023,
    model: "GPT-4",
    modelId: "openai/gpt-4-0314",
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