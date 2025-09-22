import {
  AppShadowDomElement,
  attachAppShadow,
  initialAppShadow,
  runtimeCustomElements,
} from '@js-css/uni-app-react'
import { getCurrentInstance, resolveComponent, shallowReactive } from 'vue'
import { ProxyComponentName } from './common'
import { defineCustomElement } from './VueElement'

export const useAppVueProxyElement = () => {
  if (runtimeCustomElements.get(ProxyComponentName)) {
    return
  }

  const rootVue = getCurrentInstance()!
  initialAppShadow()

  const VueProxyComponent = resolveComponent(ProxyComponentName) as {}
  const VueProxyElement = defineCustomElement(VueProxyComponent)

  runtimeCustomElements.define(
    ProxyComponentName,
    class extends VueProxyElement {
      $vm?: any
      $node?: any
      $name?: string
      $props?: Record<string, any>
      $rootVM = rootVue
      $instance?: any

      constructor(tag: string, container: any) {
        super(tag, container)
      }

      // @ts-ignore
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
        return attachAppShadow(this, init) as any
      }

      disconnectedCallback(): void {
        super.disconnectedCallback()
        ;(this.shadowRoot as any as AppShadowDomElement)?.detachElement()
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
