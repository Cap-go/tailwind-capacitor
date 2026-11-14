<template>
  <c-segmented class="w-full" strong rounded v-bind="passProps">
    <slot />
  </c-segmented>
</template>
<script>
  import { computed } from 'vue';
  import cSegmented from './Segmented.vue';

  export default {
    name: 'c-tabs',
    components: { cSegmented },
    props: {
      ...cSegmented.props,
    },
    setup(props) {
      const passProps = computed(() => ({ ...props }));
      return { passProps };
    },
  };
</script>
