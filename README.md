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

## Dark mode (all frameworks)

The `dark` prop on `TailwindCapacitorProvider` is optional. When omitted, components follow `prefers-color-scheme`. Set `:dark="true"` or `:dark="false"` to force light or dark. Vue, React, and Angular all apply the `dark` class on a full-width wrapper when dark mode is active so Tailwind `dark:*` utilities work the same way. Vue and React wrap children in a `min-h-full w-full` div; keep that in mind if your layout depends on a direct `h-full` parent chain.

## Angular

[@spartan-ng/cli](https://www.spartan.ng/) does not install arbitrary remote registry JSON. Copy items with `registry-add` (same idea as shadcn file install).

**npm 4.0.0** on the registry today ships no `scripts/` folder and no `registry-add` bin, so Angular file install from that package does not work. Use **5.0.0+** (after publish), a git dependency, or `npm pack` from this repo until then.

**Clone or pack (works today on 5.0.0 in this repo):**

```bash
node scripts/registry-add.mjs public/r/capacitor-tailwind.json
node scripts/registry-add.mjs public/r/capacitor-shared.json
node scripts/registry-add.mjs public/r/angular/capacitor-provider.json
node scripts/registry-add.mjs public/r/angular/capacitor-button.json
```

After `@capgo/tailwind-capacitor@5.0.0` is published, the same URLs work as:

```bash
npx @capgo/tailwind-capacitor registry-add <url-or-path>
```

Set `REGISTRY_ROOT` to your checkout's `public/r` when using URLs so dependencies resolve to your local build instead of `main`.

From a git clone without a global install:

```bash
npx --package github:Cap-go/tailwind-capacitor registry-add public/r/angular/capacitor-button.json
```

### Angular component scope

Most Angular registry items are class host wrappers around shared Konsta class maps (theme and `dark:*` styling). These items ship interactive controls with real DOM, inputs, outputs, and ARIA: `Toggle`, `Checkbox`, `Radio`, `Range`, `Searchbar`, and `ListInput`. `Preloader` and similar animation shells only apply theme classes on the host (no SVG spinner logic in Angular). Use Vue or React registry items when you need full Konsta behavior out of the box.

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
