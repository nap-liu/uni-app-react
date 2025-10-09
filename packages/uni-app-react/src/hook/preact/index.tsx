// @ts-ignore
import { options } from 'preact'

// patch preact attr false value 属性移除导致的异常
// TODO 需要更加全面的测试，app和h5端上是否需要根据是否是内置的元素来动态的处理是否需要这个false属性的透传
const oldDiffedHook = options.diffed
options.diffed = function (newVNode: any) {
  const domProp = Object.keys(newVNode).find((k) => newVNode[k]?.setAttribute)
  const dom = domProp ? newVNode[domProp] : null
  const newVNodeProps = newVNode.props
  if (dom) {
    for (const propName in newVNodeProps) {
      const propValue = newVNodeProps[propName]
      if (propValue === false && dom.attributes?.[propName] === undefined) {
        // 值为 false 的属性在 Preact 的 diff 中被 removeAttribute 了，这里手动 setAttribute
        dom.setAttribute(propName, propValue)
      }
    }
  }
  if (oldDiffedHook) oldDiffedHook(newVNode)
}
