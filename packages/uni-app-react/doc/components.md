# 内置组件

在当前的框架设计中React中的组件分为三种，`Host组件`、`内置组件`、`Vue组件`

Host组件需要通过，`import { View, Text, Button } from '@js-css/uni-app-react'` 来引入

因为在当前框架的设计中小写的组件都是`Vue`的组件，默认情况下所有的小写组件都会自动转换成`Vue代理组件`!!

```tsx
import { Button, View, Text } from '@js-css/uni-app-react'

export default function App() {
  return (
    <View>
      <Text>Hello UniApp React</Text>
      <Button>Click Me</Button>
    </View>
  )
}
```

## 直接使用Host组件

不推荐直接使用Host组件

如果你需要直接使用Host提供的组件，可以通过在JSX中增加`useHostElement`属性来实现

```tsx
import { Button, View, Text } from '@js-css/uni-app-react'

export default function App() {
  return (
    <View>
      <button useHostElement>am host element</button>
      <Text>Hello UniApp React</Text>
      <Button>Click Me</Button>
    </View>
  )
}
```
