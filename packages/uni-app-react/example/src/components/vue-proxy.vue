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
  <template v-else-if="node?.t === 'wd-card'">
    <wd-card type="rectangle" v-bind="node.p">
      <template #title v-if="!node.p.title">
        <slot name="title"></slot>
      </template>
      <slot></slot>
      <template #footer>
        <slot name="footer"></slot>
      </template>
    </wd-card>
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
