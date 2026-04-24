import { View, Text, Button, Input, Textarea, Picker, Image, Map } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { submitTrip } from '../../services/api'
import tekapoBg from '../../assets/tekapo-bg.svg'
import queenstownBg from '../../assets/queenstown-bg.svg'
import oamaruBg from '../../assets/oamaru-bg.svg'

const BG_BY_STEP = { 1: tekapoBg, 2: queenstownBg, 3: oamaruBg }
import './index.scss'

// Returns tomorrow as 'YYYY-MM-DD'
const getTomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

// 南岛主要景点（含坐标，用于地图）
const ATTRACTIONS = [
  { id: 'christchurch', name: '基督城',       lat: -43.532, lon: 172.636 },
  { id: 'kaikoura',    name: '凯库拉',        lat: -42.401, lon: 173.682 },
  { id: 'tekapo',      name: '特卡波湖',      lat: -44.006, lon: 170.479 },
  { id: 'pukaki',      name: '普卡基湖',      lat: -44.177, lon: 170.173 },
  { id: 'mtcook',      name: '库克山',        lat: -43.735, lon: 170.096 },
  { id: 'wanaka',      name: '瓦纳卡',        lat: -44.703, lon: 169.132 },
  { id: 'queenstown',  name: '皇后镇',        lat: -45.031, lon: 168.663 },
  { id: 'te_anau',     name: '蒂阿瑙',        lat: -45.414, lon: 167.719 },
  { id: 'milford',     name: '米尔福德峡湾',  lat: -44.641, lon: 167.927 },
  { id: 'doubtful',    name: '毫无疑问峡湾',  lat: -45.390, lon: 167.063 },
  { id: 'dunedin',     name: '但尼丁',        lat: -45.879, lon: 170.503 },
  { id: 'oamaru',      name: '奥马鲁',        lat: -45.099, lon: 170.971 },
  { id: 'franz',       name: '弗朗茨冰川',    lat: -43.387, lon: 170.183 },
  { id: 'fox',         name: '福克斯冰川',    lat: -43.463, lon: 170.016 },
  { id: 'hokitika',    name: '霍基蒂卡',      lat: -42.717, lon: 170.969 },
  { id: 'nelson',      name: '尼尔森',        lat: -41.271, lon: 173.284 },
]

