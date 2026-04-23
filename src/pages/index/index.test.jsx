import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Taro from '@tarojs/taro'
import Index from './index'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Index page — CTA button', () => {
  it('renders the start button', () => {
    render(<Index />)
    expect(screen.getByText('开始定制我的行程')).toBeInTheDocument()
  })

  it('applies pressing class immediately on touchstart (no delay)', () => {
    render(<Index />)
    const btn = screen.getByText('开始定制我的行程')

    // Before touch — no pressing class
    expect(btn.className).not.toMatch(/pressing/)

    // Finger down — pressing class should appear synchronously
    fireEvent.touchStart(btn)
    expect(btn.className).toMatch(/pressing/)
  })

  it('removes pressing class on touchend', () => {
    render(<Index />)
    const btn = screen.getByText('开始定制我的行程')

    fireEvent.touchStart(btn)
    expect(btn.className).toMatch(/pressing/)

    fireEvent.touchEnd(btn)
    expect(btn.className).not.toMatch(/pressing/)
  })

  it('removes pressing class on touchcancel (swipe away)', () => {
    render(<Index />)
    const btn = screen.getByText('开始定制我的行程')

    fireEvent.touchStart(btn)
    fireEvent.touchCancel(btn)
    expect(btn.className).not.toMatch(/pressing/)
  })

  it('calls Taro.navigateTo on touchend — not on touchstart', () => {
    render(<Index />)
    const btn = screen.getByText('开始定制我的行程')

    fireEvent.touchStart(btn)
    // navigateTo must NOT fire yet — only on touchend
    expect(Taro.navigateTo).not.toHaveBeenCalled()

    fireEvent.touchEnd(btn)
    expect(Taro.navigateTo).toHaveBeenCalledTimes(1)
    expect(Taro.navigateTo).toHaveBeenCalledWith({
      url: '/pages/trip-form/index',
    })
  })

  it('does not navigate if touch is cancelled', () => {
    render(<Index />)
    const btn = screen.getByText('开始定制我的行程')

    fireEvent.touchStart(btn)
    fireEvent.touchCancel(btn)
    expect(Taro.navigateTo).not.toHaveBeenCalled()
  })

  it('navigateTo is called exactly once per tap', () => {
    render(<Index />)
    const btn = screen.getByText('开始定制我的行程')

    fireEvent.touchStart(btn)
    fireEvent.touchEnd(btn)
    fireEvent.touchStart(btn)
    fireEvent.touchEnd(btn)
    expect(Taro.navigateTo).toHaveBeenCalledTimes(2)
  })
})
