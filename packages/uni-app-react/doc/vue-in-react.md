# Vue in React

由于整个工程架构是基于Vue的，UniApp的生态也是基于Vue的，  
因此如果只是UniApp中支持使用React那么应用场景会极其有限，  
所以经过不断地尝试终于寻找到了解决方案  
可以在本插件的体系下可以无缝衔接使用Vue的组件  
并且该特性也是跨平台的！！！

## 使用方法

首先在 `./src/main.ts` 中注册一个组件名为 `vue-proxy` 的全局Vue组件，这个 `vue-proxy` 组件名是固定的不能修改(因为UniApp框架要求这个地方的名字必须是静态的)

```ts
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
```

## 组件注册

想要在React中使用Vue组件，需要在vue-proxy.vue中注册一下组件（该方法也是不得已而为之，因为种种原因不能直接用动态组件）

凡是在该组件中注册的Vue组件，都可以直接在React中直接使用！！！

```vue
<template>
  <template v-if="node?.t === 'wd-button'">
    <wd-button v-bind="node.p">
      <slot></slot>
    </wd-button>
  </template>
  <template v-else-if="node?.t === 'wd-popup'">
    <wd-popup v-bind="node.p" :ref="onRef">
      <slot></slot>
    </wd-popup>
  </template>
  <template v-else-if="node?.t === 'wd-action-sheet'">
    <wd-action-sheet v-bind="node.p" :ref="onRef">
      <slot></slot>
    </wd-action-sheet>
  </template>
  <template v-else-if="node?.t === 'wd-calendar'">
    <wd-calendar v-bind="node.p" :ref="onRef">
      <slot></slot>
    </wd-calendar>
  </template>
</template>
<script lang="ts" setup>
import { useVueProxy } from '@js-css/uni-app-react'
import wdPopup from 'wot-design-uni/components/wd-popup/wd-popup.vue'
import wdActionSheet from 'wot-design-uni/components/wd-action-sheet/wd-action-sheet.vue'
import wdCalendar from 'wot-design-uni/components/wd-calendar/wd-calendar.vue'
import wdCard from 'wot-design-uni/components/wd-card/wd-card.vue'
import wdButton from 'wot-design-uni/components/wd-button/wd-button.vue'
const node = useVueProxy()

const onRef = (expose: any) => {
  if (node.value?.p?.ref) {
    node.value.p.ref(expose)
  }
}
</script>
```

## 组件使用

上面注册了`wd-button`、`wd-popup`、`wd-action-sheet`、`wd-calendar`等组件，可以直接在React中使用

```tsx
const handleRender = () => {
  const HelloReact = (props: any) => {
    const [value, setValue] = useState(200)
    const { unmount } = props
    const [visible, setVisible] = useState(true)
    useEffect(() => {
      if (!visible) {
        setTimeout(() => {
          // 调用传入的卸载组件的方法
          unmount()
        }, 500)
      }
    }, [visible])

    // 这里直接调用wd-popup组件
    return (
      <wd-popup
        model-value={visible}
        root-portal={true}
        position='bottom'
        onEnter={(event) => {
          console.log('enter')
        }}
        onClose={() => {
          console.log('close')
        }}
      >
        <Button onClick={() => setValue((v) => v + 1)}>count +</Button>
        <Button onClick={() => setValue((v) => v - 1)}>count -</Button>
        <Button
          onClick={(event) => {
            console.log('remove', event)
            setVisible(false)
          }}
        >
          remove
        </Button>
      </wd-popup>
    )
  }

  // 调用 react.vue 组件的渲染方法，渲染React组件
  // 该方法会返回一个组件id，可以通过该id更新、卸载组件
  const id = renderRef.value?.render(
    <HelloReact
      unmount={() => {
        // 传递卸载方法到组件中
        renderRef.value?.unmount(id)
      }}
    />
  )
}
```

## 插槽

