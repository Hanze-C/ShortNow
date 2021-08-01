<template lang="pug">
h1 ShortURL Now

section
  h2 查看全部
  p.loading(v-if="listLoading") 加载中……
  ul(v-if="!listLoading")
    li(v-for="item in list")
      span 123

section
  h2 缩短 URL
  form
    label
      strong 原网址
      input(v-model="addUrlInputLong" :disabled="addLoading")
    div
      button.btn.primary(@click="addUrl" :disabled="addLoading") 提交
  pre {{ addInfo }}
  div.error(v-if="addError") {{ addError }}
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {},
  data() {
    return {
      list: [],
      addUrlInputLong: '',
      listLoading: false,
      addLoading: false,
      addError: '',
      addInfo: '',
    }
  },
  methods: {
    getList(offset = 0, limit = 10) {
      this.list = []
      this.listLoading = true

      axios
        .get('/api', {
          params: {
            offset,
            limit,
          },
        })
        .then(({ data }) => {
          this.list = data.body
        })
    },
    addUrl(e: any) {
      e.preventDefault()
      if (!/^https?:\/\/.+/.test(this.addUrlInputLong)) {
        this.addError = 'URL 格式有误！'
        return
      }

      this.addLoading = true
      this.addError = ''
      this.addInfo = ''

      axios
        .post('/api', {
          long_url: this.addUrlInputLong,
        })
        .then(
          ({ data }) => {
            this.addUrlInputLong = ''
            this.addInfo = JSON.stringify(data)
            this.getList()
          },
          (err) => {
            console.error('addUrl', err)
            this.addError = err?.response?.data?.message || err.message
          }
        )
        .finally(() => {
          this.addLoading = false
        })
    },
  },
  mounted() {
    this.getList()
  },
})
</script>

<style scoped lang="sass">
.error
  color: #b00
  background-color: #fdd
  padding: 4px
  font-weight: 600

form
  text-align: center

  > div
    margin: 1rem 0

  label
    display: block
  input
    display: block
    margin: 0 auto
    padding: 4px
    width: 300px
</style>
