import React from 'react';
import { motion } from 'motion/react';

interface PausedScreenProps {
  onResume: () => void;
  onQuit: () => void;
}

export const PausedScreen: React.FC<PausedScreenProps> = ({ onResume, onQuit }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <h2 className="text-4xl font-black italic mb-8">PAUSED</h2>
      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={onResume}
          className="w-full py-4 bg-white text-black font-bold hover:bg-emerald-400 transition-colors"
        >
          RESUME
        </button>
        <button
          onClick={onQuit}
          className="w-full py-4 border border-white/20 hover:bg-white/10 transition-colors"
        >
          QUIT MISSION
        </button>
      </div>
    </motion.div>
  );
};
