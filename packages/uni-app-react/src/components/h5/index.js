import * as UniComponents from '@dcloudio/uni-h5'
import { defineCustomElement, h } from 'vue'
import * as Components from './components'
export * from './components'
import { runtimeCustomElements } from '../../dom'
import { attachMPShadow } from '../../react'

// console.log('Components', Components)
// console.log('UniComponents', UniComponents)

Object.keys(Components).forEach((key) => {
  const UniComponent = UniComponents[key]
  const componentName = Components[key] || ''
  if (UniComponent && /^mp/.test(componentName)) {
    // console.log('define custom element', componentName, UniComponent)
    runtimeCustomElements.define(
      componentName,
      class extends defineCustomElement(UniComponent) {
        $instance
        set _instance(instance) {
          this.$instance = instance
          if (instance) {
            // TODO dynamic register slots
            Object.defineProperty(instance, 'slots', {
              configurable: true,
              set(slots) {
                // console.log('slots set', slots)
              },
              get() {
                return {
                  default: () => [h('slot')],
                }
              },
            })
          }
        }
        get _instance() {
          return this.$instance
        }

        _setAttr(key) {
          if (key === 'mp') {
            // console.log('skip mp attr', this)
            return
          }
          super._setAttr(key)
        }

        attachShadow(init) {
          attachMPShadow(this, init)
        }

        attachParentVM() {
          let node = this.parentElement

          const instance = this._instance
          if (!instance) {
            // console.log('instance not found', this)
            return
          }
          while (node) {
            if (node.$rootVM) {
              instance.parent = node.$rootVM
              instance.appContext = node.$rootVM.appContext
              instance.root = node.$rootVM.root
              // console.log('found root node.$rootVM', this, node.$rootVM)
              return
            } else if (node.__vueParentComponent?.appContext?.app) {
              const $rootVM = node.__vueParentComponent
              // console.log('parent vm', $rootVM.appContext)
              // instance.parent = $rootVM
              if (!instance.parent) {
                instance.parent = $rootVM
                // console.log('edge case reset parent', this, $rootVM)
              }
              instance.appContext = $rootVM.appContext
              instance.root = $rootVM.root
              // console.log('found root __vueParentComponent', this, $rootVM)
              return
            }
            node = node.parentElement
          }
          // console.log('not found root', this)
        }

        connectedCallback() {
          // console.log('element connectedCallback', this)
          super.connectedCallback()
          this.attachParentVM()
          super.setAttribute('mp', '')
        }
        disconnectedCallback() {
          // console.log('element disconnected', this)
          super.disconnectedCallback()
          // this.shadowRoot?.detachElement()
        }
      }
    )
  }
})
