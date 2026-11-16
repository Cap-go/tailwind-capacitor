<template>
  <component :is="component" :class="c.base">
    <span class="flex-1"><slot /></span>
    <chevron-icon :class="c.chevron" />
  </component>
</template>
<script>
  import { computed } from 'vue';
  import { useContext } from '../shared/use-context.js';
  import { AccordionItemClasses } from '../../shared/classes/AccordionItemClasses.js';
  import { AccordionItemColors } from '../../shared/colors/AccordionItemColors.js';
  import { themeClasses } from '../shared/use-theme-classes.js';
  import { darkClasses } from '../shared/use-dark-classes.js';
  import ChevronIcon from './icons/ChevronIcon.vue';

  export default {
    name: 'c-accordion-item',
    components: { ChevronIcon },
    props: {
      component: { type: String, default: 'button' },
      colors: { type: Object },
      ios: { type: Boolean, default: undefined },
      material: { type: Boolean, default: undefined },
    },
    setup(props, ctx) {
      const context = useContext();
      const useDarkClasses = darkClasses(context);
      const useThemeClasses = themeClasses(context);
      const colors = computed(() =>
        AccordionItemColors(props.colors || {}, useDarkClasses),
      );
      const c = useThemeClasses(props, () =>
        AccordionItemClasses(props, colors.value, { className: ctx.attrs.class }),
      );
      return { c };
    },
  };
</script>
