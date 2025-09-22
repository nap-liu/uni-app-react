import * as alipay from './alipay'
import * as weixin from './weixin'

export * from './generator'

const platformTemplate = {
  'mp-alipay': alipay,
  'mp-weixin': weixin,
}

export const getPlatformTemplate = (
  platform: string
): typeof alipay | typeof weixin => {
  return platformTemplate[platform]
}
