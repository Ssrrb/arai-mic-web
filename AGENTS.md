# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vite-powered React 19 storefront written in TypeScript. Application code lives in `src/`: `main.tsx` mounts the app, `App.tsx` coordinates views and cart state, and `types.ts` contains shared domain types. Put reusable UI and Three.js elements in `src/components/`, product configuration in `src/data/`, and browser-side helpers in `src/utils/`. Global styling is in `src/index.css`; Vite and TypeScript configuration remain at the repository root. There is currently no dedicated test or static-assets directory.

## Build, Test, and Development Commands

Use Bun because `bun.lock` is committed.

- `bun install` installs dependencies from the lockfile.
- `bun run dev` starts Vite on `0.0.0.0:3000` with hot reload.
- `bun run lint` runs `tsc --noEmit`; despite its name, this is the project's type-checking gate.
- `bun run build` creates the production bundle in `dist/`.
- `bun run preview` serves the built bundle for final browser checks.
- `bun run clean` removes generated build output and `server.js`.

Before submitting changes, run `bun run lint` and `bun run build`.

## Coding Style & Naming Conventions

Follow the existing TypeScript/React style: two-space indentation, single-quoted imports and strings, semicolons, and trailing commas in multiline structures. Name components and exported types in PascalCase (`CartDrawer`, `CustomBallConfig`), functions and variables in camelCase, and constants in UPPER_SNAKE_CASE. Keep component filenames aligned with their primary export. Prefer functional components, typed props, and hooks; place shared behavior in `src/utils/` rather than duplicating it. Use Tailwind utility classes for component styling and reserve `index.css` for global rules.

## Testing Guidelines

No automated test framework or coverage threshold is configured. Treat type checking, production builds, and focused browser verification as required validation. Exercise affected flows at desktop and mobile widths, especially the 3D canvas, customization, cart quantity changes, audio controls, and WhatsApp checkout. If introducing tests, colocate them as `*.test.ts` or `*.test.tsx` and add the corresponding script and framework documentation to `package.json`.

## Commit & Pull Request Guidelines

Recent history uses short imperative Conventional Commit-style subjects, primarily `feat: ...`. Continue with scoped prefixes such as `feat:`, `fix:`, `refactor:`, or `docs:` and keep each commit focused. Pull requests should explain the user-visible change, list validation performed, link relevant issues, and include screenshots or recordings for visual or animation changes. Call out new environment variables and update `.env.example`; never commit secrets or local `.env` files.
