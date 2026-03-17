# AI Agent Contribution Guidelines

When continuing the development of Sky Vanguard, please adhere to these standards:

## 1. State Management
- **UI State**: Use React `useState` in `App.tsx`.
- **Game Physics/Entities**: Use `useRef` arrays to maintain 60 FPS. Do NOT move bullets or enemies into React state.

## 2. Drawing Logic
- All new entities should be added to `src/classes.ts`.
- Use procedural drawing (Canvas API) instead of image assets where possible to maintain the "Technical/Neon" aesthetic.
- Always include a `draw` method that takes `ctx: CanvasRenderingContext2D`.

## 3. Component Structure
- Keep UI components in `src/components/`.
- Use `framer-motion` for all screen transitions and menu animations.
- Ensure components are "pure" where possible, receiving data via props.

## 4. Collision Detection
- Collision logic resides in the `update` function of `App.tsx`.
- Use simple AABB (Axis-Aligned Bounding Box) for most collisions.
- For bosses, consider using multiple hitboxes if the shape is complex.

## 5. Performance
- Avoid object allocation inside the `draw` or `update` loops.
- Reuse objects or use simple primitives.
- Ensure `filter` operations on entity arrays are efficient.

## 6. Styling
- Use Tailwind CSS for UI components.
- Follow the existing color palette:
  - Background: `#050505`
  - Primary Accent: Emerald/Cyan
  - Danger: Red/Orange
  - Data: White/Slate
