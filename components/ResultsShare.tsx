"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import type { GameResults } from "@/types";

interface ResultsShareProps {
  results: GameResults;
  onPlayAgain: () => void;
}

export default function ResultsShare({
  results,
  onPlayAgain,
}: ResultsShareProps) {
  const correctCount = results.userOrder.filter(
    (year, index) => year === results.correctOrder[index]
  ).length;
  const accuracy = (correctCount / results.correctOrder.length) * 100;

  useEffect(() => {
    if (accuracy > 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [accuracy]);

  const shareUrl =
    process.env.NEXT_PUBLIC_TWEET_URL || process.env.NEXT_PUBLIC_APP_URL;
  const shareText =
    `AI is progressing scary fast.\n\n` +
    `Try your own prompt and compare GPT-2 to GPT-5:\n\n` +
    `(I got ${results.score} points)`;

  const handleShare = async () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl || "")}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          🎉 Results
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-purple-900/50 rounded-lg p-4">
            <p className="text-purple-200 text-sm mb-1">Score</p>
            <p className="text-3xl font-bold text-white">{results.score} pts</p>
          </div>
          <div className="bg-purple-900/50 rounded-lg p-4">
            <p className="text-purple-200 text-sm mb-1">Accuracy</p>
            <p className="text-3xl font-bold text-white">
              {accuracy.toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            The Actual Timeline:
          </h3>
          <div className="space-y-3">
            {results.outputs
              .sort((a, b) => a.year - b.year)
              .map((output, index) => (
                <motion.div
                  key={output.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white/10 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-purple-300">
                      {output.year} - {output.model}
                    </span>
                    {results.userOrder[index] === output.year && (
                      <span className="text-green-400">✓ Correct!</span>
                    )}
                  </div>
                  <p className="text-white text-sm">{output.output}</p>
                </motion.div>
              ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-2">
            💡 What This Means
          </h3>
          <p className="text-purple-100">
            In just 7 years, AI went from barely coherent to human-level
            creative writing. This exponential growth is accelerating. The next
            2 years will bring changes that seem impossible today.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            aria-label="Share results on X"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 fill-current"
              >
                <path d="M18.244 2.25h3.308l-7.224 8.26 8.484 11.24H17.5l-5.566-7.28-6.37 7.28H2.252l7.72-8.82-8.2-10.958h7.5l5.026 6.67 6.946-6.392zm-1.167 19.5h1.834L7.01 4.5H5.05l12.027 17.25z" />
              </svg>
              <span>Share on X</span>
            </span>
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 transition-all"
          >
            Play Again
          </button>
        </div>
      </div>
    </motion.div>
  );
}
