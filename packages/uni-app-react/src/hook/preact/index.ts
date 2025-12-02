// @ts-ignore
import { options } from 'preact'

// patch preact attr false value 属性移除导致的异常
const oldDiffedHook = options.diffed
options.diffed = function (newVNode: any) {
  // #ifdef MP
  // 小程序环境下 false 值是有效值，但是dom规范中 false attribute 不应该被保留
  // vue 的defineCustomElement中做了个 defineProperty 直接从dom属性上获取了原始值
  if (typeof newVNode.type === 'string') {
    const domProp = Object.keys(newVNode).find((k) => newVNode[k]?.setAttribute)
    const dom = domProp ? newVNode[domProp] : null
    const newVNodeProps = newVNode.props
    if (dom) {
      for (const propName in newVNodeProps) {
        const propValue = newVNodeProps[propName]
        if (propValue === false) {
          // 值为 false 的属性在 preact 的 diff 中被 removeAttribute 了，这里手动 setAttribute
          dom.setAttribute(propName, propValue)
        }
      }
    }
  }
  // #endif
  if (oldDiffedHook) oldDiffedHook(newVNode)
}

// patch preact event 全都转换成小写
const oldVNodeHook = options.vnode
options.vnode = (vnode: any) => {
  const { type, props } = vnode
  let normalizedProps = props

  // only normalize props on Element nodes
  if (typeof type === 'string') {
    normalizedProps = {}

    for (let i in props) {
      const value = props[i]

      if (/^on/.test(i)) {
        i = i.toLowerCase()
      }

      if (type === 'map' && i === 'onregionchange') {
        // map 组件的 regionchange 事件非常特殊，详情：https://github.com/NervJS/taro/issues/5766
        normalizedProps.onbegin = value
        normalizedProps.onend = value
        continue
      }

      normalizedProps[i] = value
    }

    vnode.props = normalizedProps
  }

  if (oldVNodeHook) oldVNodeHook(vnode)
}
