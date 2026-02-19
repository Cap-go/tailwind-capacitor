<template>
  <component :is="component" :class="c.base">
    <slot v-if="theme === 'ios'" name="ios" />
    <slot v-else name="material" />
    <slot />
    <c-badge
      v-if="(typeof badge !== 'undefined' && badge !== null) || slots.badge"
      small
      :class="c.badge"
      :colors="badgeColors || {}"
      >{{ badge }}<slot name="badge" />
    </c-badge>
  </component>
</template>
<script>
  import { useContext } from '../shared/use-context.js';
  import { useTheme } from '../shared/use-theme.js';

  import { themeClasses } from '../shared/use-theme-classes.js';
  import cBadge from './Badge.vue';

  import { IconClasses } from '../../shared/classes/IconClasses.js';

  export default {
    name: 'c-icon',
    components: {
      cBadge,
    },
    props: {
      component: {
        type: String,
        default: 'i',
      },
      badge: [String, Number],
      badgeColors: Object,
    },
    setup(props, ctx) {
      const context = useContext();
      const useThemeClasses = themeClasses(context);
      const theme = useTheme({}, context);

      const c = useThemeClasses(props, () =>
        IconClasses(props, ctx.attrs.class)
      );
      return {
        theme,
        c,
        slots: ctx.slots,
      };
    },
  };
</script>
