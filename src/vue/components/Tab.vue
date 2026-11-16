<template>
  <c-segmented-button v-bind="$attrs" :active="active" strong rounded>
    <slot />
  </c-segmented-button>
</template>
<script>
  import cSegmentedButton from './SegmentedButton.vue';

  export default {
    name: 'c-tab',
    components: { cSegmentedButton },
    props: {
      active: { type: Boolean, default: false },
    },
  };
</script>
