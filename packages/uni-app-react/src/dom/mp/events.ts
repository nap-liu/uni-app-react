import {
  CONFIRM,
  CURRENT_TARGET,
  INPUT,
  KEY_CODE,
  TARGET,
  TIME_STAMP,
  TYPE,
} from './consts'

export type EventListener = ((event: MPEvent) => boolean | undefined | any) & {
  origin?: EventListener
}
export type EventListenerOptions =
  | boolean
  | { capture?: boolean; once?: boolean; passive?: boolean }

export interface EventOptions {
  bubbles: boolean
  cancelable: boolean
}

type Target = Record<string, unknown> & {
  dataset: Record<string, string>
  id: string
}

export interface MpEvent {
  [x: string]: any
  type: string
  detail: Record<string, unknown>
  target: Target
  currentTarget: Target
}

export class MPEvent {
  // [x: string]: any
  private cacheTarget: any
  private cacheCurrentTarget: any

  public type: string

  public bubbles: boolean

  public cancelable: boolean

  public isStopPropagation = false

  public isStopImmediatePropagation = false

  public defaultPrevented = false

  public button = 0

  public timeStamp = Date.now()

  public mpEvent: MpEvent | undefined

  public constructor(type: string, opts: EventOptions, event?: MpEvent) {
    this.type = type.toLowerCase()
    this.mpEvent = event
    this.bubbles = Boolean(opts && opts.bubbles)
    this.cancelable = Boolean(opts && opts.cancelable)
  }

  public stopPropagation() {
    this.isStopPropagation = true
  }

  public stopImmediatePropagation() {
    this.isStopImmediatePropagation = this.isStopImmediatePropagation = true
  }

  public preventDefault() {
    this.defaultPrevented = true
  }

  set target(v) {
    // console.log('set event target', v)
  }
  get target() {
    const cacheTarget = this.cacheTarget
    if (!cacheTarget) {
      const target = Object.create(this.mpEvent?.target || null)

      for (const key in this.mpEvent?.detail) {
        target[key] = this.mpEvent!.detail[key]
      }

      this.cacheTarget = target

      return target
    } else {
      return cacheTarget
    }
  }

  set currentTarget(v) {
    // console.log('set event currentTarget', v)
  }
  get currentTarget() {
    const cacheCurrentTarget = this.cacheCurrentTarget
    if (!cacheCurrentTarget) {
      const currentTarget = Object.create(this.mpEvent?.currentTarget || null)

      for (const key in this.mpEvent?.detail) {
        currentTarget[key] = this.mpEvent!.detail[key]
      }

      this.cacheCurrentTarget = currentTarget

      return currentTarget
    } else {
      return cacheCurrentTarget
    }
  }
}

export class MPCustomEvent<T = any> extends MPEvent {
  detail: T
  constructor(
    type: string,
    eventInitDict?: { detail?: T },
    options?: EventOptions
  ) {
    super(type, {
      bubbles: true,
      cancelable: true,
      ...(options || {}),
    })
    this.detail = eventInitDict?.detail as T
  }
}

export function createEvent(event: MpEvent | string, node?: any) {
  if (typeof event === 'string') {
    return new MPEvent(event, { bubbles: true, cancelable: true })
  }

  const domEv = new MPEvent(
    event.type,
    { bubbles: true, cancelable: true },
    event
  )

  for (const key in event) {
    if (
      key === CURRENT_TARGET ||
      key === TARGET ||
      key === TYPE ||
      key === TIME_STAMP
    ) {
      continue
    } else {
      // @ts-ignore
      domEv[key] = event[key]
    }
  }

  if (domEv.type === CONFIRM && node?.nodeName === INPUT) {
    // @ts-ignore
    domEv[KEY_CODE] = 13
  }

  return domEv
}

const normalOptions = (options: EventListenerOptions) => {
  return typeof options === 'boolean'
    ? { capture: options, once: false, passive: false }
    : {
        capture: !!options.capture,
        once: !!options.once,
        passive: !!options.passive,
      }
}

export class MPEventTarget {
  listeners: Map<
    string,
    Set<{
      fn: EventListener
      options: Required<{ capture: boolean; once: boolean; passive: boolean }>
      stop: boolean
    }>
  > = new Map()

  parent: MPEventTarget | null = null

  hasAnyEvent() {
    return this.listeners.size > 0
  }

  hasEvent(type: string) {
    return Array.from(this.listeners.keys()).some(
      (i) => i.toLowerCase() === type.toLowerCase()
    )
  }

  addEventListener(
    type: string,
    callback: EventListener,
    options: EventListenerOptions = {}
  ) {
    if (!callback) return
    // TODO event change render element

    const option = normalOptions(options)

    if (option.once) {
      function wrapper(this: MPEventTarget) {
        this.removeEventListener(type, wrapper, option)
        // @ts-ignore
        return callback.apply(this, arguments)
      }

      this.addEventListener(type, wrapper, {
        ...option,
        once: false,
      })
      return
    }

    let origin = callback

    callback = function () {
      // @ts-ignore
      return origin.apply(this, arguments)
    }
    callback.origin = origin

    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }

    this.listeners.get(type)!.add({
      fn: callback,
      options: option,
      stop: false,
    })
  }

  removeEventListener(
    type: string,
    callback: EventListener,
    options: EventListenerOptions = {}
  ) {
    if (!callback) return
    const opts = normalOptions(options)

    const set = this.listeners.get(type)
    if (!set) return
    for (const listener of set) {
      if (
        (listener.fn === callback || listener.fn.origin === callback) &&
        listener.options.capture === opts.capture
      ) {
        set.delete(listener)
        break
      }
    }
    if (!set.size) {
      this.listeners.delete(type)
    }
  }

  private _stopPropagation(event: MPEvent) {
    let target = this
    while ((target = target.parent as this)) {
      const listeners = target.listeners.get(event.type)
      listeners?.forEach((item) => {
        item.stop = true
      })
    }
  }

  public dispatchEvent(event: MPEvent): boolean {
    const cancelable = event.cancelable

    // 绑定的可能是大写，这里处理一下认为是同一个
    const bindType = Array.from(this.listeners.keys()).find((i) => {
      if (i.toLowerCase() === event.type.toLowerCase()) {
        return i
      }
      return null
    })

    if (!bindType) {
      return false
    }

    const listeners = this.listeners.get(bindType)

    if (!listeners || !listeners.size) {
      return false
    }

    const originType = event.type
    event.type = bindType
    for (const item of listeners.values()) {
      let result
      if (item.stop) {
        item.stop = false
      } else {
        result = item.fn.call(this, event)
      }
      // 返回false或者终止事件，并且可以取消的事件，则终止默认行为
      if (
        (result === false || event.isStopImmediatePropagation) &&
        cancelable
      ) {
        event.defaultPrevented = true
      }

      // 停止冒泡，并且终止事件，则放弃后续的所有事件处理
      if (event.isStopImmediatePropagation && event.isStopPropagation) {
        break
      }
    }

    if (event.isStopPropagation) {
      this._stopPropagation(event)
    }
    event.type = originType

    return listeners != null
  }
}
