import {
  MPHTMLElement,
  runtimeCustomElements
} from '@js-css/uni-app-react'
import { shallowReactive } from 'vue'
import { ProxyComponentName } from './common'

export class MPVueProxyHTMLElement extends MPHTMLElement {
  $vm?: any
  $node?: any
  $name?: string
  $props?: Record<string, any>
  $rootVue?: any

  isPending = false
  enqueueAttrUpdate(name: string, value: any): void {
    // super.enqueueAttrUpdate(name, value)
    if (this.isPending) {
      return
    }
    this.isPending = true
    setTimeout(() => {
      this.isPending = false
      this.doSyncProps()
    })
  }

  doSyncProps() {
    if (!this.$node) {
      return
    }
    if (!this.$node.value) {
      this.$node.value = shallowReactive({
        t: this.$name!,
        p: this.$props,
      })
    } else {
      this.$node.value.t = this.$name!
      this.$node.value.p = this.$props
    }
  }
}

runtimeCustomElements.define(ProxyComponentName, MPVueProxyHTMLElement)
