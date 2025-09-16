import { ELEMENT_NODE } from './consts'
import { MPEvent } from './events'
import { MPNode, MPText } from './node'
import { MPCSSStyleDeclaration } from './style'
import { DOMTokenList } from './tokenList'

export class MPElement extends MPNode {
  attributes = new Map<string, any>()
  constructor(tagName: string) {
    super(ELEMENT_NODE, tagName.toUpperCase())
  }

  setAttribute(name: string, value: any) {
    const nextValue = value
    this.attributes.set(name, nextValue)
    this.enqueueAttrUpdate(name, nextValue)
  }

  getAttribute(name: string) {
    return this.attributes.get(name)
  }

  removeAttribute(name: string) {
    this.attributes.delete(name)
    this.enqueueAttrUpdate(name, undefined)
  }

  enqueueAttrUpdate(name: string, value: any) {
    this._root?.enqueueUpdate(() => {
      return {
        node: this,
        type: 'prop',
        value: {
          path: this._path,
          name,
          value,
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
    return this.getAttribute('id') ?? ''
  }

  set id(value: string) {
    this.setAttribute('id', value)
  }

  get className(): string {
    return this.getAttribute('class') ?? ''
  }

  set className(value: string) {
    this.setAttribute('class', value)
  }

  get innerText(): string {
    return this.textContent || ''
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
