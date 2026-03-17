import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { GameState, Difficulty, ShipShape, WeaponType, SkillType } from './types';
import { SHIP_COLORS, SHIP_SHAPES, DIFFICULTY_SETTINGS } from './constants';
import { Bullet, Enemy, Particle, PowerUp, Drone, Star } from './classes';
import { HUD } from './components/HUD';
import { Menu } from './components/Menu';
import { Customization } from './components/Customization';
import { DifficultySelection } from './components/DifficultySelection';
import { PausedScreen } from './components/PausedScreen';
import { GameOverScreen } from './components/GameOverScreen';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [weaponType, setWeaponType] = useState<WeaponType>(WeaponType.NORMAL);
  const [missiles, setMissiles] = useState(3);
  const [shieldActive, setShieldActive] = useState(0); 
  const [stage, setStage] = useState(1);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [bossActive, setBossActive] = useState(false);
  const [playerColor, setPlayerColor] = useState('#00ccff');
  const [playerShape, setPlayerShape] = useState<ShipShape>('VANGUARD');
  const [autoAttack, setAutoAttack] = useState(true);
  const [skill, setSkill] = useState<SkillType>(SkillType.EMP);
  const [skillCooldown, setSkillCooldown] = useState(0);
  const [skillActiveTimer, setSkillActiveTimer] = useState(0);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(0);
  const skillMaxCooldown = 15000; // 15 seconds

  // Game loop refs
  const requestRef = useRef<number>(null);
  const playerRef = useRef({ x: 0, y: 0, width: 50, height: 40 });
  const bulletsRef = useRef<Bullet[]>([]);
  const bulletPoolRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const particlePoolRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const dronesRef = useRef<Drone[]>([]);
  const starsRef = useRef<Star[]>([]);
  const offscreenPlayerRef = useRef<HTMLCanvasElement | null>(null);
  const bulletCanvasesRef = useRef<Record<string, HTMLCanvasElement>>({});
  const enemyCanvasesRef = useRef<Record<string, HTMLCanvasElement>>({});
  const keysRef = useRef<Record<string, boolean>>({});
  const lastShotTime = useRef(0);

  const boss = enemiesRef.current.find(e => e.type === 'BOSS');

  useEffect(() => {
    const saved = localStorage.getItem('sky-vanguard-highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('sky-vanguard-highscore', score.toString());
    }
  }, [score, highScore]);

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setGameState('PLAYING');
    setScore(0);
    setLives(3);
    setWeaponLevel(1);
    setWeaponType(WeaponType.NORMAL);
    setMissiles(3);
    setShieldActive(0);
    setSkillCooldown(0);
    setSkillActiveTimer(0);
    setStage(1);
    setEnemiesKilled(0);
    setBossActive(false);
    setCombo(0);
    setShake(0);
    
    bulletsRef.current = [];
    bulletPoolRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    particlePoolRef.current = [];
    powerUpsRef.current = [];
    dronesRef.current = [];
    
    if (canvasRef.current) {
      playerRef.current = {
        x: canvasRef.current.width / 2 - 25,
        y: canvasRef.current.height - 100,
        width: 50,
        height: 40
      };

      // Initialize stars
      starsRef.current = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 30; j++) {
          starsRef.current.push(new Star(canvasRef.current.width, canvasRef.current.height, i));
        }
      }

      // Pre-render player ship
      renderPlayerOffscreen();
      renderBulletsOffscreen();
      renderEnemiesOffscreen();
    }
  }, [playerShape, playerColor]);

  const renderEnemiesOffscreen = () => {
    const types = ['SCOUT', 'FIGHTER', 'HEAVY'];
    const colors: Record<string, string> = {
      'SCOUT': '#ec4899',
      'FIGHTER': '#ef4444',
      'HEAVY': '#f59e0b'
    };
    const sizes: Record<string, {w: number, h: number}> = {
      'SCOUT': {w: 40, h: 40},
      'FIGHTER': {w: 40, h: 40},
      'HEAVY': {w: 60, h: 50}
    };

    types.forEach(type => {
      const {w, h} = sizes[type];
      const canvas = document.createElement('canvas');
      canvas.width = w + 40;
      canvas.height = h + 40;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const color = colors[type];
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.fillStyle = color;

      ctx.beginPath();
      if (type === 'HEAVY') {
        ctx.moveTo(0, h / 2);
        ctx.lineTo(-w / 2, h / 4);
        ctx.lineTo(-w / 2, -h / 2);
        ctx.lineTo(w / 2, -h / 2);
        ctx.lineTo(w / 2, h / 4);
      } else if (type === 'FIGHTER') {
        ctx.moveTo(0, h / 2 + 5);
        ctx.lineTo(-w / 2, -h / 2);
        ctx.lineTo(0, -h / 4);
        ctx.lineTo(w / 2, -h / 2);
      } else {
        ctx.moveTo(0, h / 2);
        ctx.lineTo(-w / 2, -h / 2);
        ctx.lineTo(w / 2, -h / 2);
      }
      ctx.closePath();
      ctx.fill();

      // Engine glow
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, -h / 2, 5, 0, Math.PI * 2);
      ctx.fill();

      enemyCanvasesRef.current[type] = canvas;
    });
  };

  const renderBulletsOffscreen = () => {
    const types = [WeaponType.NORMAL, WeaponType.SPREAD, WeaponType.LASER, WeaponType.MISSILE, WeaponType.PLASMA, WeaponType.WAVE, WeaponType.HOMING];
    const colors: Record<string, string> = {
      [WeaponType.NORMAL]: '#ffff00',
      [WeaponType.SPREAD]: '#ffff00',
      [WeaponType.LASER]: '#00ffff',
      [WeaponType.MISSILE]: '#ff4400',
      [WeaponType.PLASMA]: '#a855f7',
      [WeaponType.WAVE]: '#10b981',
      [WeaponType.HOMING]: '#ffff00'
    };

    types.forEach(type => {
      const canvas = document.createElement('canvas');
      canvas.width = 30;
      canvas.height = 30;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const color = colors[type];
      ctx.translate(15, 15);
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fillStyle = color;

      if (type === WeaponType.LASER) {
        ctx.fillRect(-1, -10, 2, 20);
      } else if (type === WeaponType.MISSILE) {
        ctx.fillRect(-3, -7, 6, 15);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-1, -2, 2, 5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      bulletCanvasesRef.current[type] = canvas;
    });

    // Enemy bullet
    const eCanvas = document.createElement('canvas');
    eCanvas.width = 30;
    eCanvas.height = 30;
    const eCtx = eCanvas.getContext('2d');
    if (eCtx) {
      eCtx.translate(15, 15);
      eCtx.shadowBlur = 10;
      eCtx.shadowColor = '#ff4400';
      eCtx.fillStyle = '#ff4400';
      eCtx.beginPath();
      eCtx.arc(0, 0, 6, 0, Math.PI * 2);
      eCtx.fill();
      bulletCanvasesRef.current['ENEMY'] = eCanvas;
    }
  };

  const renderPlayerOffscreen = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(30, 30);
    ctx.shadowBlur = 15;
    ctx.shadowColor = playerColor;
    ctx.fillStyle = playerColor;

    ctx.beginPath();
    if (playerShape === 'VANGUARD') {
      ctx.moveTo(0, -20);
      ctx.lineTo(-25, 20);
      ctx.lineTo(25, 20);
    } else if (playerShape === 'PHANTOM') {
      ctx.moveTo(0, -30);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-25, 20);
      ctx.lineTo(0, 15);
      ctx.lineTo(25, 20);
      ctx.lineTo(10, 0);
    } else if (playerShape === 'TITAN') {
      ctx.moveTo(-10, -20);
      ctx.lineTo(10, -20);
      ctx.lineTo(25, 0);
      ctx.lineTo(25, 20);
      ctx.lineTo(-25, 20);
      ctx.lineTo(-25, 0);
    } else if (playerShape === 'STRIKER') {
      ctx.moveTo(0, -20);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-25, 20);
      ctx.lineTo(-10, 10);
      ctx.lineTo(0, 20);
      ctx.lineTo(10, 10);
      ctx.lineTo(25, 20);
      ctx.lineTo(5, 0);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, -5, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    offscreenPlayerRef.current = canvas;
  };

  const spawnBullet = (x: number, y: number, vx: number, vy: number, isPlayer: boolean, type: WeaponType = WeaponType.NORMAL) => {
    const pooledBullet = bulletPoolRef.current.find(b => !b.active);
    if (pooledBullet) {
      pooledBullet.reset(x, y, vx, vy, isPlayer, type);
    } else {
      const newBullet = new Bullet(x, y, vx, vy, isPlayer, type);
      bulletsRef.current.push(newBullet);
      bulletPoolRef.current.push(newBullet);
    }
  };

  const spawnParticle = (x: number, y: number, color: string) => {
    const pooledParticle = particlePoolRef.current.find(p => !p.active);
    if (pooledParticle) {
      pooledParticle.reset(x, y, color);
    } else {
      const newParticle = new Particle(x, y, color);
      particlesRef.current.push(newParticle);
      particlePoolRef.current.push(newParticle);
    }
  };

  const fireMissile = useCallback(() => {
    if (missiles > 0 && gameState === 'PLAYING') {
      setMissiles(prev => prev - 1);
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      for (let i = -2; i <= 2; i++) {
        spawnBullet(
          playerRef.current.x + playerRef.current.width / 2,
          playerRef.current.y,
          i * 2,
          -8,
          true,
          WeaponType.MISSILE
        );
      }
    }
  }, [missiles, gameState]);

  const activateSkill = useCallback(() => {
    if (skillCooldown > 0 || gameState !== 'PLAYING') return;

    if (skill === SkillType.EMP) {
      // Clear all enemy bullets
      bulletsRef.current.forEach(b => {
        if (!b.isPlayer) b.active = false;
      });
      setShake(10);
      for (let i = 0; i < 30; i++) {
        spawnParticle(
          playerRef.current.x + playerRef.current.width / 2,
          playerRef.current.y + playerRef.current.height / 2,
          '#00ffff'
        );
      }
    } else if (skill === SkillType.TIME_WARP) {
      setSkillActiveTimer(5000); // 5 seconds
    } else if (skill === SkillType.OVERDRIVE) {
      setSkillActiveTimer(8000); // 8 seconds
    }

    setSkillCooldown(skillMaxCooldown);
  }, [skill, skillCooldown, gameState]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.code] = true;
    if (e.code === 'Space' || e.code === 'KeyX') {
      fireMissile();
    }
    if (e.code === 'KeyC' || e.code === 'KeyV') {
      activateSkill();
    }
    if (e.code === 'Escape') {
      setGameState(prev => prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev);
    }
  }, [fireMissile, activateSkill]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.code] = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const update = () => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = DIFFICULTY_SETTINGS[difficulty];

    // Player Movement
    const speed = 6;
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) playerRef.current.x -= speed;
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) playerRef.current.x += speed;
    if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) playerRef.current.y -= speed;
    if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) playerRef.current.y += speed;

    // Boundaries
    playerRef.current.x = Math.max(0, Math.min(canvas.width - playerRef.current.width, playerRef.current.x));
    playerRef.current.y = Math.max(0, Math.min(canvas.height - playerRef.current.height, playerRef.current.y));

    // Drones
    dronesRef.current.forEach(d => d.update(playerRef.current.x + playerRef.current.width / 2, playerRef.current.y + playerRef.current.height / 2));

    // Skill Timers
    if (skillCooldown > 0) setSkillCooldown(prev => Math.max(0, prev - 16));
    if (skillActiveTimer > 0) setSkillActiveTimer(prev => Math.max(0, prev - 16));

    // Shooting
    const now = Date.now();
    let fireRate = weaponType === WeaponType.LASER ? 80 : 200;
    if (skill === SkillType.OVERDRIVE && skillActiveTimer > 0) {
      fireRate *= 0.4; // 2.5x fire rate
    }
    if (autoAttack || keysRef.current['Space'] || keysRef.current['KeyZ']) {
      if (now - lastShotTime.current > fireRate) {
        lastShotTime.current = now;
        const centerX = playerRef.current.x + playerRef.current.width / 2;
        const topY = playerRef.current.y;

        if (weaponType === WeaponType.NORMAL) {
          spawnBullet(centerX, topY, 0, -10, true);
          if (weaponLevel >= 2) {
            spawnBullet(centerX - 15, topY + 10, 0, -10, true);
            spawnBullet(centerX + 15, topY + 10, 0, -10, true);
          }
        } else if (weaponType === WeaponType.SPREAD) {
          spawnBullet(centerX, topY, 0, -10, true);
          spawnBullet(centerX, topY, -2, -9, true);
          spawnBullet(centerX, topY, 2, -9, true);
          if (weaponLevel >= 2) {
            spawnBullet(centerX, topY, -4, -8, true);
            spawnBullet(centerX, topY, 4, -8, true);
          }
        } else if (weaponType === WeaponType.LASER) {
          spawnBullet(centerX, topY, 0, -15, true, WeaponType.LASER);
        } else if (weaponType === WeaponType.PLASMA) {
          spawnBullet(centerX, topY, 0, -6, true, WeaponType.PLASMA);
        } else if (weaponType === WeaponType.WAVE) {
          spawnBullet(centerX, topY, 0, -8, true, WeaponType.WAVE);
        } else if (weaponType === WeaponType.HOMING) {
          spawnBullet(centerX, topY, 0, -8, true, WeaponType.HOMING);
        }
      }
    }

    // Drone Shooting
    dronesRef.current.forEach(drone => {
      if (now - drone.lastShot > 500) {
        drone.lastShot = now;
        spawnBullet(drone.x, drone.y, 0, -10, true);
      }
    });

    // Spawn Enemies
    if (!bossActive && Math.random() < config.enemySpawnRate + (stage * 0.002)) {
      enemiesRef.current.push(new Enemy(canvas.width, config));
    }

    // Stage Progression
    if (enemiesKilled >= stage * 20 && !bossActive) {
      if (stage % 5 === 0) {
        setBossActive(true);
        enemiesRef.current.push(new Enemy(canvas.width, config, true));
      } else {
        setStage(prev => prev + 1);
      }
    }

    // Update Objects
    const timeScale = (skill === SkillType.TIME_WARP && skillActiveTimer > 0) ? 0.3 : 1.0;
    
    bulletsRef.current.forEach(b => {
      if (!b.active) return;
      const originalVy = b.vy;
      const originalVx = b.vx;
      if (!b.isPlayer) {
        b.vy *= timeScale;
        b.vx *= timeScale;
      }
      b.update();
      if (!b.isPlayer) {
        b.vy = originalVy;
        b.vx = originalVx;
      }

      // Deactivate if out of bounds
      if (b.y < -50 || b.y > canvas.height + 50 || b.x < -50 || b.x > canvas.width + 50) {
        b.active = false;
      }
    });

    enemiesRef.current.forEach(e => {
      const originalSpeed = e.speed;
      e.speed *= timeScale;
      e.update(canvas.width);
      e.speed = originalSpeed;
    });
    
    particlesRef.current.forEach(p => {
      if (p.active) {
        p.update();
        if (p.life <= 0) p.active = false;
      }
    });
    powerUpsRef.current.forEach(p => p.update());

    // Filter off-screen
    bulletsRef.current = bulletsRef.current.filter(b => b.y > -50 && b.y < canvas.height + 50);
    enemiesRef.current = enemiesRef.current.filter(e => e.y < canvas.height + 50);
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    powerUpsRef.current = powerUpsRef.current.filter(p => p.y < canvas.height + 50);

    // Shield Timer
    if (shieldActive > 0) setShieldActive(prev => Math.max(0, prev - 16));

    // Collisions: Bullet vs Enemy
    bulletsRef.current.forEach(bullet => {
      if (!bullet.active || !bullet.isPlayer) return;
      enemiesRef.current.forEach((enemy, eIdx) => {
        if (
          bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
          bullet.y > enemy.y && bullet.y < enemy.y + enemy.height
        ) {
          enemy.hp -= bullet.damage;
          if (bullet.type !== WeaponType.LASER) {
            bullet.active = false;
          }
          
          // Hit particles
          spawnParticle(bullet.x, bullet.y, '#fff');

          if (enemy.hp <= 0) {
            for (let i = 0; i < (enemy.type === 'BOSS' ? 50 : 15); i++) {
              spawnParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type === 'BOSS' ? '#ff0000' : '#ff4400');
            }
            const points = enemy.type === 'BOSS' ? 5000 : enemy.type === 'HEAVY' ? 500 : enemy.type === 'FIGHTER' ? 200 : 100;
            setScore(prev => prev + Math.floor(points * config.scoreMultiplier));
            setEnemiesKilled(prev => prev + 1);
            setCombo(prev => prev + 1);

            if (enemy.type === 'BOSS') {
              setBossActive(false);
              setStage(prev => prev + 1);
              setShake(20);
              // Big reward
              for (let i = 0; i < 3; i++) {
                powerUpsRef.current.push(new PowerUp(enemy.x + Math.random() * enemy.width, enemy.y + Math.random() * enemy.height));
              }
            } else if (Math.random() < 0.15) {
              powerUpsRef.current.push(new PowerUp(enemy.x, enemy.y));
            }

            enemiesRef.current.splice(eIdx, 1);
          }
        }
      });
    });

    // Collisions: Enemy vs Player
    enemiesRef.current.forEach((enemy, eIdx) => {
      const player = playerRef.current;
      if (
        enemy.x < player.x + player.width &&
        enemy.x + enemy.width > player.x &&
        enemy.y < player.y + player.height &&
        enemy.y + enemy.height > player.y
      ) {
        if (shieldActive <= 0) {
          setLives(prev => {
            if (prev <= 1) setGameState('GAMEOVER');
            return prev - 1;
          });
          setCombo(0);
          setShake(15);
          setShieldActive(2000);
        }
        if (enemy.type !== 'BOSS') enemiesRef.current.splice(eIdx, 1);
        for (let i = 0; i < 20; i++) {
          spawnParticle(player.x + player.width / 2, player.y + player.height / 2, '#ffffff');
        }
      }
    });

    // Collisions: PowerUp vs Player
    powerUpsRef.current.forEach((pu, idx) => {
      const player = playerRef.current;
      if (
        pu.x < player.x + player.width &&
        pu.x + pu.width > player.x &&
        pu.y < player.y + player.height &&
        pu.y + pu.height > player.y
      ) {
        if (pu.type.type === 'HEALTH') setLives(prev => Math.min(5, prev + 1));
        if (pu.type.type === 'MISSILE') setMissiles(prev => Math.min(10, prev + 2));
        if (pu.type.type === 'SHIELD') setShieldActive(5000);
        if (pu.type.type === 'DRONE') {
          if (dronesRef.current.length < 2) {
            const offset = dronesRef.current.length === 0 ? -40 : 40;
            dronesRef.current.push(new Drone(offset, 20));
          }
        }
        if (pu.type.type === 'WEAPON') {
          if (weaponType === pu.type.weaponType) {
            setWeaponLevel(prev => Math.min(3, prev + 1));
          } else {
            setWeaponType(pu.type.weaponType!);
            setWeaponLevel(1);
          }
        }
        powerUpsRef.current.splice(idx, 1);
      }
    });
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    const p = playerRef.current;
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    
    if (shieldActive > 0) {
      ctx.strokeStyle = shieldActive > 1000 ? '#00ffff' : `rgba(0, 255, 255, ${Math.sin(Date.now() * 0.02) * 0.5 + 0.5})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, p.width * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Player Body
    ctx.shadowBlur = 15;
    ctx.shadowColor = playerColor;
    ctx.fillStyle = playerColor;
    ctx.beginPath();
    
    if (playerShape === 'VANGUARD') {
      ctx.moveTo(0, -p.height / 2);
      ctx.lineTo(-p.width / 2, p.height / 2);
      ctx.lineTo(p.width / 2, p.height / 2);
    } else if (playerShape === 'PHANTOM') {
      ctx.moveTo(0, -p.height / 2 - 10);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-p.width / 2, p.height / 2);
      ctx.lineTo(0, p.height / 2 - 5);
      ctx.lineTo(p.width / 2, p.height / 2);
      ctx.lineTo(10, 0);
    } else if (playerShape === 'TITAN') {
      ctx.moveTo(-10, -p.height / 2);
      ctx.lineTo(10, -p.height / 2);
      ctx.lineTo(p.width / 2, 0);
      ctx.lineTo(p.width / 2, p.height / 2);
      ctx.lineTo(-p.width / 2, p.height / 2);
      ctx.lineTo(-p.width / 2, 0);
    } else if (playerShape === 'STRIKER') {
      ctx.moveTo(0, -p.height / 2);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-p.width / 2, p.height / 2);
      ctx.lineTo(-10, p.height / 2 - 10);
      ctx.lineTo(0, p.height / 2);
      ctx.lineTo(10, p.height / 2 - 10);
      ctx.lineTo(p.width / 2, p.height / 2);
      ctx.lineTo(5, 0);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Detail lines
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Cockpit
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -5, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Engines
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffaa00';
    ctx.fillStyle = '#ffaa00';
    const engineH = 10 + Math.random() * 15;
    if (playerShape === 'TITAN') {
      ctx.fillRect(-20, p.height / 2, 8, engineH);
      ctx.fillRect(12, p.height / 2, 8, engineH);
    } else {
      ctx.fillRect(-12, p.height / 2, 6, engineH);
      ctx.fillRect(6, p.height / 2, 6, engineH);
    }
    ctx.shadowBlur = 0;

    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Screen Shake
    ctx.save();
    if (shake > 0) {
      const sx = (Math.random() - 0.5) * shake;
      const sy = (Math.random() - 0.5) * shake;
      ctx.translate(sx, sy);
      setShake(prev => Math.max(0, prev - 1));
    }

    // Stars
    starsRef.current.forEach(s => {
      s.update(canvas.height);
      s.draw(ctx);
    });

    if (gameState === 'PLAYING' || gameState === 'PAUSED') {
      // Draw Player
      if (shieldActive % 200 < 100) {
        if (offscreenPlayerRef.current) {
          ctx.drawImage(
            offscreenPlayerRef.current, 
            playerRef.current.x - 5, 
            playerRef.current.y - 10
          );
        }
        
        if (shieldActive > 0) {
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(playerRef.current.x + 25, playerRef.current.y + 20, 35, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      bulletsRef.current.forEach(b => {
        if (b.active) {
          const bCanvas = b.isPlayer ? bulletCanvasesRef.current[b.type] : bulletCanvasesRef.current['ENEMY'];
          if (bCanvas) {
            ctx.drawImage(bCanvas, b.x - 15, b.y - 15);
          } else {
            b.draw(ctx);
          }
        }
      });
      enemiesRef.current.forEach(e => {
        if (e.type !== 'BOSS') {
          const eCanvas = enemyCanvasesRef.current[e.type];
          if (eCanvas) {
            ctx.drawImage(eCanvas, e.x - 20, e.y - 20);
            
            // HP Bar for minions
            if (e.hp < e.maxHp) {
              ctx.fillStyle = 'rgba(0,0,0,0.5)';
              ctx.fillRect(e.x, e.y - 12, e.width, 6);
              const hpColor = e.hp / e.maxHp > 0.5 ? '#10b981' : e.hp / e.maxHp > 0.2 ? '#f59e0b' : '#ef4444';
              ctx.fillStyle = hpColor;
              ctx.fillRect(e.x, e.y - 12, (e.hp / e.maxHp) * e.width, 6);
            }
          } else {
            e.draw(ctx);
          }
        } else {
          e.draw(ctx);
        }
      });
      particlesRef.current.forEach(p => {
        if (p.active) p.draw(ctx);
      });
      powerUpsRef.current.forEach(p => p.draw(ctx));
      dronesRef.current.forEach(d => d.draw(ctx));
    }

    ctx.restore();

    requestRef.current = requestAnimationFrame(() => {
      update();
      draw();
    });
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, difficulty, weaponType, weaponLevel, stage]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex items-center justify-center">
      <div className="relative w-full max-w-2xl aspect-[3/4] bg-[#111] border border-white/10 shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={800}
          className="w-full h-full object-contain"
        />

        <AnimatePresence>
          {gameState === 'PLAYING' && (
            <HUD 
              score={score}
              highScore={highScore}
              stage={stage}
              lives={lives}
              missiles={missiles}
              weaponType={weaponType}
              weaponLevel={weaponLevel}
              bossActive={bossActive}
              bossHp={boss?.hp}
              bossMaxHp={boss?.maxHp}
              skill={skill}
              skillCooldown={skillCooldown}
              skillMaxCooldown={skillMaxCooldown}
              skillActiveTimer={skillActiveTimer}
              combo={combo}
            />
          )}

          {gameState === 'MENU' && (
            <Menu 
              highScore={highScore}
              onStart={() => setGameState('DIFFICULTY')}
              onCustomize={() => setGameState('CUSTOMIZE')}
            />
          )}

          {gameState === 'CUSTOMIZE' && (
            <Customization 
              playerShape={playerShape}
              playerColor={playerColor}
              autoAttack={autoAttack}
              skill={skill}
              setPlayerShape={setPlayerShape}
              setPlayerColor={setPlayerColor}
              setAutoAttack={setAutoAttack}
              setSkill={setSkill}
              onBack={() => setGameState('MENU')}
            />
          )}

          {gameState === 'DIFFICULTY' && (
            <DifficultySelection 
              onSelect={startGame}
              onBack={() => setGameState('MENU')}
            />
          )}

          {gameState === 'PAUSED' && (
            <PausedScreen 
              onResume={() => setGameState('PLAYING')}
              onQuit={() => setGameState('MENU')}
            />
          )}

          {gameState === 'GAMEOVER' && (
            <GameOverScreen 
              score={score}
              difficulty={difficulty}
              onRetry={() => startGame(difficulty)}
              onMenu={() => setGameState('MENU')}
            />
          )}
        </AnimatePresence>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>
    </div>
  );
}
