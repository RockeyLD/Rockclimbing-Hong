Page({
  data: {
    loading: false
  },

  onLoad() {
    this.autoRedirectIfLoggedIn()
  },

  onShow() {
    this.autoRedirectIfLoggedIn()
  },

  autoRedirectIfLoggedIn() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn')
    if (isLoggedIn) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  handleLogin() {
    if (this.data.loading) return
    this.setData({ loading: true })

    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('微信登录 code:', res.code)

          // 保存登录状态
          wx.setStorageSync('isLoggedIn', true)
          wx.setStorageSync('wxLoginCode', res.code)

          // 更新全局数据
          const app = getApp()
          if (app) {
            app.globalData.isLoggedIn = true
          }

          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 800,
            complete: () => {
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }, 800)
            }
          })
        } else {
          wx.showToast({
            title: res.errMsg || '登录失败',
            icon: 'none'
          })
          this.setData({ loading: false })
        }
      },
      fail: (err) => {
        console.error('登录失败:', err)
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    })
  }
})
