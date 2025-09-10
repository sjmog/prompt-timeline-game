export type GameState = "input" | "game" | "results";

export interface ModelOutput {
  year: number;
  model: string;
  output: string;
  modelId: string;
}

export interface GameResults {
  score: number;
  correctOrder: number[];
  userOrder: number[];
  timeElapsed: number;
  prompt: string;
  outputs: ModelOutput[];
}

export type ModelProvider = "huggingface" | "openrouter";
export type ModelType = "completion" | "chat";

export interface ModelConfig {
  year: number;
  model: string;
  url?: string;
  provider: ModelProvider;
  type: ModelType;
  modelId: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}
