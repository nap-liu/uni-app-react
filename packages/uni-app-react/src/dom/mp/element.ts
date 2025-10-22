import { hook, HookType } from '../../hook'
import { CLASS, ELEMENT_NODE, ID, ShortName, UpdateQueueType } from './consts'
import { MPNode, MPText } from './node'
import { getElementAlias, getAliasProp } from './render'
import { MPCSSStyleDeclaration } from './style'
import { DOMTokenList } from './tokenList'

export class MPElement extends MPNode {
  attributes = new Map<string, any>()
  constructor(tagName: string) {
    super(ELEMENT_NODE, tagName.toUpperCase())
  }

  setAttribute(name: string, value: any) {
    const event = { node: this, name, value }
    hook.emit(HookType.setAttribute, event)
    const nextValue = value
    this.attributes.set(name, nextValue)
    this.enqueueAttrUpdate(name, nextValue, UpdateQueueType.SetAttribute)
  }

  getAttribute(name: string) {
    const event = {
      node: this,
      name,
      value: this.attributes.get(name),
    }
    hook.emit(HookType.getAttribute, event)
    return event.value
  }

  removeAttribute(name: string) {
    const event = { node: this, name, value: '' }
    hook.emit(HookType.removeAttribute, event)
    this.attributes.delete(event.name)

    this.enqueueAttrUpdate(
      event.name,
      event.value,
      UpdateQueueType.RemoveAttribute
    )
  }

  enqueueAttrUpdate(name: string, value: any, type: UpdateQueueType) {
    this._root?.enqueueUpdate(() => {
      return {
        node: this,
        type,
        value: getAliasProp(this, this._path, name, value),
      }
    })
  }

  addEventListener(...args: any): void {
    const hasEvent = this.hasAnyEvent()
    super.addEventListener.apply(this, args)
    const nextHasEvent = this.hasAnyEvent()
    if (hasEvent !== nextHasEvent) {
      this.changeElement()
    }
  }

  removeEventListener(...args: any): void {
    const hasEvent = this.hasAnyEvent()
    super.removeEventListener.apply(this, args)
    const nextHasEvent = this.hasAnyEvent()
    if (hasEvent !== nextHasEvent) {
      this.changeElement()
    }
  }

  changeElement() {
    this._root?.enqueueUpdate(() => {
      const { alias } = getElementAlias(this)
      return {
        node: this,
        type: UpdateQueueType.ChangeElement,
        value: {
          [`${this._path}.${ShortName.nodeType}`]: alias._num,
        },
      }
    })
  }

  get innerHTML(): string {
    return this.childNodes.map((c) => c.toString()).join('')
  }
  set innerHTML(html: string) {
    this.childNodes = []
    if (html) this.appendChild(new MPText(html))
  }

  toString(indent = 0) {
    const nodeName = this.nodeName.toLowerCase()
    const space = ' '.repeat(indent)
    const attrs = [...this.attributes.entries()]
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')
    const children = this.childNodes
      .map((c) => c.toString(indent + 2))
      .join('\n')
    return `${space}<${nodeName}${attrs ? ' ' + attrs : ''}>${children ? `\n${children}\n${space}` : ''}</${nodeName}>`
  }
}

export class MPHTMLElement extends MPElement {
  style: MPCSSStyleDeclaration

  constructor(tagName: string) {
    super(tagName)
    this.style = new MPCSSStyleDeclaration(this)
  }

  get classList() {
    return new DOMTokenList(this)
  }

  get id() {
    return this.getAttribute(ID) ?? ''
  }

  set id(value: string) {
    this.setAttribute(ID, value)
  }

  get className(): string {
    return this.getAttribute(CLASS) ?? ''
  }

  set className(value: string) {
    this.setAttribute(CLASS, value)
  }

  get innerText(): string {
    return this.textContent ?? ''
  }
  set innerText(value: string) {
    this.textContent = value
  }

  contains(node: MPNode): boolean {
    if (this === node) return true
    for (const child of this.childNodes) {
      if (child instanceof MPHTMLElement && child.contains(node)) return true
    }
    return false
  }

  // click() {
  //   this.dispatchEvent(new MPEvent('click'))
  // }
  // focus() {
  //   this.dispatchEvent(new MPEvent('focus'))
  // }
  // blur() {
  //   this.dispatchEvent(new MPEvent('blur'))
  // }
}
