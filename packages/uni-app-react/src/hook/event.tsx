type Callback<T = any> = (data: T) => boolean | any

class Hook {
  events = new Map<string, Callback[]>()
  on<T = any>(eventName: string, callback: Callback<T>) {
    this.events.get(eventName)?.push(callback) ||
      this.events.set(eventName, [callback])
  }

  off(eventName: string, callback: Callback) {
    if (!this.events.has(eventName)) return
    const listeners = this.events.get(eventName)!
    listeners.splice(listeners.indexOf(callback), 1)
  }

  emit(eventName: string, data: any) {
    for (const item of this.events.get(eventName) || []) {
      if (item(data) === false) {
        break
      }
    }
  }
}

export const hook = new Hook()
