'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { GameResults } from '@/types';

interface ResultsShareProps {
  results: GameResults;
  onPlayAgain: () => void;
}

export default function ResultsShare({ results, onPlayAgain }: ResultsShareProps) {
  const correctCount = results.userOrder.filter(
    (year, index) => year === results.correctOrder[index]
  ).length;
  const accuracy = (correctCount / results.correctOrder.length) * 100;

  useEffect(() => {
    if (accuracy > 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [accuracy]);

  const shareText = `🤖 I just played Prompt Time Machine!\n\n` +
    `Prompt: "${results.prompt.substring(0, 50)}..."\n` +
    `Score: ${results.score} points\n` +
    `Accuracy: ${accuracy.toFixed(0)}%\n\n` +
    `Can you guess how AI evolved from 2019 to 2024?\n` +
    `Try it: ${process.env.NEXT_PUBLIC_APP_URL}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Prompt Time Machine',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
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
            <p className="text-3xl font-bold text-white">{accuracy.toFixed(0)}%</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">The Actual Timeline:</h3>
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
            In just 5 years, AI went from barely coherent to human-level creative writing. 
            This exponential growth is accelerating. The next 2 years will bring changes 
            that seem impossible today.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Share Results 📤
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 transition-all"
          >
            Play Again
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-900/50 rounded-lg text-center">
          <p className="text-blue-200 mb-2">Ready to learn more?</p>
          <a
            href="#"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
          >
            Continue to Module 2: The Acceleration →
          </a>
        </div>
      </div>
    </motion.div>
  );
}