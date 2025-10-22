import { MPRootElement } from './rootElement'
import { ShortName, TEXT_NODE, UpdateQueueType } from './consts'
import type { MPDocument } from './document'
import { MPEventTarget } from './events'
import { render } from './render'
import { uid } from './uid'

export class MPNode extends MPEventTarget {
  sid: string = ''
  ownerDocument: MPDocument | null = null
  childNodes: MPNode[] = []
  nodeType: number
  nodeName: string

  get parentNode(): MPNode | null {
    return this.parent as MPNode
  }

  set parentNode(parent) {
    this.parent = parent
  }

  constructor(type: number, name: string) {
    super()
    this.nodeType = type
    this.nodeName = name
    this.sid = uid()
  }

  get _root(): MPRootElement | null {
    return this.parentNode?._root || null
  }

  render(node = this) {
    return render(node)
  }

  appendChild<T extends MPNode>(child: T): T {
    if (child.parentNode) {
      child.parentNode.removeChild(child)
    }

    this.childNodes.push(child)
    child.parentNode = this
    const idx = this.childNodes.length - 1
    this._root?.addNode(child)
    this._root?.enqueueUpdate(() => ({
      node: child,
      type: UpdateQueueType.AppendChild,
      value: {
        [this._path + `.${ShortName.children}[${idx}]`]: render(child),
      },
    }))

    return child
  }

  removeChild<T extends MPNode>(child: T): T {
    const i = this.childNodes.indexOf(child)
    if (i === -1) {
      throw new Error('removeChild: not found')
    }
    this.childNodes.splice(i, 1)
    child.parentNode = null
    this._root?.removeNode(child)
    this._root?.enqueueUpdate(() => ({
      node: this,
      type: UpdateQueueType.RemoveChild,
      value: {
        [this._path + `.${ShortName.children}`]: this.childNodes.map((item) =>
          render(item)
        ),
      },
    }))

    return child
  }

  insertBefore<T extends MPNode>(child: T, ref: MPNode | null): T {
    if (!ref) {
      return this.appendChild(child)
    }
    const i = this.childNodes.indexOf(ref)
    if (i === -1) throw new Error('insertBefore: ref not found')
    if (child.parentNode) {
      child.parentNode.removeChild(child)
    }
    this.childNodes.splice(i, 0, child)
    child.parentNode = this
    this._root?.addNode(child)
    this._root?.enqueueUpdate(() => ({
      node: this,
      type: UpdateQueueType.InsertBefore,
      value: {
        [this._path + `.${ShortName.children}`]: this.childNodes.map((item) =>
          render(item)
        ),
      },
    }))

    return child
  }

  get firstChild(): MPNode | null {
    return this.childNodes[0] || null
  }

  get lastChild(): MPNode | null {
    return this.childNodes[this.childNodes.length - 1] || null
  }

  get nextSibling(): MPNode | null {
    if (!this.parentNode) return null
    const siblings = this.parentNode.childNodes
    const i = siblings.indexOf(this)
    return siblings[i + 1] || null
  }

  get previousSibling(): MPNode | null {
    if (!this.parentNode) return null
    const siblings = this.parentNode.childNodes
    const i = siblings.indexOf(this)
    return siblings[i - 1] || null
  }

  get nodeValue(): string | null {
    return null
  }
  set nodeValue(value: string | null) {}

  get textContent(): string | null {
    return this.childNodes.map((c) => c.textContent ?? '').join('')
  }
  set textContent(value: string | null) {
    this.childNodes = []
    if (value) {
      this.appendChild(new MPText(value))
    }
  }

  get _path(): string {
    if ('path' in this) return this.path as string
    if (!this.parentNode) return ''
    const idx = this.parentNode.childNodes.indexOf(this)
    return `${this.parentNode._path}.${ShortName.children}[${idx}]`
  }

  toString(indent = 0): string {
    return `${' '.repeat(indent)}[MPNode ${this.nodeName}]`
  }
}

export class MPCharacterData extends MPNode {
  _value: string = ''

  constructor(type: number, data: string) {
    super(type, '#text')
    this._value = data
  }

  get length() {
    return this._value.length
  }

  substringData(offset: number, count: number) {
    return this._value.substring(offset, offset + count)
  }

  appendData(str: string) {
    this._value += str
    this.enqueueTextUpdate()
  }

  deleteData(offset: number, count: number) {
    this._value =
      this._value.slice(0, offset) + this._value.slice(offset + count)
    this.enqueueTextUpdate()
  }

  insertData(offset: number, str: string) {
    this._value = this._value.slice(0, offset) + str + this._value.slice(offset)
    this.enqueueTextUpdate()
  }

  replaceData(offset: number, count: number, str: string) {
    this._value =
      this._value.slice(0, offset) + str + this._value.slice(offset + count)
    this.enqueueTextUpdate()
  }

  get textContent(): string | null {
    return this._value
  }
  set textContent(value: string | null) {
    this._value = value ?? ''
    this.enqueueTextUpdate()
  }

  get data() {
    return this.textContent
  }

  set data(value: string | null) {
    this.textContent = value
  }

  get nodeValue(): string | null {
    return this.textContent
  }

  set nodeValue(value: string | null) {
    this.textContent = value
  }

  private enqueueTextUpdate() {
    this._root?.enqueueUpdate(() => ({
      node: this,
      type: UpdateQueueType.UpdateText,
      value: {
        [this._path + `.${ShortName.value}`]: this._value,
      },
    }))
  }
}

export class MPText extends MPCharacterData {
  constructor(data: string) {
    super(TEXT_NODE, data)
  }

  toString(indent = 0) {
    return ' '.repeat(indent) + this.data
  }
}
