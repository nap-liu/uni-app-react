export * from './consts'
export * from './document'
export * from './element'
export * from './events'
export * from './node'
export * from './render'
export * from './style'
export * from './tokenList'
export * from './uid'
export * from './utils'
export * from './rootElement'
export * from './alias'

import { MPDocument } from './document'

const mpDocument = new MPDocument()

// #ifdef MP-WEIXIN
// @ts-ignore
wx.doc = mpDocument
// #endif

export { mpDocument }
