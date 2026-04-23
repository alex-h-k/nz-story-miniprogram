import Taro from '@tarojs/taro'

// 开发环境切换这里的 BASE_URL
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api/v1'
  : 'https://your-production-domain.com/api/v1'

// 通用请求封装
const request = (method, url, data = {}) => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'X-Wechat-Openid': Taro.getStorageSync('openid') || '',
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(res.data?.message || '请求失败'))
        }
      },
      fail: (err) => reject(err),
    })
  })
}

// ---- 游客端 API ----

// 提交行程意愿
export const submitTrip = (tripData) =>
  request('POST', '/trips', { trip: tripData })

// 获取行程详情
export const getTripDetail = (tripId) =>
  request('GET', `/trips/${tripId}`)

// 微信登录
export const wxLogin = (code) =>
  request('POST', '/auth/wechat', { code })
