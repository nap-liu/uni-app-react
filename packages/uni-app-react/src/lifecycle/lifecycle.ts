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
  // onAddToFavorites,
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
  // onSaveExitState,
  // onShareAppMessage,
  // onShareTimeline,
  onTabItemTap,
  onThemeChange,
  onUnhandledRejection,
  onUnload,
  onHide,
  onShow,
}

type LifeCycleType = keyof typeof lifeCycleMap

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

  const keys = Object.keys(lifeCycleMap) as Array<LifeCycleType>
  keys.forEach((key) => {
    // @ts-ignore
    lifeCycleMap[key]((...args) => {
      // console.log('dispatchLifeCycle', id, key, args)
      dispatchLifeCycle(id, key, args)
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
  setTimeout(() => {
    const hooks = lifecycleHookMap.get(id)?.get(type)
    // console.log('hook', id, type, payload, hooks)
    hooks?.forEach((hook) => hook(...payload))
  })
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

  const index = hooks.length

  hooks.push(callback)

  return () => {
    hooks.splice(index, 1)
  }
}

type Dispose = (() => void) | null
// export const useAddToFavorites = (callback: (...args: any) => any) => {
//   const dispose = useRef<Dispose | null>(null)
//   if (!dispose.current) {
//     dispose.current = attachLifeCycle('onAddToFavorites', (...args) => {
//       return callback(...args)
//     })
//   }
// }
export const useBackPress = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onBackPress', (...args) => {
      return callback(...args)
    })
  }
}
export const useError = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onError', (...args) => {
      return callback(...args)
    })
  }
}
export const useExit = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onExit', (...args) => {
      return callback(...args)
    })
  }
}
export const useInit = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onInit', (...args) => {
      return callback(...args)
    })
  }
}
export const useLaunch = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onLaunch', (...args) => {
      return callback(...args)
    })
  }
}
export const useLoad = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onLoad', (...args) => {
      return callback(...args)
    })
  }
}
export const useNavigationBarButtonTap = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onNavigationBarButtonTap', (...args) => {
      return callback(...args)
    })
  }
}
export const useNavigationBarSearchInputChanged = (
  callback: (...args: any) => any
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle(
      'onNavigationBarSearchInputChanged',
      (...args) => {
        return callback(...args)
      }
    )
  }
}
export const useNavigationBarSearchInputClicked = (
  callback: (...args: any) => any
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle(
      'onNavigationBarSearchInputClicked',
      (...args) => {
        return callback(...args)
      }
    )
  }
}
export const useNavigationBarSearchInputConfirmed = (
  callback: (...args: any) => any
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle(
      'onNavigationBarSearchInputConfirmed',
      (...args) => {
        return callback(...args)
      }
    )
  }
}
export const useNavigationBarSearchInputFocusChanged = (
  callback: (...args: any) => any
) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle(
      'onNavigationBarSearchInputFocusChanged',
      (...args) => {
        return callback(...args)
      }
    )
  }
}
export const usePageHide = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onPageHide', (...args) => {
      return callback(...args)
    })
  }
}
export const usePageNotFound = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onPageNotFound', (...args) => {
      return callback(...args)
    })
  }
}
export const usePageScroll = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onPageScroll', (...args) => {
      return callback(...args)
    })
  }
}
export const usePageShow = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onPageShow', (...args) => {
      return callback(...args)
    })
  }
}
export const usePullDownRefresh = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onPullDownRefresh', (...args) => {
      return callback(...args)
    })
  }
}
export const useReachBottom = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onReachBottom', (...args) => {
      return callback(...args)
    })
  }
}
export const useReady = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onReady', (...args) => {
      return callback(...args)
    })
  }
}
export const useResize = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onResize', (...args) => {
      return callback(...args)
    })
  }
}
// export const useSaveExitState = (callback: (...args: any) => any) => {
//   const dispose = useRef<Dispose | null>(null)
//   if (!dispose.current) {
//     dispose.current = attachLifeCycle('onSaveExitState', (...args) => {
//       return callback(...args)
//     })
//   }
// }
// export const useShareAppMessage = (callback: (...args: any) => any) => {
//   const dispose = useRef<Dispose | null>(null)
//   if (!dispose.current) {
//     dispose.current = attachLifeCycle('onShareAppMessage', (...args) => {
//       return callback(...args)
//     })
//   }
// }
// export const useShareTimeline = (callback: (...args: any) => any) => {
//   const dispose = useRef<Dispose | null>(null)
//   if (!dispose.current) {
//     dispose.current = attachLifeCycle('onShareTimeline', (...args) => {
//       return callback(...args)
//     })
//   }
// }
export const useTabItemTap = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onTabItemTap', (...args) => {
      return callback(...args)
    })
  }
}
export const useThemeChange = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onThemeChange', (...args) => {
      return callback(...args)
    })
  }
}
export const useUnhandledRejection = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onUnhandledRejection', (...args) => {
      return callback(...args)
    })
  }
}
export const useUnload = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onUnload', (...args) => {
      return callback(...args)
    })
  }
}
export const useHide = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onHide', (...args) => {
      return callback(...args)
    })
  }
}
export const useShow = (callback: (...args: any) => any) => {
  const dispose = useRef<Dispose | null>(null)
  if (!dispose.current) {
    dispose.current = attachLifeCycle('onShow', (...args) => {
      return callback(...args)
    })
  }
}
