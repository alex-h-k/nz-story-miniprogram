export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/trip-form/index',
    'pages/waiting/index',
    'pages/trip-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1a7a4a',
    navigationBarTitleText: '新西兰定制小团游',
    navigationBarTextStyle: 'white'
  },
  // 订阅消息权限（用于匹配成功后推送通知）
  permission: {
    'scope.userLocation': {
      desc: '用于显示附近导游'
    }
  }
})
