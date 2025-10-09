import {
  onAddToFavorites,
  onBackPress,
  onError,
  onExit,
  onInit,
  onLaunch,
  onLoad,
  onNavigationBarButtonTap,
  onNavigationBarSearchInputChanged,
  onNavigationBarSearchInputClicked,
  onNavigationBarSearchInputConfirmed,
  onNavigationBarSearchInputFocusChanged,
  onPageHide,
  onPageNotFound,
  onPageScroll,
  onPageShow,
  onPullDownRefresh,
  onReachBottom,
  onReady,
  onResize,
  onSaveExitState,
  onShareAppMessage,
  onShareTimeline,
  onTabItemTap,
  onThemeChange,
  onUnhandledRejection,
  onUnload,
  onHide,
  onShow,
} from '@dcloudio/uni-app'
import { useRef } from 'react'
import { onUnmounted } from 'vue'

const lifeCycleMap: Record<string, any> = {
  onAddToFavorites,
  onBackPress,
  onError,
  onExit,
  onInit,
  onLaunch,
  onLoad,
  onNavigationBarButtonTap,
  onNavigationBarSearchInputChanged,
  onNavigationBarSearchInputClicked,
  onNavigationBarSearchInputConfirmed,
  onNavigationBarSearchInputFocusChanged,
  onPageHide,
  onPageNotFound,
  onPageScroll,
  onPageShow,
  onPullDownRefresh,
  onReachBottom,
  onReady,
  onResize,
  onSaveExitState,
  onShareAppMessage,
  onShareTimeline,
  onTabItemTap,
  onThemeChange,
  onUnhandledRejection,
  onUnload,
  onHide,
  onShow,
}

type LifeCycleType = keyof typeof lifeCycleMap

type Callback = (...args: any[]) => any

const lifecycleHookMap: Map<
  string,
  Map<LifeCycleType, Array<(...args: any[]) => any>>
> = new Map()

const getPageId = () => {
  const pages = getCurrentPages()
  const idx = pages.length - 1
  const page = pages[idx]
  return `${idx}-${page.route}`
}

export const useDispatchLifeCycle = () => {
  const id = getPageId()
  const lifeCycle = {
    ...lifeCycleMap,
  }

  const keys = Object.keys(lifeCycle) as Array<LifeCycleType>
  keys.forEach((key) => {
    // @ts-ignore
    lifeCycle[key]((...args) => {
      console.log('dispatchLifeCycle', id, key, args)
      return dispatchLifeCycle(id, key, args)
    })
  })

  onUnmounted(() => {
    lifecycleHookMap.delete(id)
  })
}

export const dispatchLifeCycle = (
  id: string,
  type: LifeCycleType,
  payload: any[]
) => {
  const isAsync = ['onInit', 'onLoad', 'onShow', 'onReady'].includes(type)
  if (isAsync) {
    setTimeout(() => {
      const hooks = lifecycleHookMap.get(id)?.get(type)
      // console.log('async hook', id, type, payload, hooks)
      hooks?.forEach((hook) => hook(...payload))
    })
  } else {
    const hooks = lifecycleHookMap.get(id)?.get(type)
    // console.log('sync hook', id, type, payload, hooks)
    return hooks?.reduce((_, hook) => hook(...payload), null)
  }
}

const attachLifeCycle = (
  type: LifeCycleType,
  callback: (...args: any[]) => any
) => {
  const id = getPageId()

  let pageHook = lifecycleHookMap.get(id)

  if (!pageHook) {
    pageHook = new Map()
  }
  lifecycleHookMap.set(id, pageHook)

  let hooks = pageHook.get(type)
  if (!hooks) {
    hooks = []
  }
  pageHook.set(type, hooks)

  hooks.push(callback)

  return () => {
    const index = hooks.indexOf(callback)
    if (index !== -1) {
      hooks.splice(index, 1)
    }
  }
}

