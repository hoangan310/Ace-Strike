import { Difficulty, DifficultyConfig, ShipShape, WeaponType } from './types';

export const SHIP_COLORS = [
  { name: 'Cyan', value: '#00ccff' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'White', value: '#ffffff' },
];

export const SHIP_SHAPES: ShipShape[] = ['VANGUARD', 'PHANTOM', 'TITAN', 'STRIKER'];

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultyConfig> = {
  EASY: { enemySpawnRate: 0.01, enemySpeedMin: 1, enemySpeedMax: 2, scoreMultiplier: 1 },
  NORMAL: { enemySpawnRate: 0.02, enemySpeedMin: 1.5, enemySpeedMax: 3, scoreMultiplier: 2 },
  HARD: { enemySpawnRate: 0.04, enemySpeedMin: 2, enemySpeedMax: 5, scoreMultiplier: 5 },
  INSANE: { enemySpawnRate: 0.07, enemySpeedMin: 3, enemySpeedMax: 8, scoreMultiplier: 10 },
};

export const POWER_UP_TYPES: { type: string; color: string; weaponType?: WeaponType }[] = [
  { type: 'HEALTH', color: '#ff0000' },
  { type: 'WEAPON', color: '#ffff00', weaponType: WeaponType.SPREAD },
  { type: 'WEAPON', color: '#00ffff', weaponType: WeaponType.LASER },
  { type: 'MISSILE', color: '#ffaa00' },
  { type: 'SHIELD', color: '#ffffff' },
  { type: 'DRONE', color: '#ff00ff' },
];