// 预设线路（stops 有序，每站含亮点）
const PRESET_ROUTES = [
  {
    id: 'kaikoura',
    label: '凯库拉海岸线',
    badge: '1-2 天',
    color: '#1a6aaa',
    center: { lat: -42.9, lon: 173.1 }, scale: 8,
    stops: [
      {
        id: 'christchurch', name: '基督城', icon: '🏙',
        highlights: ['南岛最大城市，旅程出发点', '市区有轨电车游览', '植物园漫步'],
      },
      {
        id: 'kaikoura', name: '凯库拉', icon: '🐋',
        highlights: ['抹香鲸观赏（全年可见，世界最佳鲸鱼观测地之一）', '新西兰毛皮海豹聚集海滩', '与海豚一起游泳', '龙虾料理 & 新鲜海鲜市场', '凯库拉山脉雪顶海岸线美景'],
      },
      {
        id: 'christchurch', name: '基督城（返回）', icon: '🌅',
        highlights: ['沿 SH1 海岸公路返回', '可选择在凯库拉住一晚看日出'],
      },
    ],
  },
  {
    id: 'alpine',
    label: '内陆高原精华',
    badge: '4-6 天',
    color: '#1a7a4a',
    center: { lat: -44.3, lon: 170.0 }, scale: 7,
    stops: [
      {
        id: 'christchurch', name: '基督城', icon: '🏙',
        highlights: ['南岛门户城市，麦肯齐盆地入口'],
      },
      {
        id: 'tekapo', name: '特卡波湖', icon: '⭐',
        highlights: ['南半球最佳星空观测点（国际暗夜保护区）', '善牧教堂（Church of Good Shepherd）湖畔经典取景地', '羽扇豆花海（11月–1月花期）', '温泉泡汤同时仰望星河'],
      },
      {
        id: 'mtcook', name: '库克山', icon: '🏔',
        highlights: ['新西兰最高峰 Aoraki（3724m）', '胡克谷徒步（往返约 5km，终点胡克湖浮冰）', '塔斯曼冰川直升机游览', '库克山保护区星空观测'],
      },
      {
        id: 'wanaka', name: '瓦纳卡', icon: '🌊',
        highlights: ['瓦纳卡湖孤独树（That Wanaka Tree，网红打卡）', '皇冠山脉 & 里普顿峰徒步', 'Puzzling World 益智乐园', '冬季滑雪（Cardrona / Treble Cone）'],
      },
      {
        id: 'queenstown', name: '皇后镇', icon: '🎿',
        highlights: ['世界冒险之都', '天空缆车 + 餐厅俯瞰瓦卡蒂普湖全景', '高空跳伞 / 蹦极 / 喷射快艇', 'TSS Earnslaw 蒸汽船游湖', '米尔福德峡湾一日游出发点'],
      },
    ],
  },
  {
    id: 'southeast',
    label: '东南海岸回路',
    badge: '3-4 天',
    color: '#8a4a1a',
    center: { lat: -45.3, lon: 170.4 }, scale: 7,
    stops: [
      {
        id: 'queenstown', name: '皇后镇', icon: '🎿',
        highlights: ['冒险活动集散地，旅程起点'],
      },
      {
        id: 'dunedin', name: '但尼丁', icon: '🏛',
        highlights: ['爱丁堡风格苏格兰城市', '但尼丁火车站（新西兰最美火车站）', '奥塔哥半岛：皇家信天翁 & 黄眼企鹅观赏', 'Baldwin Street — 全球最陡住宅街'],
      },
      {
        id: 'oamaru', name: '奥马鲁', icon: '🐧',
        highlights: ['小蓝企鹅每日日落后归巢仪式（全球最小企鹅）', '维多利亚时代奶白色石灰岩建筑群', '新西兰毛皮海豹聚集地', '蒸汽朋克主题博物馆'],
      },
      {
        id: 'christchurch', name: '基督城', icon: '🏙',
        highlights: ['沿东海岸 SH1 返回', '可顺访提马鲁（Timaru）'],
      },
    ],
  },
  {
    id: 'full_loop',
    label: '南岛全环线',
    badge: '10-14 天',
    color: '#6a1a8a',
    center: { lat: -44.2, lon: 170.2 }, scale: 6,
    stops: [
      {
        id: 'christchurch', name: '基督城', icon: '🏙',
        highlights: ['出发 & 返回城市'],
      },
      {
        id: 'kaikoura', name: '凯库拉', icon: '🐋',
        highlights: ['观鲸、海豹、龙虾海鲜'],
      },
      {
        id: 'tekapo', name: '特卡波湖', icon: '⭐',
        highlights: ['星空暗夜保护区、善牧教堂、羽扇豆'],
      },
      {
        id: 'mtcook', name: '库克山', icon: '🏔',
        highlights: ['胡克谷徒步、冰川直升机游览'],
      },
      {
        id: 'wanaka', name: '瓦纳卡', icon: '🌊',
        highlights: ['孤独树、皇冠山脉徒步'],
      },
      {
        id: 'queenstown', name: '皇后镇', icon: '🎿',
        highlights: ['极限运动天堂、峡湾一日游出发点'],
      },
      {
        id: 'milford', name: '米尔福德峡湾', icon: '⛴',
        highlights: ['新西兰第八大奇观、峡湾游船赏瀑布海豹'],
      },
      {
        id: 'dunedin', name: '但尼丁', icon: '🏛',
        highlights: ['火车站、奥塔哥半岛企鹅信天翁'],
      },
      {
        id: 'oamaru', name: '奥马鲁', icon: '🐧',
        highlights: ['小蓝企鹅归巢、维多利亚建筑群'],
      },
      {
        id: 'christchurch', name: '基督城（返回）', icon: '🏙',
        highlights: ['完成南岛全环线'],
      },
    ],
  },
  {
    id: 'fiordland',
    label: '峡湾深度游',
    badge: '3-5 天',
    color: '#0a6a8a',
    center: { lat: -45.1, lon: 168.0 }, scale: 7,
    stops: [
      {
        id: 'queenstown', name: '皇后镇', icon: '🎿',
        highlights: ['峡湾之旅出发点'],
      },
      {
        id: 'te_anau', name: '蒂阿瑙', icon: '🦆',
        highlights: ['峡湾门户小镇', '蒂阿瑙湖（新西兰第二大湖）', '萤火虫洞穴探险（Te Ana-au Caves）', '高山鹦鹉 Kea 观察'],
      },
      {
        id: 'milford', name: '米尔福德峡湾', icon: '⛴',
        highlights: ['新西兰第八大奇观', '峡湾游船（含海豹岩、海豚、鲍恩瀑布）', '米特峰（Mitre Peak）正面壮景', '米尔福德音轨（Milford Track）徒步'],
      },
      {
        id: 'doubtful', name: '毫无疑问峡湾', icon: '🌿',
        highlights: ['新西兰最深峡湾（水深 421m）', '比米尔福德更幽静原始，人少景美', '峡湾游船过夜体验', '海豚、海豚 & 信天翁'],
      },
    ],
  },
]

