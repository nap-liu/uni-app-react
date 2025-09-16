import {
  runtimeCustomElements,
  runtimeDocument,
  UniElement,
} from '@js-css/uni-app-react'

export const AppSlotName = 'app-slot'
export const HostSlotName = 'slot'
export const AppShadowDomName = 'app-shadow-dom'
export const AppFragmentName = 'app-fragment'
export const AppDefaultSlotName = 'default'
const methods = ['appendChild', 'insertBefore', 'removeChild'] as const

export const NODE_TYPE_PAGE = 0
export const NODE_TYPE_ELEMENT = 1
export const NODE_TYPE_TEXT = 3
export const NODE_TYPE_COMMENT = 8

export class AppShadowDomElement extends UniElement {
  // @ts-ignore
  // hostSlotRoot: HTMLElement = new UniElement('document-fragment')
  hostSlotRoot: any = runtimeDocument.createElement(AppFragmentName)
  slotElements: Map<string, AppSlotElement[]> = new Map()
  host: any | null = null

  attachElement(host: any, options: ShadowRootInit) {
    this.host = host

    this.proxyHost()
  }

  detachElement() {
    const removeAll = (element: any) => {
      element.childNodes.forEach((child: any) => {
        removeAll(child)
      })

      const shadowRoot = element.shadowRoot
      if (shadowRoot instanceof AppShadowDomElement) {
        // console.log('remove shadowRoot', element.nodeId)
        shadowRoot.removeElement()
      }
    }

    removeAll(this.host)

    this.restoreHost()
  }

  removeElement() {
    // 内部方法 移除掉两个调度元素
    const { pageNode } = this
    if (pageNode && !pageNode.isUnmounted) {
      pageNode.onRemoveChild(this.hostSlotRoot)
      pageNode.onRemoveChild(this)
      // 移除掉以后 清除掉pageNode引用，因为uni view层对于父节点移除会递归移除掉所有的子节点，避免子元素再view层二次卸载
      this.pageNode = null
      this.host.pageNode = null
      this.hostSlotRoot.pageNode = null
    }
  }

  restoreHost() {
    // const clearShadowDom = (
    //   element: any & { _shadowRoot?: AppShadowDomElement }
    // ) => {
    //   // console.log('delete shadow dom ref', element)
    //   delete element._shadowRoot
    // }

    // Array.from(this.host?.childNodes || []).forEach((e) => clearShadowDom(e))
    // Array.from(this.childNodes).forEach((e) => clearShadowDom(e))

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

    // @ts-ignore
    // hostSlotRoot.pageNode = host.pageNode
    // hostSlotRoot.nodeId = host.pageNode.genId()
    // this.pageNode = host.pageNode
    // this.nodeId = host.pageNode.genId()

    const shadowRoot = this
    Object.defineProperty(host, 'shadowRoot', {
      configurable: true,
      enumerable: true,
      get() {
        // console.log('phony shadowRoot', shadowRoot)
        return shadowRoot
      },
    })

    Object.defineProperty(shadowRoot, 'childNodes', {
      configurable: true,
      enumerable: true,
      get() {
        // console.log('phony childNodes')
        return host.childNodes
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
          return function (...args: any[]) {
            args.forEach((n) => {
              if (n) {
                if (method === 'removeChild') {
                  delete n.parentNode
                } else {
                  Object.defineProperty(n, 'parentNode', {
                    configurable: true,
                    enumerable: true,
                    get() {
                      // console.log('get parent parentNode', shadowRoot)
                      return shadowRoot
                    },
                    set(value) {
                      // console.log(
                      //   'set parentNode ',
                      //   value === host,
                      //   value === shadowRoot
                      // )
                    },
                  })
                }
              }
            })
            // console.log('shadow dom method', method, args)
            // @ts-ignore
            return originShadowMethod.apply(host, args)
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
          return function (...args: any[]) {
            const [node, before] = args
            const slotName =
              (node.nodeType === NODE_TYPE_ELEMENT &&
                node.getAttribute('slot')) ||
              AppDefaultSlotName

            const targetSlot = shadowRoot.getSlotElement(slotName)

            // console.log('host method', targetSlot, method, args)

            try {
              if (
                before &&
                before.parentElement instanceof AppSlotElement &&
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

  distributeSlotElement(slot: AppSlotElement) {
    const slotName = slot.name
    const slots = this.slotElements.get(slotName) ?? []
    this.slotElements.set(slotName, slots)

    slots.push(slot)

    if (slots.length > 1) {
      return
    }

    const nodes = Array.from(this.hostSlotRoot.childNodes) as any[]
    // console.log('distributeSlotElement nodes', nodes)
    nodes.forEach((child) => {
      const childSlotName =
        child.nodeType === NODE_TYPE_ELEMENT
          ? (child as Element).getAttribute('slot') || AppDefaultSlotName
          : AppDefaultSlotName
      // console.log('distributeSlotElement', slotName, this, slot, child)
      if (slotName === childSlotName) {
        slot.appendChild(child)
      }
    })
  }

  restoreSlotElement(slot: AppSlotElement) {
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

export class AppSlotElement extends UniElement {
  fallbackContent: Node[] = []
  constructor(tag: string, container: any) {
    super(AppSlotName, container)

    // console.log('AppSlotElement init', tag, AppSlotName)
  }
  assign(...nodes: (Element | Text)[]) {
    // console.log('assign', nodes)
  }

  get name(): string {
    return this.getAttribute('name') || AppDefaultSlotName
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

  findMPShadowDom(): AppShadowDomElement | null {
    let node: any = this

    const findVueShadowDom = (dom: any) => {
      let node = dom.__vueParentComponent
      while (node) {
        const el = node.vnode.el?.parentElement
        if (node.$node && el instanceof AppShadowDomElement) {
          // console.log('vue parent node1', node)
          return el
        }
        node = node.parent
      }
      // console.log('findVueMPShadowDom not found', dom)
      return null
    }

    while (node) {
      if (node instanceof AppShadowDomElement) {
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

export const attachAppShadow = (host: any, options: any) => {
  const shadowDom = runtimeDocument.createElement(
    AppShadowDomName
  ) as any as AppShadowDomElement
  // const shadowDom = new AppShadowDomElement(AppShadowDomName)
  shadowDom.attachElement(host, options)
  // console.log('attachAppShadow', host, shadowDom)
  return shadowDom
}

export const initialAppShadow = () => {
  runtimeCustomElements.define(AppShadowDomName, AppShadowDomElement)
  // hook掉所有的slot元素
  runtimeCustomElements.define(HostSlotName, AppSlotElement)
}
