import { View, Text, Button, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { getTripDetail } from '../../services/api'
import './index.scss'

export default function TripDetail() {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router.params
    const { tripId } = params

    getTripDetail(tripId)
      .then(data => setTrip(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View className='loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  if (!trip) {
    return (
      <View className='loading'>
        <Text>行程信息不存在</Text>
      </View>
    )
  }

  return (
    <ScrollView className='trip-detail' scrollY>

      {/* 状态横幅 */}
      <View className={`status-banner status-banner--${trip.status}`}>
        <Text className='status-banner__text'>
          {trip.status === 'matched' ? '🎉 匹配成功！' : '⏳ 匹配中...'}
        </Text>
      </View>

      {/* 导游信息 */}
      {trip.guide && (
        <View className='section'>
          <Text className='section__title'>你的导游</Text>
          <View className='guide-card'>
            <View className='guide-card__avatar'>
              <Text className='guide-card__avatar-text'>
                {trip.guide.name?.charAt(0)}
              </Text>
            </View>
            <View className='guide-card__info'>
              <Text className='guide-card__name'>{trip.guide.name}</Text>
              <Text className='guide-card__bio'>{trip.guide.bio}</Text>
              <View className='guide-card__tags'>
                {trip.guide.specialties?.map(s => (
                  <View key={s} className='mini-tag'>{s}</View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 团友信息 */}
      {trip.groupMembers?.length > 0 && (
        <View className='section'>
          <Text className='section__title'>你的团友</Text>
          {trip.groupMembers.map((member, i) => (
            <View key={i} className='member-card'>
              <View className='member-card__avatar'>
                <Text>{member.nickname?.charAt(0) || '友'}</Text>
              </View>
              <View className='member-card__info'>
                <Text className='member-card__name'>{member.nickname || `旅伴 ${i + 1}`}</Text>
                <Text className='member-card__desc'>{member.groupType} · {member.travelStyle}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 行程概览 */}
      <View className='section'>
        <Text className='section__title'>行程概览</Text>
        <View className='itinerary'>
          <View className='itinerary__row'>
            <Text className='itinerary__label'>出发日期</Text>
            <Text className='itinerary__value'>{trip.departureDate}</Text>
          </View>
          <View className='itinerary__row'>
            <Text className='itinerary__label'>旅行天数</Text>
            <Text className='itinerary__value'>{trip.days} 天</Text>
          </View>
          <View className='itinerary__row'>
            <Text className='itinerary__label'>活动安排</Text>
            <View className='mini-tag-group'>
              {trip.activities?.map(a => (
                <View key={a} className='mini-tag'>{a}</View>
              ))}
            </View>
          </View>
          <View className='itinerary__row'>
            <Text className='itinerary__label'>预算区间</Text>
            <Text className='itinerary__value'>{trip.budget}</Text>
          </View>
        </View>
      </View>

      {/* 联系导游 */}
      {trip.guide && (
        <View className='cta-section'>
          <Button
            className='contact-btn'
            onClick={() => Taro.setClipboardData({ data: trip.guide.wechatId })}
          >
            复制导游微信号联系
          </Button>
          <Text className='cta-note'>有任何问题，也可以直接联系我们的客服</Text>
        </View>
      )}

    </ScrollView>
  )
}
