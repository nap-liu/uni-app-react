import { createContext, ReactElement, useContext } from 'react'
import type { MPRootElement } from '@js-css/uni-app-react'
import { inject, Ref } from 'vue'

export type DocumentComponentInstance = {
  react: {
    render: (element: ReactElement | null) => void
  }
  rootElement: MPRootElement
} & Record<string, any>

export type Render = {
  $documentInstance: DocumentComponentInstance
  $vm: any
  render(element: ReactElement): number
  update(id: number, element: ReactElement): number
  unmount(id: any): void
}

export const RenderContext = createContext<Render | null>(null)

export const useRender = () => {
  return useContext(RenderContext)!
}

export const vueRenderContext = Symbol.for('vue-render-context')

export const useRenderInVue = () => {
  return inject<Ref<Render>>(vueRenderContext)
}
