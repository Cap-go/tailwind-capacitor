<template>
  <c-list strong inset class="!my-0">
    <c-list-input type="textarea" :label="label" :placeholder="placeholder" />
  </c-list>
</template>
<script>
  import cList from './List.vue';
  import cListInput from './ListInput.vue';

  export default {
    name: 'c-textarea',
    components: { cList, cListInput },
    props: {
      label: { type: String, default: 'Notes' },
      placeholder: { type: String, default: '' },
    },
  };
</script>
