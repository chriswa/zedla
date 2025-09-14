# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run typecheck` - Type check without emitting files (`tsc --noEmit`)
- `npm run lint` - Run ESLint on codebase
- `npm run lint:fix` - Run ESLint with auto-fix

## Architecture Overview

This is a game engine built in TypeScript using a modular architecture with dependency injection (tsyringe).

### Core Structure

- **App** (`src/app/app.ts`) - Main application class that orchestrates the game loop, handles resource loading, and manages input
- **Game** (`src/game/game.ts`) - Core game controller using FSM pattern to manage game states, currently boots into room simulation
- **ECS System** (`src/game/ecs/`) - Entity Component System for game objects with systems for physics, animation, and rendering
- **Room System** (`src/game/room/`) - Room-based game progression using RoomSimulation as game strategy

### Key Patterns

- **Zero/Minimal Boilerplate**: DX is extremely important due to this being a solo dev project
- **Separation of Conerns is Paramount**: To keep code readable and pleasing to work with
- **Typing is Critical**: It is sometimes necessary to build rare complex type helpers to enable great code intel with minimal boilerplate
- **Readability is Critical**: Use verbose variable names, function names, and class names to prioritize readability. 
- **Dependency Injection**: Uses tsyringe with `@singleton()` decorators
- **FSM (Finite State Machine)**: Custom FSM implementation (`src/util/fsm.ts`) for state/strategy management (Prefer using the term "FSM strategy" instead of FSM state to avoid confusion with the overloaded word'state'. )
- **ECS Architecture**: Entity-component-system pattern with scene-based isolation for different simulations
- **Strategy Pattern**: GameStrategy base class for different game modes
- **Scene-Based Entity Management**: Each room/simulation gets its own scene for entity isolation while maintaining globally unique EntityIDs

### Additional Style Notes

- prefer descriptive over concise names.
- When proposing new approaches, always check if similar patterns exist in the codebase first
- Prefer extending or replacing existing patterns over introducing new ones
- Prioritize readability and separation of concerns over strict DRYness
- Accept some code duplication if it makes the intent clearer
- Prefer single source of truth - derive secondary values rather than duplicating logic
- prefer DRYness, but readability and separation of concerns over strict DRYness
- prefer explicit naming that makes the source and purpose clear.
- don't add unnecessary comments. readable code is self-documenting. comments are helpful when document surprises

### Module Organization

- `src/app/` - Application bootstrap and input handling
- `src/game/` - Core game logic, ECS, and room systems
- `src/util/` - Utility functions, FSM, type helpers, assertions
- `src/types/` - Type definitions for game resources
- `src/resources/` - Game asset definitions (tilesets, animations, image slices)

### Development Notes

- Uses path mapping with `@/` prefix for imports
- TypeScript strict mode enabled
- Vite for bundling with SWC for fast compilation
- ESLint with comprehensive rule sets including import validation
- Leave a single newline at the end of each file
- run `pnpm typecheck` when unsure about code correctness, but don't try to build or run the project
