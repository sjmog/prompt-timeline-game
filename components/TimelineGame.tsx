'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ModelOutput, GameResults } from '@/types';

// Individual sortable item component
interface SortableItemProps {
  id: string;
  output: ModelOutput;
  index: number;
}

function SortableItem({ id, output, index }: SortableItemProps) {
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
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative ${isDragging ? 'z-50' : 'z-10'}`}
    >
      <div
        {...attributes}
        {...listeners}
        className={`p-4 bg-white/20 backdrop-blur-sm rounded-lg cursor-move transition-all hover:bg-white/25 ${
          isDragging ? 'shadow-2xl scale-105' : 'shadow-lg hover:shadow-xl'
        }`}
      >
        <div className="flex items-start space-x-4">
          {/* Drag handle indicator */}
          <div className="flex flex-col gap-1 pt-1">
            <div className="w-1 h-1 bg-purple-400 rounded-full" />
            <div className="w-1 h-1 bg-purple-400 rounded-full" />
            <div className="w-1 h-1 bg-purple-400 rounded-full" />
          </div>
          
          {/* Year indicator (hidden, will be revealed in results) */}
          <div className="text-2xl opacity-50">🤖</div>
          
          {/* Output text */}
          <div className="flex-1">
            <p className="text-white text-sm leading-relaxed">
              {output.output}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Overlay component for the item being dragged
function DragOverlayItem({ output }: { output: ModelOutput }) {
  return (
    <div className="p-4 bg-purple-600/30 backdrop-blur-sm rounded-lg shadow-2xl scale-105 rotate-2">
      <div className="flex items-start space-x-4">
        <div className="text-2xl">🤖</div>
        <div className="flex-1">
          <p className="text-white text-sm leading-relaxed">
            {output.output}
          </p>
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

export default function TimelineGame({ prompt, outputs, onComplete }: TimelineGameProps) {
  const [shuffledOutputs, setShuffledOutputs] = useState<ModelOutput[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [dragCount, setDragCount] = useState(0);

  // Configure sensors for both pointer and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Shuffle outputs on mount with a more random algorithm
    const shuffled = [...outputs]
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    setShuffledOutputs(shuffled);
  }, [outputs]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      setShuffledOutputs((items) => {
        const oldIndex = items.findIndex((item) => 
          `${item.year}-${item.model}` === active.id
        );
        const newIndex = items.findIndex((item) => 
          `${item.year}-${item.model}` === over.id
        );
        
        // Track drag count for engagement metrics
        setDragCount(prev => prev + 1);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const calculateScore = () => {
    const correctOrder = [...outputs].sort((a, b) => a.year - b.year);
    let score = 0;
    let perfectBonus = true;
    
    shuffledOutputs.forEach((output, index) => {
      const correctIndex = correctOrder.findIndex(o => o.year === output.year);
      if (correctIndex === index) {
        score += 100; // Perfect placement
      } else if (Math.abs(correctIndex - index) === 1) {
        score += 50; // One position off
        perfectBonus = false;
      } else {
        score += Math.max(0, 25 - Math.abs(correctIndex - index) * 5); // Partial credit
        perfectBonus = false;
      }
    });

    // Add bonuses
    if (perfectBonus) score += 100; // Perfect arrangement bonus
    if (dragCount <= outputs.length) score += 50; // Efficiency bonus
    
    return score;
  };

  const handleSubmit = () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);

    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const score = calculateScore();
    const correctOrder = outputs.map(o => o.year).sort();
    const userOrder = shuffledOutputs.map(o => o.year);

    onComplete({
      score,
      correctOrder,
      userOrder,
      timeElapsed,
      prompt,
      outputs: shuffledOutputs,
    });
  };

  const itemIds = shuffledOutputs.map(output => `${output.year}-${output.model}`);
  const activeItem = activeId 
    ? shuffledOutputs.find(output => `${output.year}-${output.model}` === activeId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">
              Step 2: Arrange the Timeline
            </h2>
            <div className="text-sm text-purple-300">
              Moves: {dragCount}
            </div>
          </div>
          <p className="text-purple-200 mb-3">
            Drag and drop these AI outputs from <span className="font-semibold">oldest (top)</span> to <span className="font-semibold">newest (bottom)</span>
          </p>
          
          {/* Prompt reminder */}
          <div className="p-3 bg-purple-900/50 rounded-lg border border-purple-500/30">
            <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Your prompt:</p>
            <p className="text-white font-medium italic">"{prompt}"</p>
          </div>

          {/* Instructions */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-purple-800/50 text-purple-200 rounded-full">
              💡 Look for coherence and quality
            </span>
            <span className="px-2 py-1 bg-purple-800/50 text-purple-200 rounded-full">
              ⌨️ Tab + Space + Arrows to reorder
            </span>
            <span className="px-2 py-1 bg-purple-800/50 text-purple-200 rounded-full">
              📱 Touch & drag on mobile
            </span>
          </div>
        </div>

        {/* Timeline labels */}
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded" />
            <span className="text-xs text-orange-400 font-semibold">2019 (Oldest)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-400 font-semibold">2024 (Newest)</span>
            <div className="w-8 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded" />
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
              {shuffledOutputs.map((output, index) => (
                <SortableItem
                  key={`${output.year}-${output.model}`}
                  id={`${output.year}-${output.model}`}
                  output={output}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
          
          {/* Drag overlay for smooth dragging */}
          <DragOverlay>
            {activeItem ? <DragOverlayItem output={activeItem} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Submit button */}
        <motion.button
          onClick={handleSubmit}
          disabled={hasSubmitted}
          whileHover={{ scale: hasSubmitted ? 1 : 1.02 }}
          whileTap={{ scale: hasSubmitted ? 1 : 0.98 }}
          className="mt-8 w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {hasSubmitted ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Calculating your score...
            </span>
          ) : (
            <>Submit Timeline & See Results →</>
          )}
        </motion.button>

        {/* Progress indicator */}
        <div className="mt-4 flex justify-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full" />
          <div className="w-2 h-2 bg-purple-600 rounded-full" />
          <div className="w-2 h-2 bg-purple-400/30 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}