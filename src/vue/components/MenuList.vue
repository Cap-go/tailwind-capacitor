<template>
  <c-list v-bind="listProps">
    <slot />
  </c-list>
</template>
<script>
  import { computed } from 'vue';
  import cList from './List.vue';

  export default {
    name: 'c-menu-list',
    components: {
      cList,
    },
    props: {
      ...cList.props,
    },
    setup(props) {
      const listProps = computed(() => ({
        ...props,
        menuList: true,
      }));
      return { listProps };
    },
  };
</script>
