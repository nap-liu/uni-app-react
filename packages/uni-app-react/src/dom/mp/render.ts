import { hook, HookType } from '../../hook'
import { componentAlias } from './alias'
import { CLASS, ID, NAME, ShortName, SLOT, SLOT_VIEW, STYLE } from './consts'
import { MPHTMLElement } from './element'
import { MPCharacterData, MPNode } from './node'

function resolveViewTemplate(
  node: MPHTMLElement
):
  | 'slot-view'
  | 'catch-view'
  | 'click-view'
  | 'pure-view'
  | 'static-view'
  | 'view' {
  const bindtap = node.hasEvent('click')
  const bindtouchstart = node.hasEvent('touchstart')
  const bindtouchmove = node.hasEvent('touchmove')
  const bindtouchend = node.hasEvent('touchend')
  const bindtouchcancel = node.hasEvent('touchcancel')
  const bindlongtap = node.hasEvent('longtap')
  const bindanimationstart = node.hasEvent('animationstart')
  const bindanimationiteration = node.hasEvent('animationiteration')
  const bindanimationend = node.hasEvent('animationend')
  const bindtransitionend = node.hasEvent('transitionend')

  const hasSlot = node.getAttribute(SLOT)

  const catchMove = node.getAttribute('catchMove')
  const hoverClass = node.getAttribute('hoverClass')
  const hoverStartTime = node.getAttribute('hoverStartTime')
  const hoverStayTime = node.getAttribute('hoverStayTime')
  const hoverStopPropagation = node.getAttribute('hoverStopPropagation')
  const animation = node.getAttribute('animation')

  const hasTap = bindtap
  const hasTouchEvent =
    bindtouchstart ||
    bindtouchmove ||
    bindtouchend ||
    bindtouchcancel ||
    bindlongtap

  const hasHover =
    hoverClass ||
    hoverStartTime !== undefined ||
    hoverStayTime !== undefined ||
    !!hoverStopPropagation

  const hasAnimation =
    animation ||
    bindanimationstart ||
    bindanimationiteration ||
    bindanimationend ||
    bindtransitionend

  // 只有view支持slot
  if (hasSlot) return SLOT_VIEW

  // 优先级最高：catchTouchMove
  if (catchMove) return 'catch-view'

  // bindtap + touch 事件 → view
  if (hasTap && hasTouchEvent) return 'view'

  // 只有 bindtap → click-view
  if (hasTap && !hasTouchEvent && !hasHover && !hasAnimation)
    return 'click-view'

  // hover / animation → static-view
  if (!hasTap && (hasHover || hasAnimation)) return 'static-view'

  // 纯静态 → pure-view
  if (!hasTap && !hasTouchEvent && !hasHover && !hasAnimation)
    return 'pure-view'

  // fallback
  return 'view'
}

export function getElementAlias(node: MPNode) {
  let viewName = node.nodeName.toLowerCase()

  switch (viewName) {
    case 'view':
      viewName = resolveViewTemplate(node as MPHTMLElement)
      break
    case 'text':
    case 'image':
      if (node.hasAnyEvent()) {
        viewName = viewName
      } else {
        viewName = `static-${viewName}`
      }
      break
  }

  const alias = componentAlias[viewName] || {
    _num: viewName,
  }
  return {
    viewName,
    alias,
  }
}

export function render(node: MPNode, onlySelf = false) {
  let vnode: any = {}

  const { alias, viewName } = getElementAlias(node)

  if (node instanceof MPCharacterData) {
    vnode = {
      sid: node.sid,
      nn: alias._num,
      // t: node.nodeName,
      v: node.textContent,
    }
  } else if (node instanceof MPHTMLElement) {
    vnode = {
      sid: node.sid,
      // uid: node.id,
      nn: alias._num,
      // t: node.nodeName,
      cl: node.className,
      cn: onlySelf ? [] : node.childNodes.map((c) => render(c)),
    }

    if (node.id) {
      vnode.uid = node.id
    }

    const st = node.style.cssText
    if (st) {
      vnode.st = st
    }

    node.attributes.forEach((value, key) => {
      if (key === SLOT && viewName === SLOT_VIEW) {
        key = NAME
      }

      const nextKey = alias[key] || key

      if (key === CLASS || key === ID || key === STYLE) {
        return
      }
      if (nextKey) {
        vnode[nextKey] = value
      }
    })
  } else if (node instanceof MPNode) {
    vnode = {
      // t: node.nodeName,
      cn: onlySelf ? [] : node.childNodes.map((c) => render(c)),
    }
  }

  return vnode
}

export function getAliasProp(
  node: MPNode,
  path: string,
  propName: string,
  propValue: string
) {
  const { alias, viewName } = getElementAlias(node)

  const props = {} as Record<string, any>

  let key = propName
  const value = propValue

  const keyMap: Record<string, string> = {
    class: ShortName.class,
    id: ShortName.id,
  }

  let aliasKey = key
  if (key === SLOT && viewName === SLOT_VIEW) {
    aliasKey = NAME
  }

  const nextKey = alias[aliasKey] || keyMap[key] || key

  const payload = {
    node,
    name: propName,
    aliasName: nextKey,
    value,
  }

  hook.emit(HookType.propToAlias, payload)

  if (nextKey) {
    props[`${path}.${nextKey}`] = payload.value
  }

  return props
}
