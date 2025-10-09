import { hook, HookType } from '../../hook'
import { UpdateQueueType } from './consts'
import { MPHTMLElement } from './element'
import { MPCustomEvent } from './events'

type MPNode = any

type UpdateQueue = () => {
  node: MPNode
  type: UpdateQueueType
  value: Record<string, any>
}

export class MPRootElement extends MPHTMLElement {
  path: string
  isUpdating = false
  isCleaning = false
  updateQueue: UpdateQueue[] = []
  cleanupQueue: MPNode[] = []

  constructor(path = 'root') {
    super('#root')
    this.path = path
  }
  get _path() {
    return this.path
  }
  get _root() {
    return this
  }

  addNode(node: MPNode) {
    this.registerNode(node)
  }

  registerNode(node: MPNode) {
    if (!this.ownerDocument) {
      return
    }
    // if (node instanceof MPText) {
    //   return
    // }
    const ownerDocument = this.ownerDocument
    if (!ownerDocument.allNode.has(node.sid)) {
      ownerDocument.allNode.set(node.sid, node)
    }
    for (const child of node.childNodes) {
      this.registerNode(child)
    }
  }

  removeNode(node: MPNode) {
    this.enqueueClean(node)
  }

  enqueueUpdate = (update: UpdateQueue) => {
    this.updateQueue.push(update)

    if (!this.isUpdating) {
      this.isUpdating = true
      setTimeout(() => this.flushUpdates())
    }
  }

  enqueueClean = (child: MPNode) => {
    this.cleanupQueue.push(child)
    if (!this.isCleaning) {
      this.isCleaning = true
      setTimeout(() => this.flushCleanup())
    }
  }

  flushUpdates() {
    const updates = this.updateQueue.slice()

    const patch = updates.reduce((diff, update) => {
      const payload = update()
      hook.emit(HookType.enqueueUpdate, payload)
      if (typeof payload.value === 'object' && payload.value !== null) {
        Object.assign(diff, payload.value)
      }
      return diff
    }, {})

    this.dispatchEvent(new MPCustomEvent('update:patch', { detail: patch }))
    this.flushCleanup()
    this.updateQueue = []
    this.isUpdating = false
  }

  flushCleanup(batchSize = 500) {
    if (!this.ownerDocument) {
      this.isCleaning = false
      return
    }
    const ownerDocument = this.ownerDocument

    let processed = 0
    const stack: MPNode[] = []

    while (
      (stack.length || this.cleanupQueue.length) &&
      processed < batchSize
    ) {
      if (!stack.length) {
        const next = this.cleanupQueue.shift()
        if (!next) break
        stack.push(next)
      }

      const node = stack.pop()!
      ownerDocument.allNode.delete(node.sid)
      processed++

      node.parentNode = null
      const children = node.childNodes
      node.childNodes = []

      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i])
      }

      if (processed >= batchSize && stack.length) {
        this.cleanupQueue = stack.concat(this.cleanupQueue)
        break
      }
    }

    if (this.cleanupQueue.length) {
      setTimeout(() => this.flushCleanup(batchSize), 0)
    } else {
      this.isCleaning = false
    }
  }
}
