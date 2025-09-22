import { componentAlias } from '@js-css/uni-app-react'
import { eventHandler } from './common'

let properties = 'properties'

// #ifdef MP-ALIPAY
properties = 'props'
// #endif

export default Component({
  options: {
    multipleSlots: true,
    virtualHost: true,
  },
  [properties]: {
    i: {
      type: Object,
      value: componentAlias.view._num,
    },
    l: String,
  },
  methods: {
    eh: eventHandler,
  },
})
