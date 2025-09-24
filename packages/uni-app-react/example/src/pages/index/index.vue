<template>
  <button @click="handleRender">render</button>
  <button @click="handleRender2">render2</button>
  <ReactRender @mounted="handleMounted"></ReactRender>
</template>

<script setup lang="tsx">
import { Button, connectVueObserver, Render, View } from '@js-css/uni-app-react'
import ReactRender from '@js-css/uni-app-react/react.vue'
import { useEffect, useRef, useState } from 'react'
import { ref } from 'vue'
import type { CalendarExpose } from 'wot-design-uni/components/wd-calendar/types'
import { Input } from './Input'

const renderRef = ref<Render>()

const Test = () => {
  return (
    <View>
      <View style={{ border: '1px solid red' }}>
        <Input />
      </View>
    </View>
  )
}
const handleMounted = (event: Render) => {
  renderRef.value = event
  console.log('react mounted', event)
  event.render(<Test />)
}

const visibleRef = ref(false)
const VueActionSheet = () => {
  return (
    <wd-action-sheet
      modelValue={visibleRef.value}
      title='动作面板'
      rootPortal={true}
      onCancel={() => {
        console.log('cancel')
        visibleRef.value = false
      }}
      onSelect={(event) => {
        console.log('onselect', event)
        visibleRef.value = false
      }}
      onClick-modal={() => {
        console.log('click modal')
        visibleRef.value = false
      }}
      actions={[
        {
          name: '动作1',
        },
        {
          name: '动作2',
        },
      ]}
    ></wd-action-sheet>
  )
}

const AutoVueActionSheet = connectVueObserver(VueActionSheet)

const handleRender2 = () => {
  const Switch = () => {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
      if (!visible) {
        renderRef.value?.unmount(id)
      }
    }, [visible])

    const [time, setTime] = useState(new Date())

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
              calendarRef.current?.open()
            }}
          >
            vue ref method
          </Button>
          <wd-button
            onClick={() => {
              visibleRef.value = true
            }}
          >
            open sheet
          </wd-button>
          <wd-calendar
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

          <wd-card>
            <View slot='title'>title</View>
            <View>{time.toISOString()}</View>
            <View slot='footer'>
              <wd-button type='error'>button</wd-button>
            </View>
          </wd-card>
        </wd-popup>

        <AutoVueActionSheet></AutoVueActionSheet>
      </>
    )
  }

  const id = renderRef.value?.render(<Switch></Switch>)
}
const handleRender = () => {
  const SubComponent = (props: any) => {
    const { children } = props
    const [value, setValue] = useState(100)
    useEffect(() => {
      const timer = setInterval(() => {
        setValue((value) => {
          if (value >= 110) {
            clearInterval(timer)
          }
          return value + 1
        })
      }, 1000)
      return () => {
        clearInterval(timer)
      }
    }, [])
    return (
      <View>
        sub component
        {value}
        {value % 2 === 0 ? children : null}
      </View>
    )
  }
  const HelloReact = (props: any) => {
    const [value, setValue] = useState(200)
    const { unmount } = props
    const [visible, setVisible] = useState(true)
    useEffect(() => {
      if (!visible) {
        setTimeout(() => {
          unmount()
        }, 500)
      }
    }, [visible])
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
        <SubComponent a={2}>
          <View>
            {true}
            {false}
          </View>
        </SubComponent>
        <View>{value % 2 === 0 ? <View>hello react</View> : null}</View>
        {value % 2 === 1 ? (
          <View
            onClick={() => {
              console.log('click view')
            }}
          >
            click view
            {value}
          </View>
        ) : (
          <View>
            pure view
            {value}
          </View>
        )}
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

  const id = renderRef.value?.render(
    <HelloReact
      unmount={() => {
        renderRef.value?.unmount(id)
      }}
    />
  )
}
</script>

<style></style>
