import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { watch } from 'vue'

export const connectVueObserver = (Component: FC<any>) => {
  function VueWrapper(props: any) {
    const dispose = useRef<() => void>(null)
    const nodeRef = useRef<ReturnType<FC>>(null)
    const [, forceUpdate] = useState<any>(null)

    useMemo(() => {
      dispose.current?.()
      dispose.current = watch(
        () => {
          const node = Component(props)
          if (dispose.current) {
            forceUpdate({})
          }
          nodeRef.current = node
        },
        () => {}
      )
    }, Object.values(props))

    useEffect(() => {
      return () => {
        dispose.current?.()
        dispose.current = null
      }
    }, [])

    return nodeRef.current
  }

  VueWrapper.displayName = `VueObserver(${Component.displayName || Component.name || 'Anonymous'})`

  return VueWrapper
}
