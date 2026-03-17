import React from 'react';
import { motion } from 'motion/react';
import { Play, Settings } from 'lucide-react';

interface MenuProps {
  highScore: number;
  onStart: () => void;
  onCustomize: () => void;
}

export const Menu: React.FC<MenuProps> = ({ highScore, onStart, onCustomize }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.h1
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-6xl font-black italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40"
      >
        SKY VANGUARD
      </motion.h1>
      <p className="text-emerald-400 font-mono text-sm tracking-[0.3em] mb-12">ACE STRIKE PROTOCOL</p>
      
      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={onStart}
          className="w-full py-4 bg-white text-black font-bold text-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 group"
        >
          <Play fill="currentColor" size={20} />
          START MISSION
        </button>
        <button
          onClick={onCustomize}
          className="w-full py-4 border border-white/20 font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <Settings size={20} />
          CUSTOMIZE SHIP
        </button>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-white/10 bg-white/5 rounded-lg">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">High Score</div>
            <div className="text-xl font-mono font-bold">{highScore.toLocaleString()}</div>
          </div>
          <div className="p-4 border border-white/10 bg-white/5 rounded-lg">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Status</div>
            <div className="text-xl font-mono font-bold text-emerald-400">READY</div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-white/30 text-[10px] font-mono uppercase tracking-widest space-y-1">
        <p>WASD / ARROWS to MOVE</p>
        <p>SPACE / Z to FIRE</p>
        <p>X to MISSILE</p>
      </div>
    </motion.div>
  );
};
