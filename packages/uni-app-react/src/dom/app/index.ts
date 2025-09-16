import { patchUniApp } from './element'
import { getPageContainer } from './utils'

export * from './element'

// patch uni app 框架修复一些细节问题
patchUniApp()

interface GlobalENV {
  createElement(tag: string, container: any): any
  createTextNode(text: string, container: any): any
  createComment(text: string, container: any): any
}

declare global {
  var Vue: GlobalENV
}

const GlobalVue = Vue

export const appDocument = {
  createElementNS(namespaceURI: string, tag: string) {
    return appDocument.createElement(tag)
  },
  createElement(tag: string) {
    const container = getPageContainer()
    return GlobalVue.createElement(tag, container)
  },
  createTextNode(data: string) {
    const container = getPageContainer()
    return GlobalVue.createTextNode(String(data), container)
  },
  createComment(data: string) {
    const container = getPageContainer()
    return GlobalVue.createComment(String(data), container)
  },
}
