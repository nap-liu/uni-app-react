# API 文档

## Render 对象接口如下

```ts
export type Render = {
  // 内置的document的组件实例对象
  $documentInstance: DocumentComponentInstance
  // react.vue 的组件实例对象
  $vm: any
  // 渲染React组件方法
  render(element: ReactElement): number
  // 更新已经渲染的React组件方法
  update(id: number, element: ReactElement): number
  // 卸载已经渲染的React组件方法
  unmount(id: any): void
}
```

## Vue 环境中的组件

### react.vue 组件

该组件提供了React的渲染入口，并对外提供`Render`对象，该对象可以进行React的渲染、更新、卸载能力，并且对外提供原生的组件实例对象，用于进行`createSelectorQuery`等操作。

#### 事件对象

| 事件    | 参数   | 说明         |
| ------- | ------ | ------------ |
| mounted | Render | 组件挂载完成 |

#### 导出对象

| 名称   | 类型   | 说明              |
| ------ | ------ | ----------------- |
| render | Render | React渲染操作对象 |

## React 环境中 Hook API

### `useRender(): Render` 获取当前上下文中的渲染对象

```tsx
import { useRender, View, Button } from '@js-css/uni-app-react'

const Comp = () => {
  // 获取当前上下文中的渲染对象
  const render = useRender()

  const handleClick = () => {
    const id = render.render(<View>Hello React</View>)
    setTimeout(() => {
      render.update(id, <View>Update Hello React</View>)
      setTimeout(() => {
        render.unmount(id)
      }, 2000)
    }, 2000)
  }

  return (
    <View>
      <Button onClick={handleClick}>Click Me</Button>
    </View>
  )
}
```

### connectVueObserver() 连接Vue的响应式数据到React组件中

通过高阶组件可以让普通的React组件支持Vue的响应式对象自动进行更新

```tsx
import { connectVueObserver, View, Text } from '@js-css/uni-app-react'
import { ref } from 'vue'

const count = ref(0)
const Comp = connectVueObserver((props: any) => {
  return (
    <View>
      <Text>{count.value}</Text>
    </View>
  )
})
```
