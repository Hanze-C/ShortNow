<template lang="pug">
h1 ShortURL Now

section
  h2 缩短 URL
  form
    label
      strong 原网址
      input.long-url(
        v-model='addUrlInputLong',
        type='url',
        :disabled='addLoading'
      )
    div
      button.btn.primary(@click='addUrl', :disabled='addLoading') 提交
  modal(v-model:show='addModal')
    .info(v-if='addInfo')
      h3 {{ addInfo.message }}
      input.result(
        readonly,
        :value='location.origin + "/-/" + addInfo.body.short_url',
        :style='{ width: "100%" }',
        @click='handleClickResult'
      )
      .desc 点击复制
    .error(v-if='addError')
      h3 短链接生成失败
      p {{ addError }}

section
  h2 最近生成
  p.loading(v-if='listLoading') 加载中……
  p.error(v-if='listError') {{ listError }}
  ul.allList(v-if='!listLoading')
    li(v-for='item in list')
      strong {{ item.long_url }}
      |
      code {{ item.short_url }}
      |
      a(:href='"/-/" + item.short_url', target='_blank') 访问
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
      location: window.location,
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
    handleClickResult(e) {
      const el = e.target
      el.select()
      document.execCommand('Copy')
    },
  },
  mounted() {
    this.getList()
  },
})
</script>

<style scoped lang="sass">
.error
  h3
    color: #b00

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

input.result
  padding: 4px
  font-size: 1rem
</style>
