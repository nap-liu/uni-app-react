// @ts-nocheck
// 补全app的阉割版本vue的custom element能力
import { UniElement } from '@js-css/uni-app-react'
import { defineComponent, nextTick, render, warn, createVNode } from 'vue'
import { hyphenate } from '@vue/shared'

export function defineCustomElement(options: any) {
  const Comp = defineComponent(options)

  class VueCustomElement extends VueElement {
    static def: any
    constructor(tag: string, container: any, initialProps?: any) {
      super(tag, container, Comp, initialProps)
    }
  }
  VueCustomElement.def = Comp
  return VueCustomElement
}

export class VueElement extends UniElement {
  _def: any
  _props: any
  _instance: any
  _connected: any
  _resolved: any
  _numberProps: any
  _ob: any
  constructor(tag: string, container: any, _def: any, _props = {}) {
    super(tag, container)
    this._def = _def
    this._props = _props
    this._instance = null
    this._connected = false
    this._resolved = false
    this._numberProps = null
    this._ob = null
    if (this.shadowRoot) {
      warn(
        `Custom element has pre-rendered declarative shadow root but is not defined as hydratable. Use \`defineSSRCustomElement\`.`
      )
    }
    this.attachShadow({
      mode: 'open',
    })
    if (!this._def.__asyncLoader) {
      this._resolveProps(this._def)
    }
  }
  connectedCallback() {
    this._connected = true
    if (!this._instance) {
      if (this._resolved) {
        this._update()
      } else {
        this._resolveDef()
      }
    }
  }
  disconnectedCallback() {
    this._connected = false
    // if (this._ob) {
    //   this._ob.disconnect()
    //   this._ob = null
    // }
    nextTick(() => {
      if (!this._connected) {
        // console.log('remove element before')
        render(null, this.shadowRoot)
        // console.log('remove element after')
        this._instance = null
      }
    })
  }
  /**
   * resolve inner component definition (handle possible async component)
   */
  _resolveDef() {
    this._resolved = true
    // for (let i = 0; i < this.attributes.length; i++) {
    //   this._setAttr(this.attributes[i].name)
    // }
    // this._ob = new MutationObserver((mutations) => {
    //   for (const m of mutations) {
    //     this._setAttr(m.attributeName)
    //   }
    // })
    // this._ob.observe(this, {
    //   attributes: true,
    // })
    const resolve2 = (def2: any, isAsync = false) => {
      // const { props, styles } = def2
      // let numberProps
      // if (props && !isArray(props)) {
      //   for (const key in props) {
      //     const opt = props[key]
      //     if (opt === Number || (opt && opt.type === Number)) {
      //       if (key in this._props) {
      //         this._props[key] = toNumber(this._props[key])
      //       }
      //       ;(numberProps ||
      //         (numberProps = /* @__PURE__ */ Object.create(null)))[
      //         camelize(key)
      //       ] = true
      //     }
      //   }
      // }
      // this._numberProps = numberProps
      if (isAsync) {
        this._resolveProps(def2)
      }
      // this._applyStyles(styles)
      this._update()
    }
    const asyncDef = this._def.__asyncLoader
    if (asyncDef) {
      asyncDef().then((def2: any) => resolve2(def2, true))
    } else {
      resolve2(this._def)
    }
  }
  _resolveProps(def2: any) {}
  // _setAttr(key) {
  //   let value = this.hasAttribute(key) ? this.getAttribute(key) : void 0
  //   const camelKey = camelize(key)
  //   if (this._numberProps && this._numberProps[camelKey]) {
  //     value = toNumber(value)
  //   }
  //   this._setProp(camelKey, value, false)
  // }
  // /**
  //  * @internal
  //  */
  // _getProp(key) {
  //   return this._props[key]
  // }
  // /**
  //  * @internal
  //  */
  // _setProp(key, val, shouldReflect = true, shouldUpdate = true) {
  //   if (val !== this._props[key]) {
  //     this._props[key] = val
  //     if (shouldUpdate && this._instance) {
  //       this._update()
  //     }
  //     if (shouldReflect) {
  //       if (val === true) {
  //         this.setAttribute(hyphenate(key), '')
  //       } else if (typeof val === 'string' || typeof val === 'number') {
  //         this.setAttribute(hyphenate(key), val + '')
  //       } else if (!val) {
  //         this.removeAttribute(hyphenate(key))
  //       }
  //     }
  //   }
  // }
  _update() {
    render(this._createVNode(), this.shadowRoot)
  }
  _createVNode() {
    const vnode = createVNode(this._def, { ...this._props })
    if (!this._instance) {
      vnode.ce = (instance: any) => {
        this._instance = instance
        instance.isCE = true
        if (true) {
          instance.ceReload = (newStyles) => {
            // if (this._styles) {
            //   this._styles.forEach((s) => this.shadowRoot.removeChild(s))
            //   this._styles.length = 0
            // }
            this._applyStyles(newStyles)
            this._instance = null
            this._update()
          }
        }
        const dispatch = (event, args) => {
          this.dispatchEvent(
            new CustomEvent(event, {
              detail: args,
            })
          )
        }
        instance.emit = (event, ...args) => {
          dispatch(event, args)
          if (hyphenate(event) !== event) {
            dispatch(hyphenate(event), args)
          }
        }
        let parent = this
        while ((parent = parent && (parent.parentNode || parent.host))) {
          if (parent instanceof VueElement) {
            instance.parent = parent._instance
            instance.provides = parent._instance.provides
            break
          }
        }
      }
    }
    return vnode
  }

  _applyStyles(styles: any) {
    //   if (styles) {
    //     styles.forEach((css) => {
    //       const s = document.createElement('style')
    //       s.textContent = css
    //       this.shadowRoot.appendChild(s)
    //       if (true) {
    //         ;(this._styles || (this._styles = [])).push(s)
    //       }
    //     })
    //   }
  }
}