有些Vue组件是通过插槽来进行内容分发的，比如`wd-card`组件，他的内容是通过默认插槽来进行分发的

代理插槽

```vue
<template>
  ...
  <template v-else-if="node?.t === 'wd-card'">
    <wd-card type="rectangle" v-bind="node.p">
      <!-- 代理命名插槽 -->
      <template #title>
        <slot name="title"></slot>
      </template>
      <!-- 代理默认插槽 -->
      <slot></slot>
      <template #footer>
        <slot name="footer"></slot>
      </template>
    </wd-card>
  </template>
  ...
</template>
```

使用插槽

```tsx
const Card = () => {
  return (
    <wd-card>
      <View slot='title'>title</View>
      <View>content</View>
      <View slot='footer'>footer</View>
    </wd-card>
  )
}
```

## ref使用

有很多的vue组件是通过ref拿到实例进行操作的，比如下面的`wd-calendar`组件，他提供了两种方式，一种是包裹展示的组件他会自动监听点击事件打开日历， 一种是通过组件实例拿到`open`方法进行打开，下面这个实例就是用于演示`ref`的使用

插件内部会自动转化内部的`VueRef`为`ReactRef`，所以这里一定不要使用出错，所有在`React`中使用的都一定是`React`体系中的API

### 注册Ref

在`vue-proxy.vue`中注册组件`Ref`给插件的回调函数

```vue
<template>
  <template v-else-if="node?.t === 'wd-calendar'">
    <!-- 注册ref回调 -->
    <wd-calendar v-bind="node.p" :ref="onRef">
      <slot></slot>
    </wd-calendar>
  </template>
</template>
<script lang="ts" setup>
import { useVueProxy } from '@js-css/uni-app-react'
import wdCalendar from 'wot-design-uni/components/wd-calendar/wd-calendar.vue'
const node = useVueProxy()

// 注册Ref给插件
const onRef = (expose: any) => {
  if (node.value?.p?.ref) {
    node.value.p.ref(expose)
  }
}
</script>
```

### 使用Ref

```tsx
const Switch = () => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!visible) {
      renderRef.value?.unmount(id)
    }
  }, [visible])

  const [time, setTime] = useState(new Date())

  // 创建一个React的Ref对象
  const calendarRef = useRef<CalendarExpose>(null)

  return (
    <>
      <wd-popup
        rootPortal={true}
        model-value={visible}
        onClick-modal={() => {
          setVisible(false)
        }}
      >
        <Button
          onClick={() => {
            // 这里可以直接调用组件公开的方法
            calendarRef.current?.open()
          }}
        >
          vue ref method
        </Button>
        <wd-calendar
          // 传递React的Ref对象给组件
          ref={calendarRef}
          rootPortal={true}
          modelValue={time.getTime()}
          onConfirm={(result) => {
            console.log('calendar confirm', result)
            setTime(new Date(result.value))
          }}
        >
          select date
        </wd-calendar>
      </wd-popup>
    </>
  )
}
```

## 类型声明

React的JSX语法体系是通过大小写来区分自定义和原生组件的，小写为原生组件，大写为组件  
Vue的语法体系下是忽略组件大小写是通过显式注册来区分自定义组件和内置组件

两者的特性正好可以互补，基于这种识别特性，我把Vue的组件全都是用小写形式来注册到React的JSX体系中，可以完美的无缝衔接两个框架的语法！！！

随之而来的就是需要解决一下JSX中的类型声明，可以通过如下方式解决Vue组件在React中声明的类型

```ts
import 'react'
declare module 'react' {
  // 拿到Vue组件的 props 类型，并且去掉ref属性
  type GetVuePropsType<T> = WithChildren<Omit<InstanceType<T>['$props'], 'ref'>>

  // 添加children、ref属性
  type WithChildren<T = {}> = {
    children?: any
    ref?: RefObject<any>
  } & T

  namespace JSX {
    interface IntrinsicElements {
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
```
