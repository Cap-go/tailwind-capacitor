---
locale: en
published: true
---
# Tailwind Capacitor (shadcn registry)

[Tailwind Capacitor](https://github.com/Cap-go/tailwind-capacitor/) ships Tailwind CSS v4 utilities for Capacitor safe areas and platform variants, plus Vue UI components, as a [shadcn registry](https://ui.shadcn.com/docs/registry). You copy source into your app with `shadcn add`.

Related PR: tailwind-capacitor v4 registry rebuild (link from your capacitor registry PR).

## Prerequisites

- Tailwind CSS v4 (`@tailwindcss/vite` or PostCSS)
- Vue 3 project with `components.json` (shadcn CLI)
- No `tailwind.config.js` required

## Install base styles

```bash
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-tailwind.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-provider.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-shared.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-icons.json
```

Import the bundle in your global CSS:

```css
@import '@/capacitor/styles/tailwind-capacitor.css';
```

## Install a component

```bash
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-button.json
```

Components land under `src/capacitor/vue/components/` with shared classes in `src/capacitor/shared/`.

## Vue usage

Install the shell components you need:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-app.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-page.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-navbar.json
npx shadcn@latest add https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/capacitor-button.json
```

```vue
<script setup>
import TailwindCapacitorProvider from '@/capacitor/vue/shared/TailwindCapacitorProvider.vue'
import App from '@/capacitor/vue/components/App.vue'
import Page from '@/capacitor/vue/components/Page.vue'
import Navbar from '@/capacitor/vue/components/Navbar.vue'
import Button from '@/capacitor/vue/components/Button.vue'
</script>

<template>
  <TailwindCapacitorProvider>
    <App theme="ios" class="safe-areas">
      <Page>
        <Navbar title="Home" class="pt-safe" />
        <Button fill="solid">Continue</Button>
      </Page>
    </App>
  </TailwindCapacitorProvider>
</template>
```

You may add a local barrel (`src/capacitor/index.js`) after installing several components.

## Safe areas

- Put `safe-areas` on the root page shell.
- Use `pt-safe`, `pb-safe`, `px-safe`, and offset utilities such as `pt-4-safe`.
- Platform variants: `ios:`, `android:`, `capacitor:`, `mobile:`.

## Registry hosting

Built JSON files live in `public/r/` on GitHub. After `npm run build:registry`, serve them from raw GitHub or commit them to your site:

`https://raw.githubusercontent.com/Cap-go/tailwind-capacitor/refs/heads/main/public/r/<name>.json`

## More

- [Repository README](https://github.com/Cap-go/tailwind-capacitor/#readme)
- [Safe areas doc](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/safe-areas.md)
- [Platform variants doc](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/platform.md)
