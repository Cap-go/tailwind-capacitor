<template>
  <div v-if="backdrop" :class="c.backdrop[state]" @click="onBackdropClick" />
  <component
    :is="component"
    ref="dialogRef"
    :class="c.base[state]"
    role="dialog"
    :aria-modal="opened ? 'true' : undefined"
    tabindex="-1"
  >
    <div :class="c.contentWrap">
      <div v-if="slots.title" :class="c.title"><slot name="title" /></div>
      <div v-if="slots.default" :class="c.content">
        <slot />
      </div>
    </div>
    <div v-if="slots.buttons" :class="c.buttons"><slot name="buttons" /></div>
  </component>
</template>
<script>
  import { computed, ref, watch, nextTick } from 'vue';
  import { useContext } from '../shared/use-context.js';

  import { DialogClasses } from '../../shared/classes/DialogClasses.js';

  import { DialogColors } from '../../shared/colors/DialogColors.js';

  import { darkClasses } from '../shared/use-dark-classes.js';

  import { themeClasses } from '../shared/use-theme-classes.js';

  export default {
    name: 'c-dialog',
    props: {
      component: {
        type: String,
        default: 'div',
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
      translucent: {
        type: Boolean,
        default: true,
      },
      titleFontSizeIos: { type: String, default: 'text-[18px]' },
      titleFontSizeMaterial: { type: String, default: 'text-[24px]' },
      sizeIos: { type: String, default: 'w-[16.875rem]' },
      sizeMaterial: { type: String, default: 'w-[19.5rem]' },
      opened: Boolean,
      backdrop: { type: Boolean, default: true },
    },
    emits: ['backdropclick'],
    setup(props, ctx) {
      const context = useContext();
      const useDarkClasses = darkClasses(context);
      const useThemeClasses = themeClasses(context);
      const state = computed(() => (props.opened ? 'opened' : 'closed'));
      const colors = computed(() =>
        DialogColors(props.colors || {}, useDarkClasses)
      );
      const c = useThemeClasses(props, () =>
        DialogClasses(props, colors.value, ctx.attrs.class, {
          hasButtons: ctx.slots.buttons,
        })
      );

      const dialogRef = ref(null);

      const onBackdropClick = (e) => {
        ctx.emit('backdropclick', e);
      };

      watch(
        () => props.opened,
        (opened) => {
          if (!opened) return;
          nextTick(() => {
            const el = dialogRef.value;
            if (el && typeof el.focus === 'function') el.focus();
          });
        },
      );

      return {
        onBackdropClick,
        c,
        state,
        slots: ctx.slots,
        dialogRef,
        opened: computed(() => props.opened),
      };
    },
  };
</script>
