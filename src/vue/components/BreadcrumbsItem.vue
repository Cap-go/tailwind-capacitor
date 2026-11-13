<template>
  <component
    :is="Component"
    :class="c.base"
    :href="resolvedHref"
    :aria-current="active ? 'page' : undefined"
    :role="linkRole"
    tabindex="0"
  >
    <slot />
  </component>
</template>
<script>
  import { computed } from 'vue';
  import { useContext } from '../shared/use-context.js';

  import { BreadcrumbsItemClasses } from '../../shared/classes/BreadcrumbsItemClasses.js';

  import { BreadcrumbsItemColors } from '../../shared/colors/BreadcrumbsItemColors.js';

  import { themeClasses } from '../shared/use-theme-classes.js';

  import { darkClasses } from '../shared/use-dark-classes.js';

  export default {
    name: 'c-breadcrumbs-item',
    props: {
      component: {
        type: String,
        default: 'span',
      },
      ios: {
        type: Boolean,
        default: undefined,
      },
      material: {
        type: Boolean,
        default: undefined,
      },
      colors: {
        type: Object,
      },
      active: {
        type: Boolean,
        default: false,
      },
      href: {
        type: [String, Boolean],
        default: undefined,
      },
    },
    setup(props) {
      const context = useContext();
      const useDarkClasses = darkClasses(context);
      const useThemeClasses = themeClasses(context);
      const colors = computed(() =>
        BreadcrumbsItemColors(props.colors, useDarkClasses)
      );
      const c = useThemeClasses(props, () =>
        BreadcrumbsItemClasses(props, colors.value)
      );
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
      const linkRole = computed(() =>
        props.href || props.href === '' ? undefined : 'menuitem'
      );
      return {
        c,
        Component,
        resolvedHref,
        linkRole,
        active: computed(() => props.active),
      };
    },
  };
</script>
