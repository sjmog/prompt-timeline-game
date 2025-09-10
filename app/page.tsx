"use client";

import { useState } from "react";
import { PromptInput, TimelineGame, ResultsShare } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { GameState, ModelOutput, GameResults } from "@/types";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("input");
  const [prompt, setPrompt] = useState("");
  const [outputs, setOutputs] = useState<ModelOutput[]>([]);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePromptSubmit = async (submittedPrompt: string) => {
    setPrompt(submittedPrompt);
    setLoading(true);

    try {
      const response = await fetch("/api/generate-hf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: submittedPrompt }),
      });

      const data = await response.json();
      setOutputs(data.outputs);
      setGameState("game");
    } catch (error) {
      console.error("Error generating outputs:", error);
      alert("Failed to generate outputs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = (results: GameResults) => {
    setGameResults(results);
    setGameState("results");
  };

  const resetGame = () => {
    setGameState("input");
    setPrompt("");
    setOutputs([]);
    setGameResults(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            The Prompt Time Machine ⚡
          </h1>
          <p className="text-xl text-purple-200">
            Watch AI evolve before your eyes
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {gameState === "input" && (
            <PromptInput onSubmit={handlePromptSubmit} loading={loading} />
          )}

          {gameState === "game" && outputs.length > 0 && (
            <TimelineGame
              prompt={prompt}
              outputs={outputs}
              onComplete={handleGameComplete}
            />
          )}

          {gameState === "results" && gameResults && (
            <ResultsShare results={gameResults} onPlayAgain={resetGame} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
