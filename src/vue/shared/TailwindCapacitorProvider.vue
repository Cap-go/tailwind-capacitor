<template>
  <slot />
</template>
<script>
  import { computed, provide } from 'vue';

  import { useAutoTheme } from './use-auto-theme.js';

  export default {
    name: 'tailwind-capacitor-provider',
    props: {
      theme: {
        type: String,
        default: 'material',
      },
      dark: {
        type: Boolean,
        default: true,
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

      const TailwindCapacitorContext = computed(() => ({
        theme: currentTheme.value,
        dark: props.dark,
        touchRipple: props.touchRipple,
      }));
      provide('TailwindCapacitorContext', TailwindCapacitorContext);

      return {
        currentTheme,
      };
    },
  };
</script>
