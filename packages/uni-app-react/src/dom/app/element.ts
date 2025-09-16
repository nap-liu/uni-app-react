import { nextTick } from 'vue'
import { runtimeCustomElements } from '../common'
import { camelize, capitalize, stringifyStyle } from '@vue/shared'

declare global {
  namespace UniShared {
    export var UniElement: any
    export var UniTextNode: any
    export var UniNode: any
  }
}

const { UniElement, UniTextNode, UniNode } = UniShared
const UniEventTarget = UniNode.prototype.__proto__.constructor

export function normalizeEventType(
  type: string,
  options?: AddEventListenerOptions
) {
  if (options) {
    if (options.capture) {
      type += 'Capture'
    }
    if (options.once) {
      type += 'Once'
    }
    if (options.passive) {
      type += 'Passive'
    }
  }
  return `on${capitalize(camelize(type))}`
}

export const patchUniApp = () => {
  const originAddEventListener = UniEventTarget.prototype.addEventListener
  // const originRemoveEventListener = UniEventTarget.prototype.removeEventListener

  UniEventTarget.prototype.addEventListener = function (
    type: string,
    listener: Function,
    options: any
  ) {
    // preact 和 uniapp 的type不兼容，preact是监听的type严格不能变，uniapp会携带[on] prefix
    function patchedEventListener(this: any, event: any) {
      // console.log('proxyListener', type, event, event.type)
      const originType = event.type
      event.type = type
      const result = listener.call(this, event)
      event.type = originType
      return result
    }

    patchedEventListener.originListener = listener

    return originAddEventListener.call(
      this,
      type,
      patchedEventListener,
      options
    )
  }

  // 这里简单粗暴 直接替换掉原始的实现，保证上面的patch代码能正常卸载事件
  UniEventTarget.prototype.removeEventListener = function (
    type: string,
    callback: any,
    options?: AddEventListenerOptions
  ) {
    // console.log('remove listener', type, callback, options)

    type = normalizeEventType(type, options)

    const listeners = this.listeners[type]
    if (!listeners) {
      return
    }

    const index = listeners.indexOf(
      (item: any) => item === callback || item.originListener === callback
    )

    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  // patch dispatchEvent  changedTouches & touches 竟然不是数组
  const originDispatchEvent = UniEventTarget.prototype.dispatchEvent
  UniEventTarget.prototype.dispatchEvent = function (event: any) {
    // console.log('dispatchEvent', event)
    if (event.changedTouches && !Array.isArray(event.changedTouches)) {
      event.changedTouches = Object.values(event.changedTouches)
    }
    if (event.touches && !Array.isArray(event.touches)) {
      event.touches = Object.values(event.touches)
    }

    return originDispatchEvent.call(this, event)
  }

  // patch 文本元素赋值字符串类型问题
  Object.defineProperty(UniTextNode.prototype, 'data', {
    configurable: true,
    get() {
      return this.textContent
    },
    set(value) {
      this.textContent = value + ''
    },
  })

  const patchStyle = (node: any) => {
    let isUpdating = false

    let style = new Proxy({} as any, {
      get(target, prop) {
        // console.log('css style get', prop, target[prop])
        return target[prop]
      },
      set(target, prop, value) {
        // console.log('css style set', prop, value)
        target[prop] = value

        if (!isUpdating) {
          isUpdating = true
          nextTick(() => {
            isUpdating = false
            const cssText = stringifyStyle(target)
            // console.log('setAttribute css style set', cssText)
            // 肮脏一点 直接调用内部api
            if (node.pageNode && !node.pageNode.isUnmounted) {
              node.pageNode.onSetAttribute(node, 'style', cssText)
            }
          })
        }
        return true
      },
    })

    Object.defineProperty(node, 'style', {
      configurable: true,
      set(value) {
        // console.log('set style', typeof value, value)
        style = value
      },
      get() {
        // console.log('get style', typeof style, style)
        return style
      },
    })
  }

  //  patch uniapp 支持自定义元素
  const CustomElementKey = Symbol.for('CustomElement')
  function UniCustomElement(tag: string, container: any) {
    // console.log('createElement', tag, container)
    const tagName = tag.toLowerCase()
    const CustomElement = runtimeCustomElements.get(tagName)

    let node
    if (CustomElement) {
      node = new CustomElement(tag, container)
      node[CustomElementKey] = true
    } else {
      node = new UniElement(tag, container)
    }

    patchStyle(node)

    return node
  }

  UniShared.UniElement = UniCustomElement as any

  const methods = ['insertBefore', 'appendChild', 'removeChild']

  methods.forEach((method) => {
    const originMethod = UniNode.prototype[method]
    UniNode.prototype[method] = function (...args: any[]) {
      const [node] = args
      // console.log(
      //   'method',
      //   method,
      //   node.nodeId,
      //   node.nodeName,
      //   'parent',
      //   node.parentNode && node.parentNode.nodeId,
      //   node.parentNode && node.parentNode.nodeName,
      //   node.constructor.name
      // )
      const result = originMethod.apply(this, args)
      const isCustomElement = node[CustomElementKey]

      if (isCustomElement) {
        // console.log(method, 'isCustomElement call lifecycle', node)
        nextTick(() => {
          switch (method) {
            case 'insertBefore':
            case 'appendChild':
              node.connectedCallback?.()
              break
            case 'removeChild':
              node.disconnectedCallback?.()
              break
          }
        })
      }
      return result
    }
  })
}

export { UniElement, UniEventTarget, UniNode, UniTextNode }
