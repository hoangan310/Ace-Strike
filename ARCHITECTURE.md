# Project Architecture

This document outlines the technical structure of Sky Vanguard for developers and AI agents.

## Core Philosophy
The game uses a **Hybrid React-Canvas Architecture**:
- **React** handles the high-level state (menus, HUD, game state transitions).
- **Canvas** handles the high-frequency rendering (60 FPS game loop) for entities.

## File Structure
- `/src/App.tsx`: The "Brain". Manages the `requestAnimationFrame` loop, collision detection, and global state.
- `/src/classes.ts`: Entity definitions. Contains logic for `Bullet`, `Enemy`, `Particle`, `PowerUp`, and `Drone`.
- `/src/types.ts`: Centralized TypeScript definitions (Enums for `WeaponType`, `GameState`, etc.).
- `/src/constants.ts`: Tuning parameters (Difficulty settings, Ship colors, Power-up types).
- `/src/components/`: Pure React UI components.
  - `HUD.tsx`: Overlay for gameplay stats.
  - `Menu.tsx`: Main entry point.
  - `Customization.tsx`: Ship configuration logic.
  - `ShipPreview.tsx`: Animated canvas preview for the customization menu.

## Game Loop Logic
The loop in `App.tsx` follows a standard pattern:
1. **Input Handling**: Reading `keysRef` (populated by event listeners).
2. **Update Phase**:
   - Move player.
   - Update all entities (bullets, enemies, particles).
   - Spawn new enemies based on difficulty and stage.
   - Check stage progression (boss triggers).
3. **Collision Detection**:
   - Bullet vs Enemy (Damage calculation).
   - Enemy vs Player (Life deduction + Shield trigger).
   - PowerUp vs Player (Stat modification).
4. **Draw Phase**:
   - Clear canvas.
   - Draw background/stars.
   - Draw player ship.
   - Iterate and draw all entity arrays.

## Entity Management
Entities are stored in `useRef` arrays (e.g., `bulletsRef`) to avoid React re-render overhead during the game loop. React state is only used for UI-relevant data like `score`, `lives`, and `gameState`.

## Rendering Details
- **Procedural Drawing**: Most entities (ships, bosses) are drawn using Canvas path commands (`moveTo`, `lineTo`, `arc`) rather than static sprites. This allows for dynamic coloring and glow effects.
- **Glow Effects**: Achieved using `shadowBlur` and `shadowColor` on the canvas context.
- **Particles**: Short-lived entities used for explosions and engine trails.
