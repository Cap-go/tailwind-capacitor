# tailwind-capacitor

<a href="https://capgo.app/"><img src="https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png" alt="Capgo - Instant updates for capacitor"/></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin"> ➡️ Get Instant updates for your App with Capgo</a></h2>
</div>

Tailwind CSS v4 + Capacitor UI components, shipped as a [shadcn](https://ui.shadcn.com/) registry so you own the source.

## Prerequisites

- Vue 3 app with Tailwind CSS v4 (`@tailwindcss/vite` or PostCSS)
- A project-level `components.json` from the [shadcn CLI](https://ui.shadcn.com/docs/cli) (`npx shadcn@latest init`)
- Path alias `@/*` pointing at your `src/` folder (see `jsconfig.json` in this repo)

## Install (shadcn registry)

Registry JSON is built to `public/r/` with `npm run build:registry`. Published URLs use your current git branch unless you set `REGISTRY_BRANCH` (for example `REGISTRY_BRANCH=main npm run postprocess:registry`).

After merge, use `main` in the URL:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-tailwind.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-provider.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-shared.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-icons.json
```

Then add any component:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-button.json
```

**From a clone of this repo** (after `npm run build:registry`):

```bash
npx shadcn@latest add ./public/r/capacitor-button.json
```

Replace your app global stylesheet with the capacitor bundle (it already includes Tailwind):

```css
@import '@/capacitor/styles/tailwind-capacitor.css';
```

Do not add a separate `@import "tailwindcss"` when using `tailwind-capacitor.css`.

All component slugs: `capacitor-actions`, `capacitor-actions-button`, `capacitor-actions-group`, `capacitor-actions-label`, `capacitor-app`, `capacitor-badge`, `capacitor-block`, `capacitor-block-footer`, `capacitor-block-header`, `capacitor-block-title`, `capacitor-breadcrumbs`, `capacitor-breadcrumbs-collapsed`, `capacitor-breadcrumbs-item`, `capacitor-breadcrumbs-separator`, `capacitor-button`, `capacitor-card`, `capacitor-checkbox`, `capacitor-chip`, `capacitor-dialog`, `capacitor-dialog-button`, `capacitor-fab`, `capacitor-icon`, `capacitor-link`, `capacitor-list`, `capacitor-list-button`, `capacitor-list-group`, `capacitor-list-input`, `capacitor-list-item`, `capacitor-menu-list`, `capacitor-menu-list-item`, `capacitor-message`, `capacitor-messagebar`, `capacitor-messages`, `capacitor-messages-title`, `capacitor-navbar`, `capacitor-navbar-back-link`, `capacitor-notification`, `capacitor-page`, `capacitor-panel`, `capacitor-popover`, `capacitor-popup`, `capacitor-preloader`, `capacitor-progressbar`, `capacitor-radio`, `capacitor-range`, `capacitor-searchbar`, `capacitor-segmented`, `capacitor-segmented-button`, `capacitor-sheet`, `capacitor-stepper`, `capacitor-tabbar`, `capacitor-tabbar-link`, `capacitor-table`, `capacitor-table-body`, `capacitor-table-cell`, `capacitor-table-head`, `capacitor-table-row`, `capacitor-toast`, `capacitor-toggle`, `capacitor-toolbar`.

## Tailwind v4 (CSS first)

No `tailwind.config.js`. Capacitor safe areas, platform variants (`ios`, `android`, `capacitor`, …), and utilities ship in `registry/capacitor/styles/` using `@import "tailwindcss"`, `@theme`, `@utility`, `@custom-variant`, and `@layer`.

## Example app

```bash
npm run build:registry
npm run sync:example
npm --prefix example run dev
```

## Legacy npm plugin (Tailwind v3)

v1.x on npm targets Tailwind 3. This branch is v4 + registry only (not published to npm). Package entry points (`main`, `./platform`, …) still load v3-style plugins and require `tailwindcss` as a peer dependency if you import them.

Documentation for each plugin topic lives under `docs/` (safe areas, platform, colors, …).

# Credits

Tailwind Capacitor is a fork of [Konsta UI](https://github.com/konstaui/konstaui) and [Tailwind CSS](https://tailwindcss.com/).
