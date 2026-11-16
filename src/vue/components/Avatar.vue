<template>
  <component :is="component" :class="c.base">
    <slot />
  </component>
</template>
<script>
  import { computed } from 'vue';
  import { useContext } from '../shared/use-context.js';
  import { AvatarClasses } from '../../shared/classes/AvatarClasses.js';
  import { AvatarColors } from '../../shared/colors/AvatarColors.js';
  import { themeClasses } from '../shared/use-theme-classes.js';
  import { darkClasses } from '../shared/use-dark-classes.js';

  export default {
    name: 'c-avatar',
    props: {
      component: {
        type: String,
        default: 'span',
      },
      colors: { type: Object },
      ios: { type: Boolean, default: undefined },
      material: { type: Boolean, default: undefined },
    },
    setup(props, ctx) {
      const context = useContext();
      const useDarkClasses = darkClasses(context);
      const useThemeClasses = themeClasses(context);
      const colors = computed(() =>
        AvatarColors(props.colors || {}, useDarkClasses),
      );
      const c = useThemeClasses(props, () =>
        AvatarClasses(props, colors.value, { className: ctx.attrs.class }),
      );
      return { c };
    },
  };
</script>
