import { runtimeCustomElements, runtimeDocument } from '@js-css/uni-app-react'

export const MPSlotName = 'mp-slot'
export const MPShadowDomName = 'mp-shadow-dom'
export const MPDefaultSlotName = 'default'
const methods = ['appendChild', 'insertBefore', 'removeChild'] as const

export class MPShadowDomElement extends HTMLElement {
  host: HTMLElement | null = null
  hostSlotRoot: DocumentFragment = (
    runtimeDocument as Document
  ).createDocumentFragment()

  slotElements: Map<string, MPSlotElement[]> = new Map()

  attachElement(host: HTMLElement, options: ShadowRootInit) {
    this.host = host
    this.proxyHost()
  }

  detachElement() {
    this.restoreHost()
  }

  restoreHost() {
    methods.forEach((method) => {
      const originMethod = `_${method}`
      // @ts-ignore
      delete this.host[originMethod]
      // @ts-ignore
      delete this.host[method]
      // @ts-ignore
      delete this[originMethod]
      // @ts-ignore
      delete this[method]
    })
  }

  getSlotElement(name: string) {
    const slots = this.slotElements.get(name)
    return slots?.[0] || this.hostSlotRoot
  }
  proxyHost() {
    const { host, hostSlotRoot } = this
    if (!hostSlotRoot || !host) {
      return
    }

    const shadowRoot = this
    Object.defineProperty(host, 'shadowRoot', {
      configurable: true,
      get() {
        // console.log('phony shadowRoot', shadowRoot)
        return shadowRoot
      },
    })

    methods.forEach((method) => {
      // 代理shadow root到外部元素上
      const originShadowMethod = shadowRoot[method]
      // @ts-ignore
      shadowRoot[`_${method}`] = originShadowMethod
      Object.defineProperty(shadowRoot, method, {
        configurable: true,
        enumerable: true,
        get() {
          return function (...args: Element[]) {
            const description = {
              enumerable: true,
              configurable: true,
              get() {
                return shadowRoot
              },
            }
            args.forEach((n) => {
              if (n) {
                if (method === 'removeChild') {
                  // @ts-ignore
                  delete n.parentNode
                  // @ts-ignore
                  delete n.parentElement
                } else {
                  Object.defineProperty(n, 'parentNode', description)
                  Object.defineProperty(n, 'parentElement', description)
                }
              }
            })

            // console.log('method shadow set shadow root', method, args)
            // @ts-ignore
            return originHostMethod.apply(host, args)
          }
        },
      })

      const originHostMethod = host[method]
      // @ts-ignore
      host[`_${method}`] = originHostMethod
      // 代理host到内部fragment上
      Object.defineProperty(host, method, {
        configurable: true,
        enumerable: true,
        get() {
          return function (...args: Element[]) {
            const [node, before] = args
            const slotName =
              (node.nodeType === Node.ELEMENT_NODE &&
                node.getAttribute('slot')) ||
              MPDefaultSlotName

            const targetSlot = shadowRoot.getSlotElement(slotName)

            // console.log('method', targetSlot, method, args)

            try {
              if (
                before &&
                before.parentElement instanceof MPSlotElement &&
                before.parentElement !== targetSlot
              ) {
                // 多个兄弟 slot 的情况下，before 的元素在其他 slot 中，则将before置为null
                // @ts-ignore
                args[1] = null
              }

              // @ts-ignore
              const result = targetSlot[method](...args)
              return result
            } catch (e) {
              console.error(e)
            }
          }
        },
      })
    })
  }

  distributeSlotElement(slot: MPSlotElement) {
    const slotName = slot.name
    const slots = this.slotElements.get(slotName) ?? []
    this.slotElements.set(slotName, slots)

    slots.push(slot)

    if (slots.length > 1) {
      return
    }

    const nodes = Array.from(this.hostSlotRoot.childNodes)
    // console.log('distributeSlotElement nodes', nodes)
    nodes.forEach((child) => {
      const childSlotName =
        child.nodeType === Node.ELEMENT_NODE
          ? (child as Element).getAttribute('slot') || MPDefaultSlotName
          : MPDefaultSlotName
      // console.log('distributeSlotElement', slotName, this, slot, child)
      if (slotName === childSlotName) {
        slot.appendChild(child)
      }
    })
  }