type Dispose = (() => void) | null
export const useAddToFavorites: typeof onAddToFavorites = (
  callback: Callback
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onAddToFavorites', callback)
  }
}
export const useBackPress: typeof onBackPress = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onBackPress', callback)
  }
}
export const useError: typeof onError = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onError', callback)
  }
}
export const useExit: typeof onExit = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onExit', callback)
  }
}
export const useInit: typeof onInit = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onInit', callback)
  }
}
export const useLaunch: typeof onLaunch = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onLaunch', callback)
  }
}
export const useLoad: typeof onLoad = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onLoad', callback)
  }
}
export const useNavigationBarButtonTap: typeof onNavigationBarButtonTap = (
  callback: Callback
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onNavigationBarButtonTap', callback)
  }
}
export const useNavigationBarSearchInputChanged: typeof onNavigationBarSearchInputChanged =
  (callback: Callback) => {
    const dispose = useRef<Dispose | null>(null)
    if (!dispose.current) {
      dispose.current = attachLifeCycle(
        'onNavigationBarSearchInputChanged',
        callback
      )
    }
  }
export const useNavigationBarSearchInputClicked: typeof onNavigationBarSearchInputClicked =
  (callback: Callback) => {
    const dispose = useRef<Dispose | null>(null)
    if (!dispose.current) {
      dispose.current = attachLifeCycle(
        'onNavigationBarSearchInputClicked',
        callback
      )
    }
  }
export const useNavigationBarSearchInputConfirmed: typeof onNavigationBarSearchInputConfirmed =
  (callback: Callback) => {
    const dispose = useRef<Dispose | null>(null)
    if (!dispose.current) {
      dispose.current = attachLifeCycle(
        'onNavigationBarSearchInputConfirmed',
        callback
      )
    }
  }
export const useNavigationBarSearchInputFocusChanged: typeof onNavigationBarSearchInputFocusChanged =
  (callback: Callback) => {
    const dispose = useRef<Dispose | null>(null)
    if (!dispose.current) {
      dispose.current = attachLifeCycle(
        'onNavigationBarSearchInputFocusChanged',
        callback
      )
    }
  }
export const usePageHide: typeof onPageHide = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onPageHide', callback)
  }
}
export const usePageNotFound: typeof onPageNotFound = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onPageNotFound', callback)
  }
}
export const usePageScroll: typeof onPageScroll = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onPageScroll', callback)
  }
}
export const usePageShow: typeof onPageShow = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onPageShow', callback)
  }
}
export const usePullDownRefresh: typeof onPullDownRefresh = (
  callback: Callback
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onPullDownRefresh', callback)
  }
}
export const useReachBottom: typeof onReachBottom = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onReachBottom', callback)
  }
}
export const useReady: typeof onReady = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onReady', callback)
  }
}
export const useResize: typeof onResize = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onResize', callback)
  }
}
export const useSaveExitState: typeof onSaveExitState = (
  callback: Callback
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onSaveExitState', callback)
  }
}
export const useShareAppMessage: typeof onShareAppMessage = (
  callback: Callback
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onShareAppMessage', callback)
  }
  // useEffect(() => {
  //   return () => {
  //     console.log('dispose', dispose.current)
  //     dispose.current?.()
  //   }
  // }, [])
}
export const useShareTimeline: typeof onShareTimeline = (
  callback: Callback
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onShareTimeline', callback)
  }
}
export const useTabItemTap: typeof onTabItemTap = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onTabItemTap', callback)
  }
}
export const useThemeChange: typeof onThemeChange = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onThemeChange', callback)
  }
}
export const useUnhandledRejection: typeof onUnhandledRejection = (
  callback: Callback
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onUnhandledRejection', callback)
  }
}
export const useUnload: typeof onUnload = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onUnload', callback)
  }
}
export const useHide: typeof onHide = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onHide', callback)
  }
}
export const useShow: typeof onShow = (callback: Callback) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onShow', callback)
  }
}
