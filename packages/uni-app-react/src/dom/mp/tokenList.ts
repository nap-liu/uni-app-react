import { MPHTMLElement } from './element'

export class DOMTokenList {
  private element: MPHTMLElement
  private classes: string[] = []
  private classSet: Set<string> = new Set()

  constructor(element: MPHTMLElement) {
    this.element = element
    this.syncClassName()
  }

  private updateClassName() {
    this.element.className = this.classes.join(' ')
  }

  add(...tokens: string[]) {
    let changed = false
    tokens.forEach((t) => {
      if (!this.classSet.has(t)) {
        this.classSet.add(t)
        changed = true
      }
    })
    if (changed) {
      this.classes = [...this.classSet]
      this.updateClassName()
    }
  }

  remove(...tokens: string[]) {
    let changed = false
    tokens.forEach((t) => {
      if (this.classSet.has(t)) {
        this.classSet.delete(t)
        changed = true
      }
    })
    if (changed) {
      this.classes = [...this.classSet]
      this.updateClassName()
    }
  }

  toggle(token: string, force?: boolean): boolean {
    if (force === undefined) {
      this.classSet.has(token) ? this.remove(token) : this.add(token)
    } else if (force) {
      this.add(token)
    } else {
      this.remove(token)
    }
    return this.classSet.has(token)
  }

  contains(token: string): boolean {
    return this.classSet.has(token)
  }

  item(index: number): string | null {
    return this.classes[index] || null
  }

  get length() {
    return this.classes.length
  }

  [Symbol.iterator]() {
    return this.classes[Symbol.iterator]()
  }

  syncClassName() {
    const tokens = (this.element.className || '').split(/\s+/).filter(Boolean)
    this.classSet = new Set(tokens)
    this.classes = [...this.classSet]
  }
}
