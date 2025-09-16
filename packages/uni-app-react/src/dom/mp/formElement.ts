import { CHANGE, CHECKED, INPUT, SELECTED, TYPE, VALUE } from './consts'
import { MPHTMLElement } from './element'
import { MPEvent } from './events'

export class MPFormElement extends MPHTMLElement {
  get type() {
    return this.getAttribute(TYPE) ?? ''
  }
  set type(val: string) {
    this.setAttribute(TYPE, val)
  }

  get value() {
    return this.getAttribute(VALUE) ?? ''
  }
  set value(val: string) {
    this.setAttribute(VALUE, val)
  }

  get checked() {
    return this.getAttribute(CHECKED) ?? ''
  }
  set checked(val: string) {
    this.setAttribute(CHECKED, val)
  }

  get selected() {
    return this.getAttribute(SELECTED) ?? ''
  }
  set selected(val: string) {
    this.setAttribute(SELECTED, val)
  }

  public dispatchEvent(event: MPEvent) {
    if (event.mpEvent) {
      const val = event.mpEvent.detail.value
      if (event.type === CHANGE) {
        this.attributes.set(VALUE, val)
      } else if (event.type === INPUT) {
        this.value = val as any
      }
    }
    return super.dispatchEvent(event)
  }
}
