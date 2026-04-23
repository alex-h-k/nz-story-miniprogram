import { View, Text, Button, Image } from '@tarojs/components'
import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import mtcookBg from '../../assets/mtcook-bg.svg'
import './index.scss'

export default function Waiting() {
  const [dots, setDots] = useState('.')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const timer = setInterval(() => {
      if (!mountedRef.current) return
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 600)
    return () => {
      mountedRef.current = false
      clearInterval(timer)
    }
  }, [])

  const handleSubscribe = async () => {
    // TODO: replace 'YOUR_TEMPLATE_ID' with the real template ID from WeChat MP console
    const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'
    if (TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
      Taro.showToast({ title: '通知功能配置中，敬请期待', icon: 'none', duration: 2000 })
      return
    }
    try {
      await Taro.requestSubscribeMessage({ tmplIds: [TEMPLATE_ID] })
      Taro.showToast({ title: '开启成功，匹配到团友会第一时间通知你', icon: 'none', duration: 2500 })
    } catch (e) {
      console.log('订阅取消', e)
    }
  }

  return (
    <View className='waiting'>
      <Image className='waiting__bg' src={mtcookBg} mode='aspectFill' />

      <View className='waiting__content'>
      {/* 顶部动画区 */}
      <View className='waiting__top'>
        <View className='waiting__animation'>
          <View className='pulse-ring' />
          <View className='pulse-ring pulse-ring--delay' />
          <Text className='waiting__emoji'>🧭</Text>
        </View>
        <Text className='waiting__title'>正在为你匹配{dots}</Text>
        <Text className='waiting__subtitle'>根据你的偏好，为你寻找志同道合的团友和导游</Text>
      </View>

      {/* 中部信息卡片 */}
      <View className='waiting__info'>
        <View className='info-item'>
          <Text className='info-item__icon'>⏱</Text>
          <Text className='info-item__text'>通常在 24-48 小时内完成匹配</Text>
        </View>
        <View className='info-item'>
          <Text className='info-item__icon'>💬</Text>
          <Text className='info-item__text'>匹配成功后我们会通过微信联系你</Text>
        </View>
        <View className='info-item'>
          <Text className='info-item__icon'>🔄</Text>
          <Text className='info-item__text'>如有变化可随时修改你的行程意愿</Text>
        </View>
      </View>

      {/* 底部按钮区 */}
      <View className='waiting__actions'>
        <Button className='subscribe-btn' onClick={handleSubscribe}>
          开启微信通知，第一时间知道匹配结果
        </Button>
        <Text className='waiting__note' onClick={() => Taro.navigateBack()}>
          返回首页
        </Text>
      </View>

      </View>{/* end waiting__content */}
    </View>
  )
}
