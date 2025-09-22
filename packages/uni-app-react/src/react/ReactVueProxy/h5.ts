import {
  attachMPShadow,
  initialMPShadow,
  MPShadowDomElement,
  runtimeCustomElements,
} from '@js-css/uni-app-react'
import {
  defineCustomElement,
  getCurrentInstance,
  resolveComponent,
  shallowReactive,
} from 'vue'
import { ProxyComponentName } from './common'

export const useH5VueProxyElement = () => {
  if (runtimeCustomElements.get(ProxyComponentName)) {
    return
  }

  const rootVue = getCurrentInstance()!
  initialMPShadow()
  const VueProxyComponent = resolveComponent(ProxyComponentName) as {}

  const VueProxyElement = defineCustomElement(VueProxyComponent)

  runtimeCustomElements.define(
    ProxyComponentName,
    class extends VueProxyElement {
      _MPShadowDom: MPShadowDomElement | null = null
      $node: any
      $name: any
      $props: any
      $rootVM = rootVue
      $instance: any

      get _instance() {
        return this.$instance
      }

      set _instance(instance) {
        if (instance) {
          instance.parent = this.$rootVM
          instance.appContext = this.$rootVM.appContext
          instance.root = this.$rootVM.root
          // initial sync props
          this.doSyncProps()
        }
        // console.log('set BrowserVueProxyElement instance', instance)
        this.$instance = instance
      }

      attachShadow(init: ShadowRootInit): ShadowRoot {
        this._MPShadowDom = attachMPShadow(this, init)
        return this._MPShadowDom as any as ShadowRoot
      }

      doSyncProps() {
        if (!this.$instance) {
          // console.log(
          //   'element not ready: schedule to next tick',
          //   this,
          //   this.$name,
          //   this.$props
          // )
          Promise.resolve().then(() => {
            this.doSyncProps()
          })
          return
        }
        const $node = this.$instance?.$node
        // console.log(
        //   'sync BrowserVueProxyElement props',
        //   this,
        //   this.$name,
        //   this.$props,
        //   this.$instance,
        //   $node
        // )
        if (!$node) {
          return
        }
        if (!$node.value) {
          $node.value = shallowReactive({
            t: this.$name!,
            p: this.$props,
          })
        } else {
          $node.value.t = this.$name!
          $node.value.p = this.$props
        }
      }
    }
  )
}
