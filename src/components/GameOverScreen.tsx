import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { Difficulty } from '../types';

interface GameOverScreenProps {
  score: number;
  difficulty: Difficulty;
  onRetry: () => void;
  onMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  difficulty,
  onRetry,
  onMenu
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="mb-8"
      >
        <h2 className="text-6xl font-black italic text-white mb-2">MISSION FAILED</h2>
        <p className="text-red-400 font-mono tracking-[0.2em]">PILOT DOWN</p>
      </motion.div>

      <div className="bg-black/40 p-6 rounded-xl border border-white/10 w-full max-w-xs mb-8">
        <div className="text-sm text-white/40 uppercase tracking-widest mb-1">Final Score</div>
        <div className="text-4xl font-mono font-bold text-emerald-400 mb-4">
          {score.toLocaleString()}
        </div>
        <div className="h-px bg-white/10 mb-4" />
        <div className="flex justify-between text-xs font-mono">
          <span className="text-white/40">Difficulty</span>
          <span>{difficulty}</span>
        </div>
      </div>

      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={onRetry}
          className="w-full py-4 bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
        >
          <RotateCcw size={20} />
          RETRY MISSION
        </button>
        <button
          onClick={onMenu}
          className="w-full py-4 border border-white/20 hover:bg-white/10 transition-colors"
        >
          MAIN MENU
        </button>
      </div>
    </motion.div>
  );
};
