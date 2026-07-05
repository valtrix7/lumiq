# @lumiq/web

The Lumiq web app — the **primary build target** and UI spine of the repository.
Built with Next.js (App Router) + TypeScript + Tailwind, using the dark cinematic
Lumiq design language and contract-shaped fixtures.

For repository-wide context, read the root [`README.md`](../../README.md) and the
coding-agent instructions in [`AGENTS.md`](../../AGENTS.md) first.

## Develop

From the repo root (preferred, so workspace deps resolve):

```bash
pnpm install
pnpm dev            # runs turbo dev across the workspace
```

Or scope to this app only:

```bash
pnpm --filter @lumiq/web dev
```

Then open http://localhost:3000.

## Structure

```txt
src/
  app/            # App Router routes: (workspace), demo, share, layout, globals.css
  components/     # feature UIs: studio, review, vault, provenance, commerce,
                  #   setup, settings, share, admin, marketing, shell, charts, ui, common
  lib/            # cn, navigation, screen-types, state-param, utils, mock-data
```

## Product & design references

- Product overview: [`PRODUCT.md`](./PRODUCT.md)
- Design language & tokens: [`docs/design/`](../../docs/design)
- UX flows: [`docs/product/05-user-flows-ux-spec.md`](../../docs/product/05-user-flows-ux-spec.md)

## Conventions

- Dark mode only; pure black media canvas, near-black panels, cobalt-blue actions.
- `Inter` for UI; a mono font for IDs, B2 keys, checksums, and manifest snippets.
- UI is built screen-first against contract-shaped fixtures in `src/lib/mock-data`
  before wiring to the Core API.
