import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Difficulty } from '../types';
import { DIFFICULTY_SETTINGS } from '../constants';

interface DifficultySelectionProps {
  onSelect: (diff: Difficulty) => void;
  onBack: () => void;
}

export const DifficultySelection: React.FC<DifficultySelectionProps> = ({ onSelect, onBack }) => {
  const difficulties: Difficulty[] = ['EASY', 'NORMAL', 'HARD', 'INSANE'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8"
    >
      <h2 className="text-2xl font-bold mb-8 tracking-widest">SELECT DIFFICULTY</h2>
      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        {difficulties.map((diff) => (
          <button
            key={diff}
            onClick={() => onSelect(diff)}
            className="group relative p-4 border border-white/10 hover:border-emerald-400 transition-all text-left overflow-hidden"
          >
            <div className="relative z-10">
              <div className="text-xs text-white/40 font-mono mb-1">
                Level {DIFFICULTY_SETTINGS[diff].scoreMultiplier}x
              </div>
              <div className="text-xl font-black italic group-hover:text-emerald-400 transition-colors">
                {diff}
              </div>
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="text-emerald-400" />
            </div>
          </button>
        ))}
        <button
          onClick={onBack}
          className="mt-4 text-white/40 hover:text-white text-sm font-mono uppercase tracking-widest"
        >
          Back to Menu
        </button>
      </div>
    </motion.div>
  );
};
