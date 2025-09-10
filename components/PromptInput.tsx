'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ProgressTracker from './ProgressTracker';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
}

const examplePrompts = [
  "Explain the primary threats to humanity in the next 100 years.",
  "Write a haiku about the future of AI.",
  "Write the feeling of missing the last step on stairs, as if you were a pirate.",
  "Here is a cat's internal monologue while knocking things off tables.",
];

export default function PromptInput({ onSubmit, loading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  const applyExample = (example: string) => {
    setPrompt(example);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-2xl mx-auto"
    >
      <ProgressTracker currentStep={1} />
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Write Your Prompt</h2>
        <p className="text-purple-200 mb-6">
          We&apos;ll send this to <strong>four different AI models</strong>. In the next step, you&apos;ll have to guess which model wrote each response.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your creative prompt..."
            className="w-full h-32 px-4 py-3 bg-white/20 text-white placeholder-purple-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={loading}
          />

          <div className="space-y-2">
            <p className="text-sm text-purple-200">Need inspiration? Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyExample(example)}
                  className="cursor-pointer px-3 py-1 text-xs bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors truncate"
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating responses...
              </span>
            ) : (
              'Generate AI Responses →'
            )}
          </button>

          <p className="text-xs text-purple-200 text-center opacity-60">
            (This can take up to 10 seconds.)
          </p>
        </form>
      </div>
    </motion.div>
  );
}