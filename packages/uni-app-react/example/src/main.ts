import { createSSRApp } from 'vue'
import App from './App.vue'

import VueProxy from './components/vue-proxy.vue'
export function createApp() {
  const app = createSSRApp(App)

  app.component('vue-proxy', VueProxy)

  return {
    app,
  }
}
