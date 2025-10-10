import { Render, RenderContext } from '@js-css/uni-app-react'
import {
  createElement,
  Component,
  ErrorInfo,
  forwardRef,
  Fragment,
  ReactElement,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { uid } from './util'

export type RootElementProps = {
  $documentInstance: any
  $vm: any
}

export class ErrorBoundary extends Component<any> {
  componentDidCatch(error: globalThis.Error, errorInfo: ErrorInfo): void {
    console.log('ErrorBoundary', error, errorInfo)
  }

  render() {
    return this.props.children
  }
}

export const RootElement = forwardRef<Render, RootElementProps>(
  (props, ref) => {
    const { $documentInstance, $vm } = props
    const map = useRef(new Map<number, ReactElement>())
    const [, _update] = useState({})
    const forceUpdate = () => {
      _update({})
    }

    const render = useMemo(() => {
      return {
        $documentInstance,
        $vm,
        render: (element: ReactElement) => {
          const id = uid()
          map.current.set(id, element)
          forceUpdate()
          return id
        },
        update: (id: number, element: ReactElement) => {
          map.current.set(id, element)
          forceUpdate()
          return id
        },
        unmount: (id: number) => {
          map.current.delete(id)
          forceUpdate()
        },
      }
    }, [$documentInstance, $vm])

    useImperativeHandle(ref, () => render, [render])

    // vite 预编译会忽略编译插件，这种情况只有h5下才会出现
    // #ifdef H5
    return createElement(
      ErrorBoundary,
      null,
      createElement(
        RenderContext.Provider,
        { value: render },
        Array.from(map.current.entries()).map(([key, element]) =>
          createElement(Fragment, { key: key }, element)
        )
      )
    )
    // #endif

    // vite 预编译会忽略编译插件，这种情况只有h5下才会出现
    // #ifndef H5
    return (
      <ErrorBoundary>
        <RenderContext.Provider value={render}>
          {Array.from(map.current.entries()).map(([key, element]) => (
            <Fragment key={key}>{element}</Fragment>
          ))}
        </RenderContext.Provider>
      </ErrorBoundary>
    )
    // #endif
  }
)
