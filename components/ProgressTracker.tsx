"use client";

import { motion } from "framer-motion";
import React from "react";

interface ProgressTrackerProps {
  currentStep: number; // 1-based index
  steps?: string[]; // Defaults to 3 predefined steps
  className?: string;
}

export default function ProgressTracker({
  currentStep,
  steps = ["Write Your Prompt", "Order The Responses", "Get Your Score"],
  className,
}: ProgressTrackerProps) {
  const clampedStep = Math.max(1, Math.min(steps.length, currentStep));

  return (
    <div className={"mb-6 " + (className || "")}> 
      <ol className="relative flex items-center justify-between gap-4">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === clampedStep;
          const isCompleted = stepNumber < clampedStep;

          return (
            <li key={label} className="z-10 flex-1">
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold " +
                    (isCompleted
                      ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                      : isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white ring-4 ring-white/10"
                      : "bg-white/10 text-white/70")
                  }
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.4z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <div className="mt-2 text-xs uppercase tracking-wide text-purple-300/80">
                  Step {stepNumber}
                </div>
                <div className="hidden sm:block mt-1 text-sm font-semibold text-white/90">
                  {label}
                </div>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}


