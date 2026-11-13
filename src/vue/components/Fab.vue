<template>
  <component
    :is="Component"
    ref="rippleElRef"
    :class="text || slots.text ? c.base.withText : c.base.iconOnly"
    role="button"
    tabindex="0"
    :href="resolvedHref"
  >
    <span
      v-if="(text || slots.text) && textPosition === 'before'"
      :class="c.text"
      >{{ text }}<slot name="text"
    /></span>
    <span v-if="slots.icon" :class="c.icon"><slot name="icon" /></span>
    <span
      v-if="(text || slots.text) && textPosition === 'after'"
      :class="c.text"
      >{{ text }}<slot name="text"
    /></span>
    <slot />
  </component>
</template>
<script>
  import { computed, ref } from 'vue';
  import { useContext } from '../shared/use-context.js';

  import { FabClasses } from '../../shared/classes/FabClasses.js';

  import { FabColors } from '../../shared/colors/FabColors.js';

  import { themeClasses } from '../shared/use-theme-classes.js';

  import { useTouchRipple } from '../shared/use-touch-ripple.js';

  import { darkClasses } from '../shared/use-dark-classes.js';

  export default {
    name: 'c-fab',
    props: {
      component: {
        type: String,
        default: 'button',
      },
      colors: {
        type: Object,
      },
      ios: {
        type: Boolean,
        default: undefined,
      },
      material: {
        type: Boolean,
        default: undefined,
      },
      href: { type: [String, Boolean], default: undefined },
      text: { type: String, default: undefined },
      textPosition: { type: String, default: 'after' },
      touchRipple: { type: Boolean, default: true },
    },
    setup(props, ctx) {
      const context = useContext();
      const useDarkClasses = darkClasses(context);
      const useThemeClasses = themeClasses(context);
      const rippleElRef = ref(null);
      useTouchRipple(rippleElRef, props, { context });

      const Component = computed(() => {
        if (props.href || props.href === '') return 'a';
        return props.component;
      });
      const resolvedHref = computed(() => {
        if (props.href || props.href === '') {
          return typeof props.href === 'string' ? props.href : '';
        }
        return undefined;
      });

      const colors = computed(() =>
        FabColors(props.colors || {}, useDarkClasses)
      );

      const c = useThemeClasses(props, () => FabClasses(props, colors.value));
      return {
        rippleElRef,
        slots: ctx.slots,
        c,
        Component,
        resolvedHref,
      };
    },
  };
</script>
