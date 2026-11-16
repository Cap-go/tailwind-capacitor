<template>
  <c-list strong inset class="!my-0">
    <c-list-input type="select" :label="label">
      <slot />
    </c-list-input>
  </c-list>
</template>
<script>
  import cList from './List.vue';
  import cListInput from './ListInput.vue';

  export default {
    name: 'c-select',
    components: { cList, cListInput },
    props: {
      label: { type: String, default: 'Select' },
    },
  };
</script>
