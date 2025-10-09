type Callback<T = any> = (data: T) => boolean | any

export enum HookType {
  createElement = 'createElement',
  enqueueUpdate = 'enqueueUpdate',
  setAttribute = 'setAttribute',
  getAttribute = 'getAttribute',
  removeAttribute = 'removeAttribute',
  propToAlias = 'propToAlias',
  beforeDispatchEvent = 'beforeDispatchEvent',
  dispatchEvent = 'dispatchEvent',
  afterDispatchEvent = 'afterDispatchEvent',
}

class Hook {
  events = new Map<string, Callback[]>()
  on<T = any>(eventName: HookType, callback: Callback<T>) {
    this.events.get(eventName)?.push(callback) ||
      this.events.set(eventName, [callback])
  }

  off(eventName: HookType, callback: Callback) {
    if (!this.events.has(eventName)) return
    const listeners = this.events.get(eventName)!
    listeners.splice(listeners.indexOf(callback), 1)
  }

  emit(eventName: HookType, data: any) {
    for (const item of this.events.get(eventName) || []) {
      if (item(data) === false) {
        break
      }
    }
  }
}

export const hook = new Hook()
