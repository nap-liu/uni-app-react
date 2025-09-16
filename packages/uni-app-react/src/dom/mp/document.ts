import { controlledComponent, DOCUMENT_NODE } from './consts'
import { runtimeCustomElements } from '../common/customElements'
import { MPHTMLElement } from './element'
import { MPFormElement } from './formElement'
import { MPNode, MPText } from './node'
import { MPRootElement } from './rootElement'

export class MPDocument extends MPNode {
  body: MPHTMLElement
  documentElement: MPHTMLElement
  allNode: Map<string, MPNode>
  constructor() {
    super(DOCUMENT_NODE, '#document')
    this.ownerDocument = null
    this.allNode = new Map()

    const html = this.createElement('html')
    const head = this.createElement('head')
    const title = this.createElement('title')
    const body = this.createElement('body')

    html.appendChild(head)
    head.appendChild(title)
    html.appendChild(body)
    this.appendChild(html)

    this.body = body
    this.documentElement = html
  }

  createElementNS(namespaceURI: string, tag: string) {
    return this.createElement(tag)
  }

  createElement(tag: string) {
    const nodeName = tag.toLowerCase()

    let el: MPHTMLElement | MPRootElement | MPFormElement
    switch (true) {
      case nodeName === 'root':
        el = new MPRootElement()
        break
      case controlledComponent.has(nodeName):
        el = new MPFormElement(nodeName)
        break
      default:
        const CustomElement = runtimeCustomElements.get(nodeName)
        if (CustomElement) {
          // @ts-ignore
          el = new CustomElement(nodeName)
        } else {
          el = new MPHTMLElement(tag)
        }
        break
    }
    el.ownerDocument = this
    return el
  }

  createTextNode(data: string) {
    const text = new MPText(data)
    text.ownerDocument = this
    return text
  }

  getElementBySid(sid?: string) {
    if (!sid) {
      return null
    }
    return this.allNode.get(sid) || null
  }
}
