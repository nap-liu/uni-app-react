import {
  MPHTMLElement,
  MpEvent,
  createEvent,
  hook,
} from '@js-css/uni-app-react'

type DispatchEvent = {
  node: MPHTMLElement
  event: MpEvent
}

hook.on('dispatchEvent', (data: DispatchEvent) => {
  const { event, node } = data
  if (event.type === 'tap') {
    event.type = 'click'
  } else if (event.type === 'focus') {
    event.type = 'focusin'
  } else if (event.type === 'blur') {
    event.type = 'focusout'
  }
  node.dispatchEvent(createEvent(event, node))
})
