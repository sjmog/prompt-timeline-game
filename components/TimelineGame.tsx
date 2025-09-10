"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import ProgressTracker from "./ProgressTracker";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ModelOutput, GameResults } from "@/types";

// Individual sortable item component
interface SortableItemProps {
  id: string;
  output: ModelOutput;
}

function SortableItem({ id, output }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "z-50" : "z-10"}`}
    >
      <div
        {...attributes}
        {...listeners}
        className={`p-4 bg-white/20 backdrop-blur-sm rounded-lg cursor-move transition-all hover:bg-white/25 ${
          isDragging ? "shadow-2xl scale-105" : "shadow-lg hover:shadow-xl"
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className="flex flex-col gap-1 pt-1">
            <div className="w-1 h-1 bg-purple-400 rounded-full" />
            <div className="w-1 h-1 bg-purple-400 rounded-full" />
            <div className="w-1 h-1 bg-purple-400 rounded-full" />
          </div>

          <div className="text-2xl opacity-50">🤖</div>

          <div className="flex-1">
            <p className="text-white text-sm leading-relaxed">
              {output.output}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DragOverlayItem({ output }: { output: ModelOutput }) {
  return (
    <div className="p-4 bg-purple-600/30 backdrop-blur-sm rounded-lg shadow-2xl scale-105 rotate-2">
      <div className="flex items-start space-x-4">
        <div className="text-2xl">🤖</div>
        <div className="flex-1">
          <p className="text-white text-sm leading-relaxed">{output.output}</p>
        </div>
      </div>
    </div>
  );
}

interface TimelineGameProps {
  prompt: string;
  outputs: ModelOutput[];
  onComplete: (results: GameResults) => void;
}

export default function TimelineGame({
  prompt,
  outputs,
  onComplete,
}: TimelineGameProps) {
  const [shuffledOutputs, setShuffledOutputs] = useState<ModelOutput[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const shuffled = [...outputs]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    setShuffledOutputs(shuffled);
  }, [outputs]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setShuffledOutputs((items) => {
        const oldIndex = items.findIndex(
          (item) => `${item.year}-${item.model}` === active.id
        );
        const newIndex = items.findIndex(
          (item) => `${item.year}-${item.model}` === over.id
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const calculateScore = () => {
    const correctOrder = [...outputs].sort((a, b) => a.year - b.year);
    let score = 0;
    let perfectBonus = true;

    shuffledOutputs.forEach((output, index) => {
      const correctIndex = correctOrder.findIndex(
        (o) => o.year === output.year
      );
      if (correctIndex === index) {
        score += 100;
      } else {
        perfectBonus = false;
      }
    });

    if (perfectBonus) score += 100;

    return score;
  };

  const handleSubmit = () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);

    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const score = calculateScore();
    const correctOrder = outputs.map((o) => o.year).sort();
    const userOrder = shuffledOutputs.map((o) => o.year);

    onComplete({
      score,
      correctOrder,
      userOrder,
      timeElapsed,
      prompt,
      outputs: shuffledOutputs,
    });
  };

  const itemIds = shuffledOutputs.map(
    (output) => `${output.year}-${output.model}`
  );
  const activeItem = activeId
    ? shuffledOutputs.find(
        (output) => `${output.year}-${output.model}` === activeId
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <ProgressTracker currentStep={2} />
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">Order the Responses</h2>
          </div>
          <p className="text-purple-200 mb-3 leading-relaxed">
            Here are the four responses we got, but they&apos;re all mixed up! Drag and drop to order them from{" "}
            <span className="text-orange-400 font-semibold">oldest model (top)</span> to{" "}
            <span className="text-blue-400 font-semibold">newest model (bottom)</span>.
          </p>

          {/* Prompt reminder */}
          <div className="p-3 bg-purple-900/50 rounded-lg border border-purple-500/30">
            <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">
              Your prompt:
            </p>
            <p className="text-white font-medium italic">&quot;{prompt}&quot;</p>
          </div>
        </div>

        <div className="flex items-center justify-center mb-4 px-4 mt-10">
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded" />
            <span className="text-xs text-orange-400 font-semibold">
              2018 (oldest AI model)
            </span>
          </div>
        </div>

        {/* Sortable list */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {shuffledOutputs.map((output) => (
                <SortableItem
                  key={`${output.year}-${output.model}`}
                  id={`${output.year}-${output.model}`}
                  output={output}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag overlay for smooth dragging (rendered in a portal to avoid transformed ancestors) */}
          {mounted
            ? createPortal(
                <DragOverlay>
                  {activeItem ? <DragOverlayItem output={activeItem} /> : null}
                </DragOverlay>,
                document.body
              )
            : null}
        </DndContext>

        <div className="flex items-center justify-center mt-4 mb-4 px-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded" />
            <span className="text-xs text-green-400 font-semibold">
              2025 (newest AI model)
            </span>
          </div>
        </div>

        {/* Submit button */}
        <motion.button
          onClick={handleSubmit}
          disabled={hasSubmitted}
          whileHover={{ scale: hasSubmitted ? 1 : 1.02 }}
          whileTap={{ scale: hasSubmitted ? 1 : 0.98 }}
          className="mt-8 w-full cursor-pointer py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {hasSubmitted ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Calculating your score...
            </span>
          ) : (
            <>Submit Timeline & See Results →</>
          )}
        </motion.button>

        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2 h-2 bg-purple-700 rounded-full" />
          <div className="w-2 h-2 bg-purple-400 rounded-full" />
          <div className="w-2 h-2 bg-purple-400/30 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
