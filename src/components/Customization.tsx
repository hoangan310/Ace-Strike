import React from 'react';
import { motion } from 'motion/react';
import { ShipPreview } from './ShipPreview';
import { SHIP_COLORS, SHIP_SHAPES } from '../constants';
import { ShipShape, SkillType } from '../types';

interface CustomizationProps {
  playerShape: ShipShape;
  playerColor: string;
  autoAttack: boolean;
  skill: SkillType;
  setPlayerShape: (shape: ShipShape) => void;
  setPlayerColor: (color: string) => void;
  setAutoAttack: (auto: boolean) => void;
  setSkill: (skill: SkillType) => void;
  onBack: () => void;
}

export const Customization: React.FC<CustomizationProps> = ({
  playerShape,
  playerColor,
  autoAttack,
  skill,
  setPlayerShape,
  setPlayerColor,
  setAutoAttack,
  setSkill,
  onBack
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 bg-black/95 flex flex-col items-center justify-center p-8 overflow-y-auto"
    >
      <h2 className="text-4xl font-black italic mb-6 tracking-tighter text-emerald-400">CUSTOMIZE SHIP</h2>
      
      <div className="mb-8">
        <ShipPreview shape={playerShape} color={playerColor} />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 block">Ship Configuration</label>
          <div className="grid grid-cols-2 gap-2">
            {SHIP_SHAPES.map(shape => (
              <button
                key={shape}
                onClick={() => setPlayerShape(shape)}
                className={`py-3 text-xs font-bold border transition-all ${playerShape === shape ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' : 'border-white/10 hover:border-white/30'}`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 block">Hull Color</label>
          <div className="grid grid-cols-3 gap-2">
            {SHIP_COLORS.map(color => (
              <button
                key={color.name}
                onClick={() => setPlayerColor(color.value)}
                className={`flex items-center gap-2 p-2 border transition-all ${playerColor === color.value ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/10 hover:border-white/30'}`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.value }} />
                <span className="text-[10px] uppercase">{color.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Custom Hex:</span>
            <input 
              type="color" 
              value={playerColor} 
              onChange={(e) => setPlayerColor(e.target.value)}
              className="bg-transparent border-none w-8 h-8 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-white/10 bg-white/5 rounded-lg">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest">Auto-Attack</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Fire without holding key</span>
          </div>
          <button 
            onClick={() => setAutoAttack(!autoAttack)}
            className={`px-4 py-2 text-xs font-bold rounded transition-all ${autoAttack ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {autoAttack ? 'ON' : 'OFF'}
          </button>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 block">Active Skill (Key C)</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.values(SkillType)).map(s => (
              <button
                key={s}
                onClick={() => setSkill(s)}
                className={`py-2 text-[10px] font-bold border transition-all ${skill === s ? 'border-purple-400 bg-purple-400/10 text-purple-400' : 'border-white/10 hover:border-white/30'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-8 w-full max-w-xs py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors"
      >
        Confirm & Return
      </button>
    </motion.div>
  );
};
