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