  restoreSlotElement(slot: MPSlotElement) {
    const slotName = slot.name
    // this.slotElements.delete(slotName)
    const slots = this.slotElements.get(slotName)

    if (!slots) {
      return
    }

    const idx = slots.indexOf(slot)
    slots.splice(idx, 1)

    // 已经分发到slot的元素需要归还给shadow root
    Array.from(slot.childNodes).forEach((node) => {
      this.hostSlotRoot.appendChild(node)
    })

    // 然后需要重新触发一下slot的分发，同名的slot需要向下传递给第二个
    if (slots.length) {
      this.distributeSlotElement(slots[0])
    }
  }
}

export class MPSlotElement extends HTMLElement implements HTMLSlotElement {
  fallbackContent: Node[] = []
  assign(...nodes: (Element | Text)[]) {
    // console.log('assign', nodes)
  }

  get name(): string {
    return this.getAttribute('name') || MPDefaultSlotName
  }

  set name(name: string) {
    // TODO slot name change redistribute
    // console.log('mp-slot name change', name, this.name)
    if (name !== this.name) {
      const shadowDom = this.findMPShadowDom()
      if (shadowDom) {
        shadowDom.restoreSlotElement(this)
        super.setAttribute('name', name)
        shadowDom.distributeSlotElement(this)
      }
    }
    super.setAttribute('name', name)
  }

  setAttribute(qualifiedName: string, value: string): void {
    // console.log('mp-slot setAttribute', qualifiedName, value)
    if (qualifiedName === 'name') {
      this.name = value
    } else {
      return super.setAttribute(qualifiedName, value)
    }
  }

  findMPShadowDom(): MPShadowDomElement | null {
    let node: HTMLElement | null = this

    const findVueShadowDom = (dom: any) => {
      let node = dom.__vueParentComponent
      while (node) {
        const el = node.vnode.el?.parentElement
        if (node.$node && el instanceof MPShadowDomElement) {
          // console.log('vue parent node1', node)
          return el
        }
        node = node.parent
      }
      // console.log('findVueMPShadowDom not found', dom)
      return null
    }

    while (node) {
      if (node instanceof MPShadowDomElement) {
        return node
      }
      node = node.parentElement
    }

    node = this

    while (node) {
      const shadowDom = findVueShadowDom(node)
      if (shadowDom) {
        return shadowDom
      }
      node = node.parentElement
    }
    // console.log('not found', this)
    return null
  }

  assignedElements(options?: AssignedNodesOptions | undefined): Element[] {
    // console.log('assignedElements')
    return []
  }
  assignedNodes(options?: AssignedNodesOptions | undefined): Node[] {
    return []
  }
  connectedCallback() {
    this.fallbackContent = Array.from(this.childNodes)
    this.innerHTML = ''
    // console.log('mp-slot connectedCallback', this)
    // TODO fallback
    this.findMPShadowDom()?.distributeSlotElement(this)
  }
  disconnectedCallback() {
    // console.log('mp-slot disconnectedCallback')
    this.findMPShadowDom()?.restoreSlotElement(this)
  }
}

export const attachMPShadow = (host: any, options: any) => {
  // const shadowDom = runtimeDocument.createElement(
  //   MPShadowDomName
  // ) as MPShadowDomElement

  const shadowDom = new MPShadowDomElement()

  shadowDom.attachElement(host, options)

  return shadowDom
}

export const initialMPShadow = () => {
  runtimeCustomElements.define(MPShadowDomName, MPShadowDomElement)
  runtimeCustomElements.define(MPSlotName, MPSlotElement)

  const createElement = runtimeDocument.createElement

  runtimeDocument.createElement = function (tag: string) {
    if (tag.toLowerCase() === 'slot') {
      // console.log('replace slot to mp-slot')
      tag = MPSlotName
    }
    // @ts-ignore
    return createElement.call(runtimeDocument, tag)
  }
}
