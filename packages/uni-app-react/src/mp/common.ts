import {
  createEvent,
  MPDocument,
  MpEvent,
  runtimeDocument,
} from '@js-css/uni-app-react'

export const eventHandler = (event: MpEvent) => {
  const currentTarget = event.currentTarget!
  const detail = event.detail
  const __args__ = detail?.__args__

  const dom = (runtimeDocument as any as MPDocument).getElementBySid(
    currentTarget.dataset?.sid
  )
  if (dom) {
    const mpEvent = Array.isArray(__args__) ? __args__[0] : event
    dom.dispatchEvent(createEvent(mpEvent, dom))

    if (mpEvent.type === 'tap') {
      const clickEvent = createEvent(mpEvent, dom)
      clickEvent.type = 'click'
      dom.dispatchEvent(clickEvent)
    }
  }
}
