/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

import 'react'
declare module 'react' {
  type GetVuePropsType<T> = WithChildren<Omit<InstanceType<T>['$props'], 'ref'>>

  type WithChildren<T = {}> = {
    children?: any
    ref?: RefObject<any>
  } & T

  namespace JSX {
    interface IntrinsicElements {
      'wd-input': GetVuePropsType<
        typeof import('wot-design-uni/components/wd-input/wd-input.vue').default
      >
      'wd-button': GetVuePropsType<
        typeof import('wot-design-uni/components/wd-button/wd-button.vue').default
      >
      'wd-popup': GetVuePropsType<
        typeof import('wot-design-uni/components/wd-popup/wd-popup.vue').default
      >
      'wd-action-sheet': GetVuePropsType<
        typeof import('wot-design-uni/components/wd-action-sheet/wd-action-sheet.vue').default
      >
      'wd-calendar': GetVuePropsType<
        typeof import('wot-design-uni/components/wd-calendar/wd-calendar.vue').default
      >
      'wd-card': GetVuePropsType<
        typeof import('wot-design-uni/components/wd-card/wd-card.vue').default
      >
    }
  }
}
