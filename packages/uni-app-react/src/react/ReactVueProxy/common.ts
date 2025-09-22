import {
  MPDocument,
  MPVueProxyHTMLElement,
  runtimeDocument,
} from '@js-css/uni-app-react'
import { getCurrentInstance, shallowRef } from 'vue'

export type VNode = {
  t: string
  p?: any
}

export const ProxyComponentName = 'vue-proxy'

export const useVueProxy = () => {
  const node = shallowRef<VNode | null>(null)
  const instance = getCurrentInstance()
  let element: MPVueProxyHTMLElement

  // #ifdef MP
  // @ts-ignore
  const mpInstance = instance.ctx.$scope

  let sid: string

  // #ifdef MP-WEIXIN
  sid = mpInstance?.dataset.sid
  // #endif

  // #ifdef MP-ALIPAY
  sid = mpInstance?.props['data-sid']
  // #endif

  element = (runtimeDocument as any as MPDocument).getElementBySid(
    sid
  )! as any as MPVueProxyHTMLElement

  if (element) {
    element.$vm = instance
    element.$node = node
    element.doSyncProps()
  }
  // #endif

  // #ifdef H5 || APP
  // @ts-ignore
  instance!.$node = node
  // #endif

  // #ifdef APP

  // #endif
  return node
}
