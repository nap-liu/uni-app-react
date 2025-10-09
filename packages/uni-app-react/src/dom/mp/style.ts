import { ShortName, UpdateQueueType } from './consts'
import { MPHTMLElement } from './element'
import { toCamelCase } from './utils'

export class MPCSSStyleDeclaration {
  [key: string]: any
  private styles: Record<string, string> = {}
  owner: MPHTMLElement | null = null
  private proxy: MPCSSStyleDeclaration
  isUpdating = false

  constructor(owner?: MPHTMLElement) {
    if (owner) this.owner = owner

    this.proxy = new Proxy(this, {
      get: (target, prop: string) => {
        if (prop in target) {
          // 优先返回类本身的属性/方法
          return (target as any)[prop]
        }
        // 允许直接访问 styles.xxx
        return target.styles[prop] || ''
      },
      set: (target, prop: string, value) => {
        if (prop in target) {
          ;(target as any)[prop] = value
        } else {
          // 设置样式
          target.styles[prop] = value
          target._enqueueStyleUpdate()
        }
        return true
      },
      has: (target, prop: string) => prop in target.styles || prop in target,
      deleteProperty: (target, prop: string) => {
        if (prop in target.styles) {
          delete target.styles[prop]
          target._enqueueStyleUpdate()
          return true
        }
        return false
      },
      ownKeys: (target) => {
        return Reflect.ownKeys(target.styles)
      },
      getOwnPropertyDescriptor: (target, prop: string) => {
        if (prop in target.styles) {
          return {
            configurable: true,
            enumerable: true,
            writable: true,
            value: target.styles[prop],
          }
        }
        return undefined
      },
    })
    return this.proxy
  }

  get cssText(): string {
    return Object.entries(this.styles)
      .map(
        ([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v};`
      )
      .join(' ')
  }

  set cssText(value: string) {
    this.styles = {}
    // 匹配形如 "property: value;" 的声明，允许冒号和空格在 value 中
    const regex = /([\w-]+)\s*:\s*([^;]+)\s*;?/g
    let match: RegExpExecArray | null

    while ((match = regex.exec(value))) {
      const prop = match[1].trim()
      const val = match[2].trim()
      if (prop && val != null) {
        const camel = toCamelCase(prop)
        this.styles[camel] = val
      }
    }
    this._enqueueStyleUpdate()
  }

  setProperty(name: string, value: string) {
    const camel = toCamelCase(name)
    this.styles[camel] = value
    this._enqueueStyleUpdate()
  }

  getPropertyValue(name: string) {
    const camel = toCamelCase(name)
    return this.styles[camel] || ''
  }

  removeProperty(name: string) {
    const camel = toCamelCase(name)
    delete this.styles[camel]
    this._enqueueStyleUpdate()
  }

  _enqueueStyleUpdate() {
    if (this.isUpdating) {
      return
    }
    if (this.owner?._root) {
      const self = this
      this.isUpdating = true
      this.owner._root.enqueueUpdate(() => {
        self.isUpdating = false
        return {
          node: this.owner,
          type: UpdateQueueType.UpdateStyle,
          value: {
            [this.owner?._path + `.${ShortName.style}`]: this.cssText,
          },
        }
      })
    }
  }
}
