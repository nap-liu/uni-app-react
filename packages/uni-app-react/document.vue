<template>
  <!-- #ifdef APP -->
  <view ref="react" mp />
  <!-- #endif -->
  <!-- #ifdef H5 -->
  <div ref="react" mp></div>
  <!-- #endif -->
</template>
<script lang="tsx" setup>
import { getCurrentInstance, onMounted, ref } from 'vue'
// @ts-ignore
import { ReactElement, render } from 'react'

const react = ref<HTMLDivElement>()

const $emit = defineEmits<{
  (event: 'mounted', instance: any): void
}>()

const instance = getCurrentInstance()

// console.log('vue document', instance)

// @ts-ignore;
const proxy = instance.ctx

onMounted(() => {
  proxy.react = {
    render(element: ReactElement) {
      return render(element, react.value)
    },
  }

  proxy.rootElement = react.value

  $emit('mounted', { detail: proxy })
})

defineExpose(proxy)
</script>
<style>
:global(vue-proxy),
:global(mp-slot),
:global(app-slot),
:global([mp]) {
  display: contents;
}

/* #ifdef APP  */
:global(app-shadow-dom),
:global(app-fragment) {
  display: none;
}
/* #endif */
</style>
