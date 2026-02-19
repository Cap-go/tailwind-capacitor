<template>
  <c-toolbar v-bind="toolbarProps">
    <slot />
  </c-toolbar>
</template>
<script>
  import { computed } from 'vue';
  import cToolbar from './Toolbar.vue';

  export default {
    name: 'c-tabbar',
    components: {
      cToolbar,
    },
    props: {
      ...cToolbar.props,
      labels: {
        type: Boolean,
      },
      icons: {
        type: Boolean,
      },
    },
    setup(props) {
      const toolbarProps = computed(() => {
        return {
          ...props,
          tabbar: true,
          tabbarLabels: props.labels,
          tabbarIcons: props.icons,
        };
      });
      return {
        toolbarProps,
      };
    },
  };
</script>
