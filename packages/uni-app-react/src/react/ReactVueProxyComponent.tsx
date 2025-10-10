import {
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
  createElement,
} from 'react'
import type { MPVueProxyHTMLElement } from './ReactVueProxy'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'vue-proxy': {
        ref?: React.Ref<any>
        useHostElement: boolean
        children?: React.ReactNode
      }
    }
  }
}

export function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || a == null) return false
  if (typeof b !== 'object' || b == null) return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false
    if (!Object.is(a[k], b[k])) return false
  }
  return true
}

export const ReactVueProxy = forwardRef((props: any, vueInstanceRef: any) => {
  const { $_cn_, children, ...rest } = props

  const [expose, setExpose] = useState(null)

  rest.ref = setExpose

  const elementRef = useRef<MPVueProxyHTMLElement>(null)
  const handleProxyRef = useCallback((ref: MPVueProxyHTMLElement) => {
    // console.log('ReactVueProxy ref', ref)
    if (ref) {
      ref.$props = rest
      ref.$name = $_cn_
    }
    elementRef.current = ref
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (element) {
      const oldName = element.$name
      const oldProps = element.$props
      if (oldName !== $_cn_ || !shallowEqual(oldProps, rest)) {
        element.$props = rest
        element.$name = $_cn_
        element.doSyncProps()
      }
    }
  }, [...Object.values(rest)])

  useImperativeHandle(vueInstanceRef, () => {
    if (elementRef.current && expose) {
      return expose
    }
    return null
  }, [elementRef.current, expose])

  // vite 预编译会忽略编译插件，这种情况只有h5下才会出现
  // #ifdef H5
  return createElement('vue-proxy', { ref: handleProxyRef }, children)
  // #endif

  // vite 预编译会忽略编译插件，这种情况只有h5下才会出现
  // #ifndef H5
  return (
    <vue-proxy ref={handleProxyRef} useHostElement>
      {children}
    </vue-proxy>
  )
  // #endif
})
