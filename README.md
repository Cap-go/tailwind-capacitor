# tailwind-capacitor

<a href="https://capgo.app/"><img src="https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png" alt="Capgo - Instant updates for capacitor"/></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin"> ➡️ Get Instant updates for your App with Capgo</a></h2>
</div>

Tailwind CSS v4 + Capacitor UI components for **Vue**, **React**, and **Angular**, shipped as shadcn style registries so you own the source.

Shared `capacitor-tailwind` and `capacitor-shared` live at `public/r/` and are reused by every framework.

## Prerequisites

- Tailwind CSS v4 (`@tailwindcss/vite` or PostCSS)
- Path alias `@/*` pointing at your `src/` folder (see `jsconfig.json` in this repo)
- Framework specific `components.json` from the matching CLI init

## Vue (shadcn-vue)

Init with [shadcn-vue](https://www.shadcn-vue.com/) (`npx shadcn-vue@latest init`). Registry artifacts use the same schema as shadcn-vue.

Legacy URLs stay at `public/r/<slug>.json`. Mirrors also live under `public/r/vue/`.

```bash
npx shadcn-vue@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-tailwind.json
npx shadcn-vue@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-provider.json
npx shadcn-vue@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-button.json
```

## React (shadcn)

Init with [shadcn](https://ui.shadcn.com/) (`npx shadcn@latest init`). Use `components-react.json` in this repo as a template (`tsx: true`).

```bash
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-tailwind.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-shared.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/react/capacitor-provider.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/react/capacitor-button.json
```

## Angular

[@spartan-ng/cli](https://www.spartan.ng/) does not install arbitrary remote registry JSON. Use the same registry layout and `node scripts/registry-add.mjs <url-or-path>` (works like shadcn copy install). Committed items live under `public/r/angular/`.

```bash
node scripts/registry-add.mjs https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-tailwind.json
node scripts/registry-add.mjs https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/angular/capacitor-provider.json
node scripts/registry-add.mjs https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/angular/capacitor-button.json
```

## Styles

```css
@import '@/capacitor/styles/tailwind-capacitor.css';
```

Do not add a separate `@import "tailwindcss"` when using `tailwind-capacitor.css`.

## Registry build

```bash
npm run build:registry
```

Outputs:

- `public/r/` Vue items (backward compatible URLs) + shared `capacitor-tailwind.json`
- `public/r/vue/` mirror of Vue item JSON
- `public/r/react/` React `.tsx` items
- `public/r/angular/` Angular standalone components

## Component slugs (87 items)

Install any item with `npx shadcn-vue@latest add .../public/r/<slug>.json` (Vue), `npx shadcn@latest add .../public/r/react/<slug>.json` (React), or `registry-add.mjs .../public/r/angular/<slug>.json` (Angular).

`capacitor-tailwind`, `capacitor-shared`, `capacitor-provider`, `capacitor-icons`, `capacitor-accordion`, `capacitor-accordion-item`, `capacitor-actions`, `capacitor-actions-button`, `capacitor-actions-group`, `capacitor-actions-label`, `capacitor-alert`, `capacitor-app`, `capacitor-avatar`, `capacitor-badge`, `capacitor-block`, `capacitor-block-footer`, `capacitor-block-header`, `capacitor-block-title`, `capacitor-breadcrumbs`, `capacitor-breadcrumbs-collapsed`, `capacitor-breadcrumbs-item`, `capacitor-breadcrumbs-separator`, `capacitor-button`, `capacitor-card`, `capacitor-checkbox`, `capacitor-chip`, `capacitor-datetime`, `capacitor-dialog`, `capacitor-dialog-button`, `capacitor-fab`, `capacitor-footer`, `capacitor-header`, `capacitor-icon`, `capacitor-infinite-scroll`, `capacitor-input-otp`, `capacitor-item-sliding`, `capacitor-link`, `capacitor-list`, `capacitor-list-button`, `capacitor-list-group`, `capacitor-list-input`, `capacitor-list-item`, `capacitor-menu-list`, `capacitor-menu-list-item`, `capacitor-message`, `capacitor-messagebar`, `capacitor-messages`, `capacitor-messages-title`, `capacitor-modal`, `capacitor-navbar`, `capacitor-navbar-back-link`, `capacitor-note`, `capacitor-notification`, `capacitor-page`, `capacitor-panel`, `capacitor-picker`, `capacitor-popover`, `capacitor-popup`, `capacitor-preloader`, `capacitor-progressbar`, `capacitor-radio`, `capacitor-range`, `capacitor-refresher`, `capacitor-reorder`, `capacitor-searchbar`, `capacitor-segmented`, `capacitor-segmented-button`, `capacitor-select`, `capacitor-sheet`, `capacitor-skeleton`, `capacitor-split-pane`, `capacitor-stepper`, `capacitor-tab`, `capacitor-tabbar`, `capacitor-tabbar-link`, `capacitor-table`, `capacitor-table-body`, `capacitor-table-cell`, `capacitor-table-head`, `capacitor-table-row`, `capacitor-tabs`, `capacitor-textarea`, `capacitor-thumbnail`, `capacitor-toast`, `capacitor-toggle`, `capacitor-toolbar`, `capacitor-touch-ripple`.

Framework availability: every slug above has a Vue item at `public/r/<slug>.json`. React and Angular items use the same slug under `public/r/react/` and `public/r/angular/` except shared `capacitor-tailwind` and `capacitor-shared` (root only).

## Example apps

Vue demo (all registry items synced into `example/`):

```bash
npm run build:registry
npm run sync:example
npm --prefix example run dev
```

React smoke app (registry install + Vite build):

```bash
npm run build:registry
npm run build:example-react
```

## Tailwind v4 (CSS first)

No `tailwind.config.js`. Capacitor safe areas, platform variants (`ios`, `android`, `capacitor`, …), and utilities ship in `registry/capacitor/styles/`.

## Credits

Tailwind Capacitor is a fork of [Konsta UI](https://github.com/konstaui/konstaui) and [Tailwind CSS](https://tailwindcss.com/).
