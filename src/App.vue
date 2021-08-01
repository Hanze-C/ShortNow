<template lang="pug">
main
  article
    router-view

NProgress
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NProgress from './components/NProgress.vue'

export default defineComponent({
  name: 'App',
  components: { NProgress },
  data() {
    return {}
  },
  methods: {},
  mounted() {},
})
</script>

<style scoped lang="sass">
main
  // padding: 50px 0 60px 0
  min-height: 100vh
  position: relative

  article
    padding: 1rem
    background-color: rgba(0, 0, 0, 0.02)
    z-index: 1
</style>
