<template lang="pug">
error-page(:title="title" :description="description")
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ErrorPage from '../components/ErrorPage.vue'

export default defineComponent({
  components: { ErrorPage },
  data() {
    return {
      title: '',
      description: '',
    }
  },
  methods: {},
  mounted() {
    const query = this.$route.query
    console.log(query)
    switch (query.controller) {
      case 'jump.invalid_short_url':
        this.title = '跳转失败'
        this.description = `短链接失效：${query.short_url}`
        break

      default:
        this.title = '未知错误'
        this.description = '糟糕，看来发生了一些错误'
    }
  },
})
</script>

<style scoped lang="sass"></style>
