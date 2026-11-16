<template>
  <div class="demo-capture-root min-h-screen w-full text-slate-900 dark:text-white">
    <div
      v-if="isOverlayScene"
      aria-hidden="true"
      class="capture-page-bg fixed inset-0 z-0 bg-gradient-to-br from-sky-300 via-violet-200 to-emerald-200 dark:from-zinc-950 dark:via-indigo-950 dark:to-zinc-900"
    >
      <div class="p-8 pt-14 max-w-2xl">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          Demo page behind overlay
        </h1>
        <p class="mt-2 text-slate-700 dark:text-slate-300">
          Color blocks stay visible through the backdrop dim.
        </p>
        <div class="mt-6 grid grid-cols-4 gap-2">
          <div
            v-for="n in 16"
            :key="n"
            class="h-12 rounded-lg border border-black/10"
            :class="
              n % 4 === 0
                ? 'bg-rose-500'
                : n % 4 === 1
                  ? 'bg-cyan-500'
                  : n % 4 === 2
                    ? 'bg-amber-400'
                    : 'bg-indigo-500'
            "
          />
        </div>
      </div>
    </div>

    <div
      id="capture-root"
      class="relative z-20 min-h-screen w-full"
      :class="
        isOverlayScene
          ? 'bg-transparent'
          : 'flex flex-col items-center justify-center px-6 py-12'
      "
      :style="
        isOverlayScene
          ? undefined
          : { backgroundColor: darkMode ? '#09090b' : '#f5f5f5' }
      "
    >
      <Sheet
        v-if="scene === 'sheet'"
        :opened="true"
        :ios="platformTheme === 'ios'"
        :material="platformTheme === 'material'"
      >
        <div class="p-6 text-center bg-white dark:bg-zinc-900">Sheet content</div>
      </Sheet>

      <Actions
        v-else-if="scene === 'actions'"
        :opened="true"
        :ios="platformTheme === 'ios'"
        :material="platformTheme === 'material'"
      >
        <ActionsGroup>
          <ActionsButton>Primary</ActionsButton>
        </ActionsGroup>
      </Actions>

      <Dialog
        v-else-if="scene === 'dialog'"
        :opened="true"
        :ios="platformTheme === 'ios'"
        :material="platformTheme === 'material'"
      >
        <template #title>Dialog title</template>
        Dialog body text for backdrop capture.
      </Dialog>

      <Popover
        v-else-if="scene === 'popover'"
        :opened="true"
        :ios="platformTheme === 'ios'"
        :material="platformTheme === 'material'"
      >
        Popover surface
      </Popover>

      <Popup
        v-else-if="scene === 'popup'"
        :opened="true"
        :ios="platformTheme === 'ios'"
        :material="platformTheme === 'material'"
        size="w-[min(20rem,92vw)]"
      >
        <div
          class="p-6 text-center bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl shadow-lg min-h-32"
        >
          Popup surface
        </div>
      </Popup>

      <Panel
        v-else-if="scene === 'panel'"
        :opened="true"
        :ios="platformTheme === 'ios'"
        :material="platformTheme === 'material'"
      >
        Panel surface
      </Panel>

      <Button
        v-else-if="scene === 'button-outline'"
        id="capture-outline"
        :ios="platformTheme === 'ios'"
        :material="platformTheme === 'material'"
        outline
        class="w-56 text-base h-11"
      >
        Outline
      </Button>

      <Button
        v-else-if="scene === 'button-clear'"
        id="capture-clear"
        :ios="platformTheme === 'ios'"
        :material="platformTheme === 'material'"
        clear
        class="w-56 text-base h-11"
      >
        Clear
      </Button>

      <Button
        v-else-if="scene === 'button-tonal'"
        id="capture-tonal"
        :ios="platformTheme === 'ios'"
        :material="platformTheme === 'material'"
        tonal
        class="w-56 text-base h-11"
      >
        Tonal
      </Button>

      <Button
        v-else-if="scene === 'button-tonal-custom'"
        id="capture-tonal-custom"
        :ios="platformTheme === 'ios'"
        :material="platformTheme === 'material'"
        tonal
        class="w-56 text-base h-11"
        :colors="tonalCustom"
      >
        Tonal custom
      </Button>

      <div
        v-else-if="scene === 'progressbar-material'"
        id="capture-progressbar"
        class="w-full max-w-md px-6"
      >
        <Progressbar
          :ios="platformTheme === 'ios'"
          :material="platformTheme === 'material'"
          :progress="0.45"
        />
      </div>

      <div v-else-if="scene === 'range'" id="capture-range" class="w-full max-w-md">
        <Range
          :ios="platformTheme === 'ios'"
          :material="platformTheme === 'material'"
          :value="50"
          :min="0"
          :max="100"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import {
  Sheet,
  Actions,
  ActionsGroup,
  ActionsButton,
  Dialog,
  Popover,
  Popup,
  Panel,
  Button,
  Progressbar,
  Range,
} from '@/capacitor/index.js'

const props = defineProps({
  scene: { type: String, required: true },
  platformTheme: { type: String, required: true },
  darkMode: { type: Boolean, required: true },
})

const OVERLAY_SCENES = new Set([
  'sheet',
  'actions',
  'dialog',
  'popover',
  'popup',
  'panel',
])

const isOverlayScene = computed(() => OVERLAY_SCENES.has(props.scene))

const tonalCustom = {
  tonalBgIos: 'bg-lime-500',
  tonalActiveBgIos: 'active:bg-lime-700',
  tonalTextIos: 'text-lime-950',
  tonalBgMaterial: 'bg-lime-500',
  tonalActiveBgMaterial: 'active:bg-lime-700',
  tonalTextMaterial: 'text-lime-950',
}

function applyDocumentTheme() {
  const el = document.documentElement
  el.classList.remove('ios', 'md', 'material', 'dark', 'light')
  if (props.platformTheme === 'ios') {
    el.classList.add('ios')
  } else {
    el.classList.add('md', 'material')
  }
  if (props.darkMode) {
    el.classList.add('dark')
  } else {
    el.classList.add('light')
  }
  el.style.colorScheme = props.darkMode ? 'dark' : 'light'
}

watch(
  () => [props.platformTheme, props.darkMode],
  applyDocumentTheme,
  { immediate: true }
)
onMounted(applyDocumentTheme)
</script>