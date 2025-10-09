// customElements registry
export * from './common'

// #ifdef MP
import { mpDocument } from './mp'
export * from './mp'
// @ts-ignore
export const runtimeDocument = mpDocument as any as Document
// #endif

// #ifdef H5
import { h5Document } from './h5'
export * from './h5'
// @ts-ignore
export const runtimeDocument = h5Document
// #endif

// #ifdef APP
export * from './app'
import { appDocument } from './app'
// @ts-ignore
export const runtimeDocument = appDocument as any as Document
// #endif
