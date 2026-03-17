import { EnemyType, WeaponType, DifficultyConfig } from './types';
import { POWER_UP_TYPES } from './constants';

export class Bullet {
  damage: number;
  active: boolean = true;

  constructor(
    public x: number, 
    public y: number, 
    public vx: number, 
    public vy: number, 
    public isPlayer: boolean, 
    public type: WeaponType = WeaponType.NORMAL
  ) {
    this.damage = type === WeaponType.LASER ? 0.5 : type === WeaponType.MISSILE ? 10 : type === WeaponType.PLASMA ? 3 : 1;
  }

  reset(x: number, y: number, vx: number, vy: number, isPlayer: boolean, type: WeaponType = WeaponType.NORMAL) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isPlayer = isPlayer;
    this.type = type;
    this.active = true;
    this.damage = type === WeaponType.LASER ? 0.5 : type === WeaponType.MISSILE ? 10 : type === WeaponType.PLASMA ? 3 : 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.type === WeaponType.WAVE) {
      this.x += Math.sin(Date.now() * 0.01) * 5;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const color = this.type === WeaponType.LASER ? '#00ffff' : 
                  this.type === WeaponType.MISSILE ? '#ff4400' :
                  this.type === WeaponType.PLASMA ? '#a855f7' :
                  this.type === WeaponType.WAVE ? '#10b981' : '#ffff00';
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    
    if (this.type === WeaponType.LASER) {
      ctx.fillRect(this.x - 1, this.y, 2, 20);
    } else if (this.type === WeaponType.MISSILE) {
      ctx.fillRect(this.x - 3, this.y, 6, 15);
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.x - 1, this.y + 5, 2, 5);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.isPlayer ? 4 : 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class Enemy {
  x: number;
  y: number;
  width = 40;
  height = 40;
  hp: number;
  maxHp: number;
  lastShot = 0;
  bossType = 0;
  speed: number;
  type: EnemyType;

  constructor(canvasWidth: number, config: DifficultyConfig, isBoss: boolean = false) {
    this.type = isBoss ? 'BOSS' : Math.random() < 0.2 ? 'HEAVY' : Math.random() < 0.4 ? 'FIGHTER' : 'SCOUT';
    this.x = Math.random() * (canvasWidth - 60) + 30;
    this.y = -100;
    this.speed = Math.random() * (config.enemySpeedMax - config.enemySpeedMin) + config.enemySpeedMin;
    
    if (this.type === 'BOSS') {
      this.width = 160;
      this.height = 100;
      this.maxHp = 200;
      this.bossType = Math.floor(Math.random() * 4);
      this.x = canvasWidth / 2 - this.width / 2;
    } else {
      this.maxHp = this.type === 'HEAVY' ? 8 : this.type === 'FIGHTER' ? 3 : 1;
      if (this.type === 'HEAVY') { this.width = 60; this.height = 50; }
    }
    this.hp = this.maxHp;
  }

  update(canvasWidth: number) {
    if (this.type === 'BOSS') {
      if (this.y < 100) {
        this.y += this.speed * 0.5;
      } else {
        this.x += Math.sin(Date.now() * 0.001) * 2;
      }
    } else {
      this.y += this.speed;
      if (this.type === 'FIGHTER') {
        this.x += Math.sin(this.y * 0.05) * 2;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    if (this.type === 'BOSS') {
      this.drawBoss(ctx);
    } else {
      this.drawMinion(ctx);
    }

    // HP Bar
    if (this.hp < this.maxHp) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(-this.width / 2, -this.height / 2 - 12, this.width, 6);
      const hpColor = this.hp / this.maxHp > 0.5 ? '#10b981' : this.hp / this.maxHp > 0.2 ? '#f59e0b' : '#ef4444';
      ctx.fillStyle = hpColor;
      ctx.fillRect(-this.width / 2, -this.height / 2 - 12, (this.hp / this.maxHp) * this.width, 6);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.strokeRect(-this.width / 2, -this.height / 2 - 12, this.width, 6);
    }

    ctx.restore();
  }

  private drawMinion(ctx: CanvasRenderingContext2D) {
    const t = Date.now() * 0.005;
    const color = this.type === 'HEAVY' ? '#f59e0b' : this.type === 'FIGHTER' ? '#ef4444' : '#ec4899';
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color;

    ctx.beginPath();
    if (this.type === 'HEAVY') {
      // Hexagonal heavy ship
      ctx.moveTo(0, this.height / 2);
      ctx.lineTo(-this.width / 2, this.height / 4);
      ctx.lineTo(-this.width / 2, -this.height / 2);
      ctx.lineTo(this.width / 2, -this.height / 2);
      ctx.lineTo(this.width / 2, this.height / 4);
    } else if (this.type === 'FIGHTER') {
      // Sharp fighter
      ctx.moveTo(0, this.height / 2 + 5);
      ctx.lineTo(-this.width / 2, -this.height / 2);
      ctx.lineTo(0, -this.height / 4);
      ctx.lineTo(this.width / 2, -this.height / 2);
    } else {
      // Scout
      ctx.moveTo(0, this.height / 2);
      ctx.lineTo(-this.width / 2, -this.height / 2);
      ctx.lineTo(this.width / 2, -this.height / 2);
    }
    ctx.closePath();
    ctx.fill();

    // Engine glow
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.5 + Math.sin(t * 2) * 0.3;
    ctx.beginPath();
    ctx.arc(0, -this.height / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  private drawBoss(ctx: CanvasRenderingContext2D) {
    const t = Date.now() * 0.002;
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ef4444';

    if (this.bossType === 0) {
      // VOID REAPER
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.moveTo(0, 60);
      ctx.lineTo(-80, -40);
      ctx.lineTo(-40, -20);
      ctx.lineTo(0, -60);
      ctx.lineTo(40, -20);
      ctx.lineTo(80, -40);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing Core
      ctx.fillStyle = '#ef4444';
      ctx.shadowBlur = 20 + Math.sin(t * 5) * 10;
      ctx.beginPath();
      ctx.arc(0, 0, 15 + Math.sin(t * 3) * 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.bossType === 1) {
      // STAR CRUSHER
      ctx.fillStyle = '#2d2d2d';
      ctx.fillRect(-70, -30, 140, 60);
      ctx.fillRect(-30, 30, 60, 20);
      
      // Side pods
      ctx.fillStyle = '#444';
      ctx.fillRect(-90, -10, 20, 40);
      ctx.fillRect(70, -10, 20, 40);

      // Energy vents
      ctx.fillStyle = '#3b82f6';
      ctx.shadowColor = '#3b82f6';
      const ventH = 10 + Math.sin(t * 10) * 5;
      ctx.fillRect(-85, 30, 10, ventH);
      ctx.fillRect(75, 30, 10, ventH);
    } else if (this.bossType === 2) {
      // OMEGA SENTINEL
      ctx.fillStyle = '#111';
      for(let i=0; i<8; i++) {
        ctx.save();
        ctx.rotate(t + (i * Math.PI / 4));
        ctx.fillRect(40, -15, 40, 30);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(70, -5, 15, 10);
        ctx.restore();
      }
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();
    } else {
      // NEBULA PHANTOM
      ctx.save();
      ctx.rotate(Math.sin(t) * 0.2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      for(let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.arc(Math.cos(t + i) * 20, Math.sin(t * 1.5 + i) * 20, 40 + i * 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.lineTo(-30, 20);
      ctx.lineTo(0, 0);
      ctx.lineTo(30, 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}

export class Particle {
  life = 1.0;
  vx: number;
  vy: number;
  size: number;
  active: boolean = true;

  constructor(public x: number, public y: number, public color: string) {
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.size = Math.random() * 4 + 2;
  }

  reset(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.size = Math.random() * 4 + 2;
    this.life = 1.0;
    this.active = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.02;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

export class PowerUp {
  width = 24;
  height = 24;
  type: any;
  
  constructor(public x: number, public y: number, type?: any) {
    this.type = type || POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
  }

  update() {
    this.y += 2;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.type.color;
    ctx.fillStyle = this.type.color;
    
    // Diamond shape
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }
}

export class Drone {
  angle = 0;
  x = 0;
  y = 0;
  lastShot = 0;

  constructor(public offsetX: number, public offsetY: number) {}

  update(px: number, py: number) {
    this.angle += 0.05;
    this.x = px + Math.cos(this.angle) * 60;
    this.y = py + Math.sin(this.angle) * 60;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Core
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;

  constructor(canvasWidth: number, canvasHeight: number, layer: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * (layer + 1) * 0.8 + 0.5;
    this.speed = (layer + 1) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  update(canvasHeight: number) {
    this.y += this.speed;
    if (this.y > canvasHeight) {
      this.y = -10;
      this.x = Math.random() * 800; // Assuming max width or dynamic
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
