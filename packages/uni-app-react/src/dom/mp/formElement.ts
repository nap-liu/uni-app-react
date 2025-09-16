import { MPHTMLElement } from './element'
import { MPEvent } from './events'

export class MPFormElement extends MPHTMLElement {
  get type() {
    return this.getAttribute('type') ?? ''
  }
  set type(val: string) {
    this.setAttribute('type', val)
  }

  get value() {
    return this.getAttribute('value') ?? ''
  }
  set value(val: string) {
    this.setAttribute('value', val)
  }

  get checked() {
    return this.getAttribute('checked') ?? ''
  }
  set checked(val: string) {
    this.setAttribute('checked', val)
  }

  get selected() {
    return this.getAttribute('selected') ?? ''
  }
  set selected(val: string) {
    this.setAttribute('selected', val)
  }

  public dispatchEvent(event: MPEvent) {
    if (event.mpEvent) {
      const val = event.mpEvent.detail.value
      if (event.type === 'change') {
        this.attributes.set('value', val)
      } else if (event.type === 'input') {
        this.value = val
      }
    }
    return super.dispatchEvent(event)
  }
}
