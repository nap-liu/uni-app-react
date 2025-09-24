import {
  Input as NativeInput,
  InputProps as NativeInputProps,
  View,
} from '@js-css/uni-app-react'
import { PropsWithChildren, useState } from 'react'

export type InputProps = PropsWithChildren<{} & NativeInputProps>
export const Input = (props: InputProps) => {
  const { value, placeholder } = props
  const [focus, setFocus] = useState(false)
  if (!focus) {
    return (
      <View
        className='h-32px b b-#f00 b-solid'
        onClick={() => {
          setFocus(true)
        }}
      >
        {value ? <View>{value}</View> : <View>{placeholder || '请输入'}</View>}
      </View>
    )
  }
  return (
    <NativeInput
      {...props}
      focus
      onBlur={() => {
        setFocus(false)
      }}
      onInput={(e) => props.onChange?.(e.detail.value)}
    />
  )
}
