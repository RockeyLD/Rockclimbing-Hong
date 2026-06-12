const app = getApp()

Page({
  data: {
    userInfo: {
      avatarText: '岩',
      nickname: '攀岩小达人',
      desc: '记录每一次攀登'
    }
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  changeAvatar() {
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['album'] : ['camera']
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType,
          success: (result) => {
            const tempFilePath = result.tempFiles[0].tempFilePath
            const userInfo = { ...this.data.userInfo, avatarUrl: tempFilePath }
            this.setData({ userInfo })
            wx.setStorageSync('userInfo', userInfo)
            wx.showToast({ title: '头像已更新', icon: 'success' })
          }
        })
      }
    })
  },

  editNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入昵称',
      content: this.data.userInfo.nickname,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const userInfo = { ...this.data.userInfo, nickname: res.content.trim() }
          this.setData({ userInfo })
          wx.setStorageSync('userInfo', userInfo)
          wx.showToast({ title: '昵称已更新', icon: 'success' })
        }
      }
    })
  },

  editDesc() {
    wx.showModal({
      title: '修改个人简介',
      editable: true,
      placeholderText: '请输入个人简介',
      content: this.data.userInfo.desc,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const userInfo = { ...this.data.userInfo, desc: res.content.trim() }
          this.setData({ userInfo })
          wx.setStorageSync('userInfo', userInfo)
          wx.showToast({ title: '简介已更新', icon: 'success' })
        }
      }
    })
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录',
      confirmColor: '#e53935',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('isLoggedIn')
          wx.removeStorageSync('userInfo')
          app.globalData.isLoggedIn = false
          wx.showToast({
            title: '已退出',
            icon: 'success',
            complete: () => {
              setTimeout(() => {
                wx.reLaunch({ url: '/pages/login/login' })
              }, 800)
            }
          })
        }
      }
    })
  }
})
