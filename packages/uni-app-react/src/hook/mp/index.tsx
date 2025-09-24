import {
  MPHTMLElement,
  MpEvent,
  createEvent,
  hook,
} from '@js-css/uni-app-react'

type DispatchEvent = {
  dom: MPHTMLElement
  event: MpEvent
}

hook.on('dispatchEvent', (data: DispatchEvent) => {
  const { event, dom } = data
  if (event.type === 'tap') {
    event.type = 'click'
  } else if (event.type === 'focus') {
    event.type = 'focusin'
  } else if (event.type === 'blur') {
    event.type = 'focusout'
  }
  dom.dispatchEvent(createEvent(event, dom))
})
