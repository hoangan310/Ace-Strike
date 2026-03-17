# AI Agent Skills & Implementation Guide

This guide empowers AI agents to extend Sky Vanguard with new features using established patterns.

## 1. Adding a New Skill
To add a new active skill (e.g., "Key C"):
1.  **Define**: Add the skill name to `SkillType` enum in `src/types.ts`.
2.  **State**: In `App.tsx`, initialize the skill in the `useState` or add logic to switch skills.
3.  **Effect**: In `App.tsx`, locate the `activateSkill` function and add a new `else if` block for your skill.
    - *Example*: For a "Bullet Clear", filter the `bulletsRef.current`.
    - *Example*: For a "Time Slow", set a `skillActiveTimer` and use it as a `timeScale` multiplier in the `update` loop.
4.  **UI**: The `HUD.tsx` automatically displays the active skill and its cooldown.

## 2. Adding a New Weapon Type
1.  **Define**: Add to `WeaponType` enum in `src/types.ts`.
2.  **Bullet Logic**: Update the `Bullet` class constructor in `src/classes.ts` to set damage and speed for the new type.
3.  **Firing Pattern**: In `App.tsx`, inside the `update` loop's shooting section, add a new `else if` block to define the bullet spawn pattern (e.g., spread, rapid fire, or custom angles).
4.  **Visuals**: Update `Bullet.draw` in `src/classes.ts` to give the weapon a unique color or shape.

## 3. Creating a New Boss
1.  **Spawn**: In `App.tsx`, bosses are spawned when `enemiesKilled` reaches a threshold.
2.  **Visuals**: In `src/classes.ts`, locate `drawBoss`. Add a new `else if (this.bossType === N)` block.
    - Use `ctx.save()`, `ctx.translate()`, and `ctx.rotate()` for complex procedural shapes.
    - Use `Math.sin(Date.now())` for pulsing or rotating parts.
3.  **Behavior**: Update `Enemy.update` to add custom movement patterns for the new boss type (e.g., circular movement, charging, or teleporting).

## 4. Implementing New Power-ups
1.  **Define**: Update `PowerUpType` in `src/types.ts`.
2.  **Collection**: In `App.tsx`, inside the "Collisions: PowerUp vs Player" section, add logic for what happens when the player picks it up.
3.  **Visuals**: Update `PowerUp.draw` in `src/classes.ts` if you want a custom icon or color.

## 5. AI Coding Patterns to Follow
- **Ref Usage**: Always use `useRef` for high-frequency data (bullets, enemies) to avoid React re-render lag.
- **Procedural Drawing**: Prefer `ctx.beginPath()` and `ctx.fill()` over images for a consistent neon aesthetic.
- **Time-Based Logic**: Use `Date.now()` or frame-based timers (`prev - 16`) for cooldowns and durations.
- **Clean Code**: Keep entity logic in `classes.ts` and orchestration logic in `App.tsx`.
