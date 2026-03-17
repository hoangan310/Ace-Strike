export type GameState = 'MENU' | 'DIFFICULTY' | 'CUSTOMIZE' | 'PLAYING' | 'GAMEOVER' | 'PAUSED';
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'INSANE';
export type ShipShape = 'VANGUARD' | 'PHANTOM' | 'TITAN' | 'STRIKER';

export enum WeaponType {
  NORMAL = 'NORMAL',
  SPREAD = 'SPREAD',
  LASER = 'LASER',
  MISSILE = 'MISSILE',
  PLASMA = 'PLASMA',
  WAVE = 'WAVE',
  HOMING = 'HOMING'
}

export interface DifficultyConfig {
  enemySpawnRate: number;
  enemySpeedMin: number;
  enemySpeedMax: number;
  scoreMultiplier: number;
}

export interface PowerUpType {
  type: 'HEALTH' | 'WEAPON' | 'MISSILE' | 'SHIELD' | 'DRONE';
  weaponType?: WeaponType;
}

export type EnemyType = 'SCOUT' | 'FIGHTER' | 'HEAVY' | 'BOSS';

export enum SkillType {
  EMP = 'EMP',
  TIME_WARP = 'TIME_WARP',
  OVERDRIVE = 'OVERDRIVE'
}
