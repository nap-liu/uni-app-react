export const ELEMENT_NODE = 1
export const TEXT_NODE = 3
export const DOCUMENT_NODE = 9
export const DOCUMENT_ROOT = 100

export const controlledComponent = new Set([
  'input',
  'checkbox',
  'picker',
  'picker-view',
  'radio',
  'slider',
  'switch',
  'textarea',
])

export const TARGET = 'target'
export const CURRENT_TARGET = 'currentTarget'
export const TYPE = 'type'
export const CONFIRM = 'confirm'
export const TIME_STAMP = 'timeStamp'
export const KEY_CODE = 'keyCode'
export const PROPS = 'props'
export const DATASET = 'dataset'
export const OBJECT = 'object'
export const VALUE = 'value'
export const INPUT = 'input'
export const CHANGE = 'change'
export const CHECKED = 'checked'
export const SELECTED = 'selected'
export const EMPTY_OBJ = {}
export const ID = 'id'
export const CLASS = 'class'
export const PATH = 'path'
export const STYLE = 'style'
export const SLOT = 'slot'
export const SLOT_VIEW = 'slot-view'
export const NAME = 'name'

export const ShortName = {
  nodeType: 'nn',
  children: 'cn',
  class: 'cl',
  style: 'st',
  id: 'uid',
  value: 'v',
}

export enum UpdateQueueType {
  InsertBefore = 1,
  RemoveChild,
  AppendChild,
  ChangeElement,
  UpdateText,
  UpdateStyle,
  SetAttribute,
  RemoveAttribute,
}
