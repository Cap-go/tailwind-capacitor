<template>
  <component :is="component" :class="classes">
    <slot />
  </component>
</template>
<script>
  import { computed } from 'vue';
  import { useContext } from '../shared/use-context.js';
  import { InputOtpClasses } from '../../shared/classes/InputOtpClasses.js';
  import { InputOtpColors } from '../../shared/colors/InputOtpColors.js';
  import { themeClasses } from '../shared/use-theme-classes.js';
  import { darkClasses } from '../shared/use-dark-classes.js';

  export default {
    name: 'c-input-otp',
    props: {
      component: {
        type: String,
        default: 'div',
      },
      colors: { type: Object },
      ios: { type: Boolean, default: undefined },
      material: { type: Boolean, default: undefined },
    },
    setup(props, ctx) {
      const context = useContext();
      const useDarkClasses = darkClasses(context);
      const useThemeClasses = themeClasses(context);
      const colors = computed(() => InputOtpColors(props.colors || {}, useDarkClasses));
      const c = useThemeClasses(props, () =>
        InputOtpClasses(props, colors.value, { className: ctx.attrs.class }),
      );
      const classes = computed(() => c.value.base);
      return { classes };
    },
  };
</script>
