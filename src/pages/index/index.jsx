import { View, Text, Image, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import heroImg from '../../assets/hero-nz.svg'
import './index.scss'

export default function Index() {
  const [pressing, setPressing] = useState(false)

  // Pre-parse the trip-form JS bundle while the user reads this page,
  // so navigation is instant when they tap the button.
  useEffect(() => {
    try {
      Taro.preloadPage({ url: '/pages/trip-form/index' })
    } catch (_) {}
  }, [])

  const handleStart = () => {
    Taro.navigateTo({ url: '/pages/trip-form/index' })
  }

  return (
    <View className='index'>

      <View className='hero'>
        <Image className='hero__bg' src={heroImg} mode='aspectFill' />
        <View className='hero__overlay' />
        <View className='hero__content'>
          <Text className='hero__title'>新西兰南岛</Text>
          <Text className='hero__subtitle'>定制华人小团游</Text>
          <Text className='hero__desc'>2-3人成团 · 全程中文 · 私人定制路线</Text>
        </View>
      </View>

      <View className='features'>
        <View className='feature-item'>
          <Text className='feature-item__icon'>🧭</Text>
          <Text className='feature-item__title'>个性化路线</Text>
          <Text className='feature-item__desc'>按你的兴趣定制，不跟大团跑</Text>
        </View>
        <View className='feature-item'>
          <Text className='feature-item__icon'>👥</Text>
          <Text className='feature-item__title'>志同道合团友</Text>
          <Text className='feature-item__desc'>系统匹配相似偏好的旅伴</Text>
        </View>
        <View className='feature-item'>
          <Text className='feature-item__icon'>🚗</Text>
          <Text className='feature-item__title'>华人专业导游</Text>
          <Text className='feature-item__desc'>本地中文导游全程陪同</Text>
        </View>
      </View>

      <View className='steps'>
        <Text className='steps__title'>如何运作</Text>
        <View className='step'>
          <View className='step__num'>1</View>
          <View className='step__info'>
            <Text className='step__name'>填写你的行程意愿</Text>
            <Text className='step__desc'>告诉我们你想去哪、想玩什么、什么时间出发</Text>
          </View>
        </View>
        <View className='step'>
          <View className='step__num'>2</View>
          <View className='step__info'>
            <Text className='step__name'>匹配志同道合的团友</Text>
            <Text className='step__desc'>我们帮你找到2-3位行程高度匹配的旅伴</Text>
          </View>
        </View>
        <View className='step'>
          <View className='step__num'>3</View>
          <View className='step__info'>
            <Text className='step__name'>出发享受旅程</Text>
            <Text className='step__desc'>华人导游全程中文陪同，一切细节帮你搞定</Text>
          </View>
        </View>
      </View>

      <View className='cta'>
        <Button
          className={`cta__btn ${pressing ? 'cta__btn--pressing' : ''}`}
          onTouchStart={() => setPressing(true)}
          onTouchEnd={() => { setPressing(false); handleStart() }}
          onTouchCancel={() => setPressing(false)}
        >
          开始定制我的行程
        </Button>
        <Text className='cta__note'>免费提交，无需预付款</Text>
      </View>

    </View>
  )
}
