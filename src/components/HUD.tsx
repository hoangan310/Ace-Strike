import React from 'react';
import { Trophy, Heart, Target, Zap, Cpu } from 'lucide-react';
import { WeaponType, SkillType } from '../types';

interface HUDProps {
  score: number;
  highScore: number;
  stage: number;
  lives: number;
  missiles: number;
  weaponType: WeaponType;
  weaponLevel: number;
  bossActive: boolean;
  bossHp?: number;
  bossMaxHp?: number;
  skill: SkillType;
  skillCooldown: number;
  skillMaxCooldown: number;
  skillActiveTimer: number;
  combo: number;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  stage,
  lives,
  missiles,
  weaponType,
  weaponLevel,
  bossActive,
  bossHp,
  bossMaxHp,
  skill,
  skillCooldown,
  skillMaxCooldown,
  skillActiveTimer,
  combo
}) => {
  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xl font-bold">
          <Trophy size={18} />
          {score.toLocaleString()}
        </div>
        <div className="text-white/40 text-xs font-mono uppercase tracking-widest">
          HI: {highScore.toLocaleString()}
        </div>
        <div className="text-cyan-400 font-mono text-sm font-bold mt-2">
          STAGE {stage}
        </div>
        {combo > 1 && (
          <div className="text-yellow-400 font-mono text-lg font-black italic mt-1 animate-bounce">
            {combo} COMBO
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Heart
              key={i}
              size={16}
              fill={i < lives ? '#ff4466' : 'transparent'}
              color={i < lives ? '#ff4466' : 'rgba(255,255,255,0.1)'}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <Target size={14} className="text-orange-400" />
          <span className="text-sm font-mono font-bold">{missiles}</span>
          <div className="w-px h-3 bg-white/20 mx-1" />
          <Zap size={14} className="text-cyan-400" />
          <span className="text-sm font-mono font-bold">{weaponType} LV.{weaponLevel}</span>
        </div>

        {/* Skill Bar */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10 mt-2">
          <Cpu size={14} className={skillCooldown > 0 ? 'text-white/20' : 'text-purple-400'} />
          <div className="flex flex-col">
            <div className="flex justify-between items-center gap-4">
              <span className={`text-[10px] font-mono font-bold ${skillCooldown > 0 ? 'text-white/20' : 'text-purple-400'}`}>
                {skill} {skillCooldown > 0 ? 'RECHARGING' : 'READY'}
              </span>
              {skillActiveTimer > 0 && (
                <span className="text-[10px] font-mono font-bold text-yellow-400 animate-pulse">ACTIVE</span>
              )}
            </div>
            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full transition-all duration-100 ${skillActiveTimer > 0 ? 'bg-yellow-400' : 'bg-purple-500'}`}
                style={{ width: `${skillActiveTimer > 0 ? (skillActiveTimer / 8000) * 100 : (1 - skillCooldown / skillMaxCooldown) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {bossActive && bossHp !== undefined && bossMaxHp !== undefined && (
          <div className="w-48 bg-black/60 p-1 rounded border border-red-500/50 mt-2">
            <div className="text-[8px] text-red-500 uppercase tracking-tighter mb-1 text-center font-bold">BOSS DETECTED</div>
            <div className="h-1 bg-red-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
