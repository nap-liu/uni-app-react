interface MPCustomElementConstructor {
  new (...args: any[]): any
}

export class MPCustomElements {
  customElements: Map<string, MPCustomElementConstructor> = new Map()
  define(name: string, ctor: MPCustomElementConstructor) {
    this.customElements.set(name, ctor)
  }
  get(name: string) {
    return this.customElements.get(name)
  }
}

export let runtimeCustomElements: MPCustomElements

// #ifdef MP || APP
runtimeCustomElements = new MPCustomElements()
// #endif

// #ifdef H5
runtimeCustomElements = window.customElements as any as MPCustomElements
// #endif
