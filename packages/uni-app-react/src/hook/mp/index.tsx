import { HookType, createEvent, hook } from '@js-css/uni-app-react'
import { DispatchEvent } from '../types'

// // preact 会把 focus、blur事件转换成可冒泡的focusin、focusout事件
hook.on(HookType.beforeDispatchEvent, (data: DispatchEvent) => {
  const { event } = data
  if (event.type === 'tap') {
    event.type = 'click'
  } else if (event.type === 'focus') {
    event.type = 'focusin'
  } else if (event.type === 'blur') {
    event.type = 'focusout'
  }
})

hook.on(HookType.dispatchEvent, (data: DispatchEvent) => {
  const { node, event } = data
  node.dispatchEvent(createEvent(event, node))
})
