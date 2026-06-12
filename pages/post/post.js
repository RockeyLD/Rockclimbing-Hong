const app = getApp()

Page({
  data: {
    mediaList: [],
    content: '',
    grade: '',
    location: '',
    date: '',
    type: 'image'
  },

  onLoad() {
    const today = new Date().toISOString().split('T')[0]
    this.setData({ date: today })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  chooseMedia() {
    const count = 9 - this.data.mediaList.length
    if (this.data.type === 'video') {
      wx.chooseMedia({
        count: 1,
        mediaType: ['video'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFiles = res.tempFiles.map(f => f.tempFilePath)
          this.setData({ mediaList: [...this.data.mediaList, ...tempFiles] })
        }
      })
    } else {
      wx.chooseMedia({
        count,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFiles = res.tempFiles.map(f => f.tempFilePath)
          this.setData({ mediaList: [...this.data.mediaList, ...tempFiles] })
        }
      })
    }
  },

  deleteMedia(e) {
    const index = e.currentTarget.dataset.index
    const mediaList = this.data.mediaList.filter((_, i) => i !== index)
    this.setData({ mediaList })
  },

  previewMedia(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({ urls: [url] })
  },

  onInputContent(e) {
    this.setData({ content: e.detail.value })
  },

  onInputLocation(e) {
    this.setData({ location: e.detail.value })
  },

  onInputGrade(e) {
    this.setData({ grade: e.detail.value })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ type, mediaList: [] })
  },

  async submit() {
    const { mediaList, content, grade, location, date, type } = this.data

    if (!content.trim() && mediaList.length === 0) {
      wx.showToast({ title: '请添加描述或媒体', icon: 'none' })
      return
    }

    wx.showLoading({ title: '上传中...' })

    try {
      const uploadTasks = mediaList.map(filePath => {
        const ext = filePath.match(/\.([^.]+)$/) ? filePath.match(/\.([^.]+)$/)[1] : 'jpg'
        const cloudPath = `records/${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`
        return wx.cloud.uploadFile({ cloudPath, filePath })
      })

      const uploadResults = await Promise.all(uploadTasks)
      const fileIDs = uploadResults.map(r => r.fileID)

      const userInfo = app.globalData.userInfo || {}
      const res = await app.addRecord({
        type,
        content: content.trim(),
        mediaList: fileIDs,
        grade,
        location: location.trim() || '未知地点',
        date,
        author: userInfo.nickName || userInfo.nickname || '攀岩小达人'
      })

      if (res.result.code === 0) {
        wx.showToast({ title: '发布成功', icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
          this.resetForm()
        }, 800)
      } else {
        wx.showToast({ title: res.result.message || '发布失败', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '发布失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  resetForm() {
    const today = new Date().toISOString().split('T')[0]
    this.setData({
      mediaList: [],
      content: '',
      grade: '',
      location: '',
      date: today,
      type: 'image'
    })
  }
})
