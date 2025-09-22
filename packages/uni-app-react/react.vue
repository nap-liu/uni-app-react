<template>
  <document @mounted="handleDocumentMounted" />
</template>
<script lang="tsx" setup>
import {
  DocumentComponentInstance,
  Render,
  RootElement,
  useDispatchLifeCycle,
  vueRenderContext,
} from '@js-css/uni-app-react'
import { createRef } from 'react'
import { getCurrentInstance, provide, shallowRef } from 'vue'

// #ifdef H5 || APP
import document from '@js-css/uni-app-react/document.vue'
// #endif

// #ifdef H5
import { useH5VueProxyElement } from '@js-css/uni-app-react'
// #endif

// #ifdef APP
import { useAppVueProxyElement } from '@js-css/uni-app-react'
// #endif

const $emit = defineEmits<{
  (e: 'mounted', render: Render): void
}>()

useDispatchLifeCycle()

const $vm = getCurrentInstance()
const documentInstanceRef = shallowRef<DocumentComponentInstance | null>(null)
const renderInstanceRef = shallowRef<Render | null>(null)
const handleDocumentMounted = (event: any) => {
  documentInstanceRef.value = event.detail as DocumentComponentInstance
  const rootRef = createRef<Render>()
  documentInstanceRef.value.react.render(
    <RootElement ref={rootRef} $vm={$vm} $documentInstance={event.detail} />
  )
  renderInstanceRef.value = rootRef.current
  $emit('mounted', rootRef.current!)
}

// #ifdef H5
useH5VueProxyElement()
// #endif

// #ifdef APP
useAppVueProxyElement()
// #endif

provide(vueRenderContext, renderInstanceRef)

defineExpose({
  document: documentInstanceRef,
  render: renderInstanceRef,
})
</script>
