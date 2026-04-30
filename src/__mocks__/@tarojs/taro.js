const taro = {
  navigateTo:              jest.fn(),
  navigateBack:            jest.fn(),
  showToast:               jest.fn(),
  pageScrollTo:            jest.fn(),
  getStorageSync:          jest.fn(() => null),
  setStorageSync:          jest.fn(),
  login:                   jest.fn(({ success } = {}) => success?.({ code: 'mock_code' })),
  request:                 jest.fn(({ success } = {}) => success?.({ data: { rates: { CNY: 4.5 } }, statusCode: 200 })),
  requestSubscribeMessage: jest.fn(() => Promise.resolve()),
  getCurrentInstance:      jest.fn(() => ({ router: { params: {} } })),
  useLoad:                 jest.fn(),
  useUnload:               jest.fn(),
  useDidShow:              jest.fn(),
}

// __esModule: true tells Babel's interop to use this object directly.
// `default` covers `import Taro from '@tarojs/taro'`.
// Spreading taro covers named imports like `import { useDidShow } from '@tarojs/taro'`.
module.exports = { __esModule: true, default: taro, ...taro }
