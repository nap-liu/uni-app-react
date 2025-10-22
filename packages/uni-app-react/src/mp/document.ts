import { MPCustomEvent, runtimeDocument } from '@js-css/uni-app-react'
// @ts-ignore
import { render } from 'react'
import { eventHandler } from './common'

declare global {
  // 内置方法（可按需扩展）
  interface MiniProgramComponentBuiltins {
    setData(data: Record<string, any>): void
    triggerEvent(name: string, detail?: any): void
    [key: string]: any
  }

  // data 可以是对象或函数
  type DataDef<D> = D extends () => infer R ? R : D

  // 最终 this 类型：data + methods + 内置
  type ComponentThis<D, M> = DataDef<D> & M & MiniProgramComponentBuiltins

  // 组件配置
  type ComponentOptions<D, M> = {
    data?: D | (() => D)
    methods?: M
    options?: Record<string, any>
    [key: string]: any
  } & ThisType<ComponentThis<D, M>> // 关键：作用于整个对象，而不是 methods 属性

  // Component 函数
  function Component<D, M>(options: ComponentOptions<D, M>): void
}

let attached
let detached
let data = 'data'
// #ifdef MP-ALIPAY
attached = 'didMount'
detached = 'didUnmount'
// #endif
// #ifdef MP-WEIXIN
attached = 'attached'
detached = 'detached'
// #endif

export default Component({
  options: {
    multipleSlots: true,
    virtualHost: true,
  },
  // #ifdef MP-ALIPAY
  props: {
    onMounted: Function,
  },
  // #endif
  [data]: {
    root: null,
  },
  [attached]: function () {
    this.createRoot()
  },
  [detached]: function () {
    this.destroy()
  },

  methods: {
    createRoot() {
      const rootElement = runtimeDocument.createElement('root')
      // rootElement.id = 'react'
      runtimeDocument.body.appendChild(rootElement)
      this.rootElement = rootElement
      rootElement.addEventListener('update:patch', this.update.bind(this))
      // this.reactRoot = createRoot(rootElement, {
      //   createElement: document.createElement.bind(document),
      //   createTextNode: document.createTextNode.bind(document),
      //   didUpdated: (root) => {
      //     // console.log('react update', root)
      //     console.log('react', debugFiberAsJSX(root.current!))
      //   },
      // })
      const react = {
        render(element: any) {
          return render(element, rootElement)
        },
      }

      this.react = react
      // console.log('mounted', this)
      // #ifdef MP-WEIXIN
      this.triggerEvent('mounted', this)
      // #endif
      // #ifdef MP-ALIPAY
      this.props.onMounted(new MPCustomEvent('mounted', { detail: this }))
      // #endif
    },
    eh: eventHandler,
    update(event: any) {
      console.log('update', event, this)
      this.setData(event.detail)
    },
    destroy() {
      this.react.render(null)
      runtimeDocument.body.removeChild(this.rootElement)
      this.react = null
      this.rootElement = null
    },
  },
})
