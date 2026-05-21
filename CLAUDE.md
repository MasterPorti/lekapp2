# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lek App is a visual block-based programming application (similar to Scratch) for educational robotics. It's a client-side only Next.js app — no backend, no database, no API routes. All state lives in React hooks in memory.

The UI is in Spanish. Users drag and connect colored blocks on an interactive canvas to build programs.

## Commands

```bash
npm run dev       # Dev server at localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

No test runner is configured.

## Architecture

**Single-page app** — one route (`/`) in `app/page.tsx`, which is the main orchestrator. It owns all top-level state and delegates to two custom hooks:

- `useBlockManagement` — block placement, editing, deletion, undo, snap logic
- `useCanvasControls` — zoom, pan, touch gestures, navigation between views

### Block data model

Blocks form a tree. A `Block` has `{x, y, type, text, color, stroke, param?, children?}`. Loop blocks (`type: "control-loop"`) use `children[]` for nested blocks. Types: `evento` (orange), `control` (yellow), `control-loop` (yellow, C-shaped), `movimiento` (blue).

### Component organization (`app/components/`)

- `blocks/` — SVG rendering of blocks (`BlockSvg`, `CShapedBlockSvg`, `BlockContent`, `ParamIcon`)
- `canvas/` — placed blocks, block-being-positioned, logo
- `modals/` — block selector and parameter picker dialogs
- `ui/` — action buttons, undo, zoom controls

### Layout constants (`app/utils/blockDimensions.ts`)

All spatial constants live here: `SNAP_THRESHOLD` (40px), `BLOCK_VERTICAL_SPACING` (27px), `LOOP_HEADER_HEIGHT` (36px), `LOOP_SCALE` (1.5x), SVG dimension calculations. This is the source of truth for block geometry.

### Rendering

Blocks are SVG-based with custom paths, not CSS shapes. The canvas uses a CSS dot-grid background. The viewport is locked (`position: fixed`, touch-action disabled) to support custom gesture handling (pinch zoom, drag pan).

## Key Patterns

- State management is pure React hooks (`useState`, `useRef`) — no external state library.
- Mobile-first with full touch support. All interactive elements must work with touch gestures.
- Block snapping: placement algorithm checks proximity (`SNAP_THRESHOLD`) and type compatibility to determine valid connections.
- Undo uses a 4-second window for deletions only.
- Parameters are set via modals and displayed as badges inside block SVGs.
