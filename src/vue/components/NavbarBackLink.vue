<template>
  <c-link :component="component" :class="c.base" navbar>
    <span :class="c.icon">
      <c-back-icon :theme="theme" />
    </span>
    <span v-if="shouldShowText">{{ text }}</span>
    <slot />
  </c-link>
</template>
<script>
  import { computed } from 'vue';
  import { useContext } from '../shared/use-context.js';

  import { useTheme } from '../shared/use-theme.js';

  import { themeClasses } from '../shared/use-theme-classes.js';
  import cBackIcon from './icons/BackIcon.vue';
  import cLink from './Link.vue';

  import { NavbarBackLinkClasses } from '../../shared/classes/NavbarBackLinkClasses.js';

  export default {
    name: 'c-navbar-back-link',
    components: {
      cLink,
      cBackIcon,
    },
    props: {
      component: {
        type: String,
        default: 'a',
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
      text: {
        type: String,
        default: 'Back',
      },
      showText: {
        type: [Boolean, String],
        default: 'auto',
      },
    },
    setup(props) {
      const context = useContext();
      const useThemeClasses = themeClasses(context);
      const theme = useTheme(props, context);
      const shouldShowText = computed(
        () =>
          (props.showText === 'auto' && theme.value === 'ios') ||
          props.showText === true
      );
      const c = useThemeClasses(props, () => NavbarBackLinkClasses());
      return {
        c,
        shouldShowText,
        theme,
      };
    },
  };
</script>
