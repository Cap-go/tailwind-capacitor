<template>
  <div :class="wrapperClass">
    <slot />
  </div>
</template>
<script>
  import { computed, provide, toRef } from 'vue';

  import { useAutoTheme } from './use-auto-theme.js';
  import { useEffectiveDark } from './use-effective-dark.js';

  export default {
    name: 'tailwind-capacitor-provider',
    props: {
      theme: {
        type: String,
        default: 'material',
      },
      dark: {
        type: Boolean,
        default: undefined,
      },
      touchRipple: {
        type: Boolean,
        default: true,
      },
      autoThemeDetection: {
        type: Boolean,
        default: true,
      },
    },
    setup(props) {
      const currentTheme = useAutoTheme(props, props.autoThemeDetection);

      const effectiveDark = useEffectiveDark(toRef(props, 'dark'));

      const TailwindCapacitorContext = computed(() => ({
        theme: currentTheme.value,
        dark: effectiveDark.value,
        touchRipple: props.touchRipple,
      }));
      provide('TailwindCapacitorContext', TailwindCapacitorContext);

      const wrapperClass = computed(() =>
        effectiveDark.value ? 'dark min-h-full w-full' : 'min-h-full w-full'
      );

      return {
        currentTheme,
        wrapperClass,
      };
    },
  };
</script>
