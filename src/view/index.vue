<template lang="pug">
h1 ShortURL Now

section
  h2 查看全部
  p.loading(v-if="listLoading") 加载中……
  p.error(v-if="listError") {{ listError }}
  ul.allList(v-if="!listLoading")
    li(v-for="item in list")
      strong {{ item.long_url }}
      | 
      code {{ item.short_url }}
      | 
      a(:href="'/-/' + item.short_url" target="_blank") 访问

section
  h2 缩短 URL
  form
    label
      strong 原网址
      input(v-model="addUrlInputLong" type="url" :disabled="addLoading")
    div
      button.btn.primary(@click="addUrl" :disabled="addLoading") 提交
  modal(v-model:show="addModal")
    pre.info(v-if="addInfo") {{ addInfo }}
    .error(v-if="addError") {{ addError }}
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent } from 'vue'

import Modal from '../components/Modal.vue'

export default defineComponent({
  components: { Modal },
  data() {
    return {
      list: [],
      addUrlInputLong: '',
      listLoading: false,
      listError: '',
      addLoading: false,
      addError: '',
      addModal: false,
      addInfo: '',
    }
  },
  methods: {
    getList(offset = 0, limit = 10) {
      this.list = []
      this.listLoading = true
      this.listError = ''

      axios
        .get('/api', {
          params: {
            mode: 'list_all',
            offset,
            limit,
          },
        })
        .then(
          ({ data }) => {
            this.list = data.body
          },
          (err) => {
            console.error('getList', err)
            this.listError = err?.response?.data?.message || err.message
          }
        )
        .finally(() => {
          this.listLoading = false
        })
    },
    addUrl(e: any) {
      e.preventDefault()
      if (!/^https?:\/\/.+/.test(this.addUrlInputLong)) {
        this.addModal = true
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
            this.addInfo = JSON.stringify(data, null, 2)
            this.getList()
          },
          (err) => {
            console.error('addUrl', err)
            this.addError = err?.response?.data?.message || err.message
          }
        )
        .finally(() => {
          this.addModal = true
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

ul.allList
  padding: 0

  > li
    display: flex
    gap: 1rem

    > strong
      flex: 1


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

    &:invalid
      --placeholder: 0
</style>
