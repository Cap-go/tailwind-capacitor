# tailwind-capacitor

<a href="https://capgo.app/"><img src="https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png" alt="Capgo - Instant updates for capacitor"/></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin"> ➡️ Get Instant updates for your App with Capgo</a></h2>
</div>

Tailwind CSS v4 + Capacitor UI components, shipped as a [shadcn](https://ui.shadcn.com/) registry so you own the source.

## Install (shadcn registry)

Registry JSON is built to `public/r/`. Use raw GitHub URLs (replace `<branch>` with `main` after merge):

```bash
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/<branch>/public/r/capacitor-tailwind.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/<branch>/public/r/capacitor-provider.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/<branch>/public/r/capacitor-shared.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/<branch>/public/r/capacitor-icons.json
```

Then add any component:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/<branch>/public/r/capacitor-button.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/<branch>/public/r/capacitor-list.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/<branch>/public/r/capacitor-navbar.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/<branch>/public/r/capacitor-page.json
```

All component slugs: `capacitor-actions`, `capacitor-actions-button`, `capacitor-actions-group`, `capacitor-actions-label`, `capacitor-app`, `capacitor-badge`, `capacitor-block`, `capacitor-block-footer`, `capacitor-block-header`, `capacitor-block-title`, `capacitor-breadcrumbs`, `capacitor-breadcrumbs-collapsed`, `capacitor-breadcrumbs-item`, `capacitor-breadcrumbs-separator`, `capacitor-button`, `capacitor-card`, `capacitor-checkbox`, `capacitor-chip`, `capacitor-dialog`, `capacitor-dialog-button`, `capacitor-fab`, `capacitor-icon`, `capacitor-link`, `capacitor-list`, `capacitor-list-button`, `capacitor-list-group`, `capacitor-list-input`, `capacitor-list-item`, `capacitor-menu-list`, `capacitor-menu-list-item`, `capacitor-message`, `capacitor-messagebar`, `capacitor-messages`, `capacitor-messages-title`, `capacitor-navbar`, `capacitor-navbar-back-link`, `capacitor-notification`, `capacitor-page`, `capacitor-panel`, `capacitor-popover`, `capacitor-popup`, `capacitor-preloader`, `capacitor-progressbar`, `capacitor-radio`, `capacitor-range`, `capacitor-searchbar`, `capacitor-segmented`, `capacitor-segmented-button`, `capacitor-sheet`, `capacitor-stepper`, `capacitor-tabbar`, `capacitor-tabbar-link`, `capacitor-table`, `capacitor-table-body`, `capacitor-table-cell`, `capacitor-table-head`, `capacitor-table-row`, `capacitor-toast`, `capacitor-toggle`, `capacitor-toolbar`.

Local path (from repo root, after `npm run build:registry`):

```bash
npx shadcn@latest add ./public/r/capacitor-button.json
```

Import styles in your app CSS:

```css
@import '@/capacitor/styles/tailwind-capacitor.css';
```

## Tailwind v4 (CSS first)

No `tailwind.config.js`. Capacitor safe areas, platform variants (`ios`, `android`, `capacitor`, …), and utilities ship in `registry/capacitor/styles/` using `@import "tailwindcss"`, `@theme`, `@utility`, `@custom-variant`, and `@layer`.

## Example app

```bash
npm run build:registry
npm run sync:example
npm --prefix example run dev
```

## Legacy npm plugin (Tailwind v3)

v1.x on npm targets Tailwind 3. This branch is v4 + registry only (not published to npm).

Documentation for each plugin topic lives under `docs/` (safe areas, platform, colors, …).

# Credits

Tailwind Capacitor is a fork of [Konsta UI](https://github.com/konstaui/konstaui) and [Tailwind CSS](https://tailwindcss.com/).