// Deduplicate consecutive stops with same id (e.g. Christchurch return)
const getUniqueStopIds = (route) => {
  const seen = new Set()
  return route.stops.map(s => s.id).filter(id => {
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

const buildMarkers = (route) => {
  const ids = getUniqueStopIds(route)
  return ids.map((id, idx) => {
    const a = ATTRACTIONS.find(x => x.id === id)
    if (!a) return null
    const stop = route.stops.find(s => s.id === id)
    return {
      id: idx,
      latitude: a.lat,
      longitude: a.lon,
      callout: {
        content: stop ? `${stop.icon} ${a.name}` : a.name,
        color: route.color || '#1a7a4a',
        fontSize: 11,
        borderRadius: 4,
        padding: 5,
        display: 'ALWAYS',
        textAlign: 'center',
        bgColor: '#ffffff',
        borderColor: route.color || '#1a7a4a',
        borderWidth: 1,
      },
      width: 28,
      height: 40,
    }
  }).filter(Boolean)
}

const buildPolyline = (route) => {
  const ids = getUniqueStopIds(route)
  const points = ids
    .map(id => ATTRACTIONS.find(a => a.id === id))
    .filter(Boolean)
    .map(a => ({ latitude: a.lat, longitude: a.lon }))
  if (points.length < 2) return []
  return [{ points, color: (route.color || '#1a7a4a') + 'cc', width: 4, arrowLine: true }]
}

// 预算档次基准（基于新西兰私导市场实际价格）
// fixed  = 导游 + 专车每天固定费用（NZD，由全组均摊）
// variable = 每人每天变动费用（NZD，住宿 + 餐饮 + 活动）
// 参考：8人出行经济型约 $500/人/天（用户确认下限）
const BUDGET_TIERS = [
  {
    id: 'budget',
    label: '经济型',
    emoji: '🏕',
    fixed: 800,
    variable: 400,
    note: '私导 + 经济型住宿 · 自助餐饮 · 标准景点',
  },
  {
    id: 'mid',
    label: '舒适型',
    emoji: '🏨',
    fixed: 1100,
    variable: 600,
    note: '私导 + 4星酒店 · 部分餐饮含入 · 小众体验',
  },
  {
    id: 'luxury',
    label: '豪华型',
    emoji: '🏰',
    fixed: 1500,
    variable: 900,
    note: '高端私导 + 5星度假村 · 全程精致餐饮',
  },
]

// 每人每天 = (固定费 + 变动费 × 人数) / 人数
const calcPerPersonPerDay = (tier, n) => Math.round((tier.fixed + tier.variable * n) / n)


// Dominant sky colour per step — shown instantly before SVG decodes
const BG_COLOR_BY_STEP = { 1: '#1a3a6a', 2: '#0a1e40', 3: '#2a1050' }

export default function TripForm() {
  const [step, setStep] = useState(1) // 分步表单，共3步
  const [loading, setLoading] = useState(false)
  const [bgLoaded, setBgLoaded] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(4.5) // NZD → CNY fallback

  // Auto-fetch WeChat login code — only runs with a real AppID, not in DevTools
  useEffect(() => {
    try {
      const info = Taro.getAccountInfoSync?.()
      const appid = info?.miniProgram?.appId || ''
      if (!appid || appid === 'touristappid') return
      Taro.login({
        success: (res) => {
          if (res.code) Taro.setStorageSync('wxLoginCode', res.code)
        },
        fail: () => {},
      })
    } catch (_) {}
  }, [])

  // Fetch live NZD→CNY rate; skip in development (DevTools has no valid domain allowlist)
  // Fall back to 4.5 silently on any failure in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return
    try {
      Taro.request({
        url: 'https://open.er-api.com/v6/latest/NZD',
        method: 'GET',
        timeout: 5000,
        success: (res) => {
          try {
            const rate = res?.data?.rates?.CNY
            if (rate && typeof rate === 'number') setExchangeRate(parseFloat(rate.toFixed(2)))
          } catch (_) {}
        },
        fail: () => {},
      })
    } catch (_) {}
  }, [])

  const [form, setForm] = useState({
    departureDate: '',
    groupType: '',          // solo / couple / family / friends
    groupSize: '',          // auto '1' solo, '2' couple, picker for family/friends
    groupingPref: '',       // 'solo_group' | 'join_group'
    groupIdentity: '',      // 'male' | 'female' | 'mixed' | 'rainbow'  (我们是)
    isRainbow: '',          // solo join_group only: 'yes' | 'no'
    companionPref: '',      // 'any' | 'female_only' | 'rainbow_friendly'  (希望和)
    childCount: '',         // family/friends only: number of children (string)
    ageGroup: '',           // 18-25 / 26-35 / 36-45 / 46-55 / 55+
    preferredAgeGroup: '',  // 18-25 / 26-35 / 36-45 / 46-55 / 55+ / any
    preferredTotalSize: '', // preferred total tour group size (>= own group size + 1, max 10)
    routeMode: '',       // 'preset' | 'custom'
    selectedRoute: '',
    customDays: '',      // days for custom route (if different from step-1 days)
    budget: '',
    notes: '',
    contactType: '',     // 'self' | 'other'
    wechatId: '',
    wechatIdError: '',
  })

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleGroupTypeSelect = (id) => {
    setForm(prev => ({
      ...prev,
      groupType: id,
      groupSize: id === 'solo' ? '1' : id === 'couple' ? '2' : '',
      groupingPref: '',
      groupIdentity: '',
      isRainbow: '',
      companionPref: '',
      childCount: '',
      ageGroup: '',
      preferredAgeGroup: '',
      preferredTotalSize: '',
    }))
  }

  const handleGroupingPref = (pref) => {
    setForm(prev => ({
      ...prev,
      groupingPref: pref,
      ...(pref === 'solo_group' ? {
        groupIdentity: '',
        isRainbow: '',
        companionPref: '',
        preferredAgeGroup: '',
        preferredTotalSize: '',
      } : {}),
    }))
    if (pref === 'join_group') {
      setTimeout(() => {
        Taro.pageScrollTo({ selector: '.join-group-prefs', offsetTop: -20, duration: 300 })
      }, 100)
    }
  }

  const handleIsRainbow = (val) => {
    setForm(prev => ({
      ...prev,
      isRainbow: val,
      companionPref: val === 'yes' ? 'rainbow_friendly' : '',
    }))
  }

  // Returns the numeric own group size for min-total calculation
  const getOwnGroupSizeNum = () => {
    const s = (form.groupSize || '1').replace('+', '')
    return parseInt(s) || 1
  }

  // Adults = total group size minus children
  const getAdultCount = () => {
    return getOwnGroupSizeNum() - (parseInt(form.childCount) || 0)
  }

  const handleChildCount = (n) => {
    setForm(prev => ({ ...prev, childCount: n }))
  }

  const handleRouteModeSelect = (mode) => {
    setForm(prev => ({
      ...prev,
      routeMode: mode,
      selectedRoute: '',
      customDays: '',
    }))
  }

  // WeChat ID: 6-20 chars, must start with a letter, letters/digits/underscore/hyphen only
  const validateWechatId = (id) => {
    if (!id) return '请填写微信号'
    if (id.length < 6) return '微信号至少 6 位'
    if (id.length > 20) return '微信号最多 20 位'
    if (!/^[a-zA-Z]/.test(id)) return '微信号须以字母开头'
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id)) return '微信号只能包含字母、数字、下划线或横线'
    return ''
  }

  const handleWechatIdInput = (val) => {
    setForm(prev => ({
      ...prev,
      wechatId: val,
      wechatIdError: val ? validateWechatId(val) : '',
    }))
  }

  const handleRouteSelect = (routeId) => {
    setForm(prev => ({ ...prev, selectedRoute: routeId }))
  }

  const handleNext = () => {
    if (step === 1 && !form.departureDate) {
      Taro.showToast({ title: '请选择出发日期', icon: 'none' })
      return
    }
    if (step === 1 && form.departureDate < getTomorrow()) {
      Taro.showToast({ title: '出发日期不能早于明天', icon: 'none' })
      return
    }
    if (step === 1 && !form.groupType) {
      Taro.showToast({ title: '请选择出行人构成', icon: 'none' })
      return
    }
    if (step === 1 && (form.groupType === 'family' || form.groupType === 'friends') && !form.groupSize) {
      Taro.showToast({ title: '请选择出行人数', icon: 'none' })
      return
    }
    if (step === 1 && (form.groupType === 'family' || form.groupType === 'friends') && form.groupSize && form.childCount === '') {
      Taro.showToast({ title: '请选择小孩人数', icon: 'none' })
      return
    }
    if (step === 1 && !form.groupingPref) {
      Taro.showToast({ title: '请选择成团方式', icon: 'none' })
      return
    }
    if (step === 1 && form.groupingPref === 'join_group' && !form.groupIdentity) {
      Taro.showToast({ title: '请选择你们的群体类型', icon: 'none' })
      return
    }
    if (step === 1 && form.groupingPref === 'join_group' && !form.companionPref) {
      Taro.showToast({ title: '请选择组团偏好', icon: 'none' })
      return
    }
    if (step === 1 && form.groupingPref === 'join_group' && !form.ageGroup) {
      Taro.showToast({ title: '请选择你的年龄段', icon: 'none' })
      return
    }
    if (step === 1 && form.groupingPref === 'join_group' && !form.preferredAgeGroup) {
      Taro.showToast({ title: '请选择偏好同行者年龄段', icon: 'none' })
      return
    }
    if (step === 2 && !form.routeMode) {
      Taro.showToast({ title: '请选择线路规划方式', icon: 'none' })
      return
    }
    if (step === 2 && form.routeMode === 'preset' && !form.selectedRoute) {
      Taro.showToast({ title: '请选择一条推荐线路', icon: 'none' })
      return
    }
    if (step === 2 && form.routeMode === 'custom' && !form.customDays) {
      Taro.showToast({ title: '请填写旅行天数', icon: 'none' })
      return
    }
    setBgLoaded(false)
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    if (!form.contactType) {
      Taro.showToast({ title: '请选择联系方式', icon: 'none' })
      return
    }
    const wechatErr = validateWechatId(form.wechatId)
    if (wechatErr) {
      Taro.showToast({ title: wechatErr, icon: 'none' })
      return
    }

    setLoading(true)
    try {
      // 获取微信用户信息
      const userInfo = Taro.getStorageSync('userInfo')
      const payload = { ...form, userInfo }

      console.log('[TripForm] submitting form →', JSON.stringify(payload, null, 2))

      await submitTrip(payload)

      Taro.navigateTo({ url: '/pages/waiting/index' })
    } catch (err) {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='trip-form' style={{ backgroundColor: BG_COLOR_BY_STEP[step] }}>
      <Image
        className={`trip-form__bg ${bgLoaded ? 'trip-form__bg--loaded' : ''}`}
        src={BG_BY_STEP[step]}
        mode='aspectFill'
        onLoad={() => setBgLoaded(true)}
      />

      {/* 进度条 */}
      <View className='progress'>
        {[1, 2, 3].map(n => (
          <View key={n} className={`progress__dot ${step >= n ? 'progress__dot--active' : ''}`} />
        ))}
        <Text className='progress__text'>第 {step}/3 步</Text>
      </View>

      {/* Step 1：出行基本信息 */}
      {step === 1 && (
        <View className='form-step'>
          <Text className='form-step__title'>你打算什么时候出发？</Text>

          <View className='field'>
            <Text className='field__label'>出发日期</Text>
            <Picker
              mode='date'
              value={form.departureDate || getTomorrow()}
              start={getTomorrow()}
              onChange={e => updateForm('departureDate', e.detail.value)}
            >
              <View className={`field__picker ${!form.departureDate ? 'field__picker--placeholder' : ''}`}>
                <Text>{form.departureDate || '点击选择出发日期'}</Text>
                <Text className='field__picker-arrow'>›</Text>
              </View>
            </Picker>
          </View>

          {/* 你的出行人构成 */}
          <View className='field'>
            <Text className='field__label'>你的出行人构成</Text>
            <View className='tag-group'>
              {[
                { id: 'solo', label: '个人出行' },
                { id: 'couple', label: '情侣' },
                { id: 'family', label: '家庭' },
                { id: 'friends', label: '朋友' },
              ].map(item => (
                <View
                  key={item.id}
                  className={`tag ${form.groupType === item.id ? 'tag--active' : ''}`}
                  onClick={() => handleGroupTypeSelect(item.id)}
                >
                  {item.label}
                </View>
              ))}
            </View>
          </View>

          {/* 出行人数：情侣固定2人，家庭/朋友可选 */}
          {form.groupType === 'couple' && (
            <View className='field'>
              <Text className='field__label'>出行人数</Text>
              <View className='tag-group'>
                <View className='tag tag--active'>2 人</View>
              </View>
            </View>
          )}
          {(form.groupType === 'family' || form.groupType === 'friends') && (
            <View className='field'>
              <Text className='field__label'>出行人数</Text>
              <View className='tag-group tag-group--wrap'>
                {(form.groupType === 'family'
                  ? ['2', '3', '4', '5', '6+']
                  : ['2', '3', '4', '5', '6', '7', '8', '9', '10+']
                ).map(n => (
                  <View
                    key={n}
                    className={`tag ${form.groupSize === n ? 'tag--active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, groupSize: n, childCount: '' }))}
                  >
                    {n} 人
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── 小孩人数：家庭/朋友才显示 ── */}
          {(form.groupType === 'family' || form.groupType === 'friends') && form.groupSize && (
            <View className='field'>
              <Text className='field__label'>其中小孩人数</Text>
              <View className='tag-group tag-group--wrap'>
                {Array.from({ length: getOwnGroupSizeNum() }, (_, i) => String(i)).map(n => (
                  <View key={n}
                    className={`tag ${form.childCount === n ? 'tag--active' : ''}`}
                    onClick={() => handleChildCount(n)}>
                    {n} 人
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── 成团方式 ── */}
          {form.groupType && (
            <View className='field'>
              <View className='field__label-row'>
                <Text className='field__label'>成团方式</Text>
                <Text className='field__hint'>💡 组团出行，人均费用更低</Text>
              </View>
              <View className='tag-group'>
                {[
                  { id: 'solo_group', label: '单独成团' },
                  { id: 'join_group', label: '愿意和他人组团' },
                ].map(item => (
                  <View key={item.id}
                    className={`tag ${form.groupingPref === item.id ? 'tag--active' : ''}`}
                    onClick={() => handleGroupingPref(item.id)}>
                    {item.label}
                  </View>
                ))}
              </View>
            </View>
          )}

          {form.groupingPref === 'solo_group' && (
            <Text style={{ fontSize: '24rpx', color: '#888', display: 'block', textAlign: 'center', padding: '4rpx 0 8rpx' }}>
              ✓ 好的，我们会为你单独安排成团
            </Text>
          )}

          {/* ── 组团偏好（仅非独自出行且愿意组团时显示）── */}
          {form.groupingPref === 'join_group' && (
            <View className='join-group-prefs'>
              <View className='field'>
                <Text className='field__label'>你的年龄段</Text>
                <View className='tag-group tag-group--wrap'>
                  {['18-25', '26-35', '36-45', '46-55', '55+'].map(id => (
                    <View key={id}
                      className={`tag ${form.ageGroup === id ? 'tag--active' : ''}`}
                      onClick={() => updateForm('ageGroup', id)}>
                      {id === '55+' ? '55岁以上' : `${id}岁`}
                    </View>
                  ))}
                </View>
              </View>

              {form.groupType === 'solo' ? (
                <View className='field'>
                  <Text className='field__label'>我的性别</Text>
                  <View className='tag-group tag-group--wrap'>
                    {[
                      { id: 'male',   label: '男生' },
                      { id: 'female', label: '女生' },
                    ].map(item => (
                      <View key={item.id}
                        className={`tag ${form.groupIdentity === item.id ? 'tag--active' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, groupIdentity: item.id, isRainbow: '', companionPref: '' }))}>
                        {item.label}
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View className='field'>
                  <Text className='field__label'>我们是</Text>
                  <View className='tag-group tag-group--wrap'>
                    {[
                      { id: 'male',    label: '男生团' },
                      { id: 'female',  label: '女生团' },
                      { id: 'mixed',   label: '男女混合' },
                      { id: 'rainbow', label: '彩虹群体' },
                    ].map(item => (
                      <View key={item.id}
                        className={`tag ${form.groupIdentity === item.id ? 'tag--active' : ''}`}
                        onClick={() => updateForm('groupIdentity', item.id)}>
                        {item.label}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {form.groupType === 'solo' && form.groupIdentity && (
                <View className='field'>
                  <Text className='field__label'>是否属于彩虹群体？</Text>
                  <View className='tag-group'>
                    {[
                      { id: 'yes', label: '是' },
                      { id: 'no',  label: '否' },
                    ].map(item => (
                      <View key={item.id}
                        className={`tag ${form.isRainbow === item.id ? 'tag--active' : ''}`}
                        onClick={() => handleIsRainbow(item.id)}>
                        {item.label}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {(form.groupType !== 'solo' || form.isRainbow) && (
                <View className='field'>
                  <Text className='field__label'>希望和</Text>
                  <View className='tag-group tag-group--wrap'>
                    {(form.groupType === 'solo' && form.isRainbow === 'yes'
                      ? [{ id: 'rainbow_friendly', label: '彩虹友好' }]
                      : [
                          { id: 'any',              label: '不介意' },
                          { id: 'female_only',      label: '纯女生' },
                          { id: 'rainbow_friendly', label: '彩虹友好' },
                        ]
                    ).map(item => (
                      <View key={item.id}
                        className={`tag ${form.companionPref === item.id ? 'tag--active' : ''}`}
                        onClick={() => updateForm('companionPref', item.id)}>
                        {item.label}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View className='field'>
                <Text className='field__label'>偏好同行者年龄段</Text>
                <View className='tag-group tag-group--wrap'>
                  {[
                    { id: '18-25', label: '18-25岁' },
                    { id: '26-35', label: '26-35岁' },
                    { id: '36-45', label: '36-45岁' },
                    { id: '46-55', label: '46-55岁' },
                    { id: '55+', label: '55岁以上' },
                    { id: 'any', label: '不介意' },
                  ].map(item => (
                    <View key={item.id}
                      className={`tag ${form.preferredAgeGroup === item.id ? 'tag--active' : ''}`}
                      onClick={() => updateForm('preferredAgeGroup', item.id)}>
                      {item.label}
                    </View>
                  ))}
                </View>
              </View>

              {(() => {
                const minTotal = Math.min(getOwnGroupSizeNum() + 1, 10)
                const options = Array.from({ length: 10 - minTotal + 1 }, (_, i) => String(minTotal + i))
                return (
                  <View className='field'>
                    <Text className='field__label'>希望成团总人数（含自己，最多 10 人）</Text>
                    {options.length > 0 ? (
                      <View className='tag-group tag-group--wrap'>
                        {options.map(n => (
                          <View key={n}
                            className={`tag ${form.preferredTotalSize === n ? 'tag--active' : ''}`}
                            onClick={() => updateForm('preferredTotalSize', n)}>
                            {n} 人
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={{ fontSize: '24rpx', color: '#999' }}>你的出行人数已达上限，将单独成团</Text>
                    )}
                  </View>
                )
              })()}
            </View>
          )}

        </View>
      )}

      {/* Step 2：线路规划方式 */}
      {step === 2 && (
        <View className='form-step'>
          <Text className='form-step__title'>怎么规划你的线路？</Text>

          {/* 模式选择 */}
          <View className='route-mode-group'>
            <View
              className={`route-mode-card ${form.routeMode === 'preset' ? 'route-mode-card--active' : ''}`}
              onClick={() => handleRouteModeSelect('preset')}
            >
              <Text className='route-mode-card__icon'>🗺</Text>
              <Text className='route-mode-card__title'>选择推荐线路</Text>
              <Text className='route-mode-card__desc'>从热门经典路线中选一条，适合对南岛不熟悉的旅行者</Text>
            </View>
            <View
              className={`route-mode-card ${form.routeMode === 'custom' ? 'route-mode-card--active' : ''}`}
              onClick={() => handleRouteModeSelect('custom')}
            >
              <Text className='route-mode-card__icon'>🧑‍✈️</Text>
              <Text className='route-mode-card__title'>与私导商量定制线路</Text>
              <Text className='route-mode-card__desc'>告诉私导你的天数和喜好，由专属导游为你量身设计</Text>
            </View>
          </View>

          {/* ── 推荐线路 ── */}
          {form.routeMode === 'preset' && (
            <View>
              <View className='route-group'>
                {PRESET_ROUTES.map(route => {
                  const active = form.selectedRoute === route.id
                  return (
                    <View
                      key={route.id}
                      className={`route-card ${active ? 'route-card--active' : ''}`}
                      style={active ? { borderColor: route.color } : {}}
                      onClick={() => handleRouteSelect(route.id)}
                    >
                      <View className='route-card__header'>
                        <Text className='route-card__label'>{route.label}</Text>
                        <Text className='route-card__badge' style={{ background: route.color }}>{route.badge}</Text>
                      </View>
                      <Text className='route-card__desc'>
                        {route.stops.map(s => s.name).join(' → ')}
                      </Text>
                    </View>
                  )
                })}
              </View>

              {/* 地图 + 站点亮点 */}
              {form.selectedRoute && (() => {
                const route = PRESET_ROUTES.find(r => r.id === form.selectedRoute)
                return (
                  <View className='map-container'>
                    <Map
                      latitude={route.center.lat}
                      longitude={route.center.lon}
                      scale={route.scale}
                      markers={buildMarkers(route)}
                      polyline={buildPolyline(route)}
                      style={{ width: '100%', height: '380rpx' }}
                      showLocation={false}
                    />
                    <View className='stop-list'>
                      {route.stops.map((stop, idx) => (
                        <View key={idx} className='stop-item'>
                          <View className='stop-item__left'>
                            <View className='stop-item__dot' style={{ background: route.color }} />
                            {idx < route.stops.length - 1 && (
                              <View className='stop-item__line' style={{ background: route.color + '40' }} />
                            )}
                          </View>
                          <View className='stop-item__body'>
                            <View className='stop-item__header'>
                              <Text className='stop-item__icon'>{stop.icon}</Text>
                              <Text className='stop-item__name'>{stop.name}</Text>
                            </View>
                            <View className='stop-item__highlights'>
                              {stop.highlights.map((h, hi) => (
                                <Text key={hi} className='stop-item__highlight'>· {h}</Text>
                              ))}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )
              })()}
            </View>
          )}

          {/* ── 私导定制 ── */}
          {form.routeMode === 'custom' && (
            <View className='custom-route-card'>
              <Text className='custom-route-card__tip'>🧑‍✈️ 私导会根据你的天数和喜好，出发前与你沟通并设计专属行程</Text>

              <View className='field' style={{ marginTop: '24rpx' }}>
                <Text className='field__label'>计划旅行天数</Text>
                <Picker
                  mode='selector'
                  range={Array.from({ length: 28 }, (_, i) => `${i + 3} 天`)}
                  value={form.customDays ? parseInt(form.customDays) - 3 : 0}
                  onChange={e => updateForm('customDays', String(parseInt(e.detail.value) + 3))}
                >
                  <View className={`field__picker ${!form.customDays ? 'field__picker--placeholder' : ''}`}>
                    <Text>{form.customDays ? `${form.customDays} 天` : '选择天数（3-30 天）'}</Text>
                    <Text className='field__picker-arrow'>›</Text>
                  </View>
                </Picker>
              </View>

              <View className='field'>
                <Text className='field__label'>有哪些地方或体验特别想去？（选填）</Text>
                <Textarea
                  className='field__textarea'
                  placeholder='例如：一定要看企鹅归巢、想去米尔福德峡湾、希望安排星空拍摄…'
                  value={form.notes}
                  onInput={e => updateForm('notes', e.detail.value)}
                  maxlength={200}
                />
              </View>
            </View>
          )}

        </View>
      )}

      {/* Step 3：预算 + 联系方式 */}
      {step === 3 && (
        <View className='form-step'>
          <Text className='form-step__title'>最后几步</Text>

          <View className='field'>
            <Text className='field__label'>预算区间（每人每天估算）</Text>
            <Text className='field__sublabel'>
              按 {getOwnGroupSizeNum()} 人出行分摊 · 1 NZD ≈ {exchangeRate} CNY（实时汇率）
            </Text>
            <View className='budget-group'>
              {BUDGET_TIERS.map(tier => {
                const nzd = calcPerPersonPerDay(tier, getOwnGroupSizeNum())
                const cny = Math.round(nzd * exchangeRate)
                const active = form.budget === tier.id
                return (
                  <View
                    key={tier.id}
                    className={`budget-card ${active ? 'budget-card--active' : ''}`}
                    onClick={() => updateForm('budget', tier.id)}
                  >
                    <Text className='budget-card__emoji'>{tier.emoji}</Text>
                    <Text className='budget-card__label'>{tier.label}</Text>
                    <Text className='budget-card__nzd'>NZD {nzd}+</Text>
                    <Text className='budget-card__cny'>≈ ¥{cny}+</Text>
                    <Text className='budget-card__note'>{tier.note}</Text>
                  </View>
                )
              })}
            </View>
            <Text className='field__price-hint'>
              含私导费、专属车辆、住宿及餐饮估算，仅供参考。实际报价由导游根据行程确认。
            </Text>
          </View>

          <View className='field'>
            <Text className='field__label'>联系微信号</Text>
            <Text className='field__sublabel'>匹配成功后，我们通过此微信联系确认行程</Text>
            <View className='tag-group' style={{ marginBottom: '20rpx' }}>
              {[
                { id: 'self',  label: '本人微信' },
                { id: 'other', label: '出行联系人微信' },
              ].map(item => (
                <View key={item.id}
                  className={`tag ${form.contactType === item.id ? 'tag--active' : ''}`}
                  onClick={() => updateForm('contactType', item.id)}>
                  {item.label}
                </View>
              ))}
            </View>
            {form.contactType && (
              <View>
                <Input
                  className={`field__input ${form.wechatIdError ? 'field__input--error' : ''}`}
                  type='text'
                  placeholder={form.contactType === 'self' ? '你的微信号' : '出行联系人的微信号'}
                  value={form.wechatId}
                  onInput={e => handleWechatIdInput(e.detail.value)}
                  maxlength={20}
                />
                {form.wechatIdError ? (
                  <Text className='field__error'>{form.wechatIdError}</Text>
                ) : form.wechatId && !form.wechatIdError ? (
                  <Text className='field__ok'>✓ 格式正确</Text>
                ) : null}
              </View>
            )}
          </View>

          <View className='field'>
            <Text className='field__label'>补充说明（选填）</Text>
            <Textarea
              className='field__textarea'
              placeholder='有什么特别需求或者想法，告诉我们...'
              value={form.notes}
              onInput={e => updateForm('notes', e.detail.value)}
              maxlength={200}
            />
          </View>
        </View>
      )}

      {/* 底部按钮 */}
      <View className='form-footer'>
        {step > 1 && (
          <Button className='btn btn--ghost' onClick={() => setStep(s => s - 1)}>
            上一步
          </Button>
        )}
        {step < 3 ? (
          <Button className='btn btn--primary' onClick={handleNext}>
            下一步
          </Button>
        ) : (
          <Button
            className='btn btn--primary'
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            提交行程意愿
          </Button>
        )}
      </View>

    </View>
  )
}
