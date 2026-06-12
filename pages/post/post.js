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

  submit() {
    const { mediaList, content, grade, location, date, type } = this.data

    if (!content.trim() && mediaList.length === 0) {
      wx.showToast({ title: '请添加描述或媒体', icon: 'none' })
      return
    }

    const record = {
      id: 'rec_' + Date.now(),
      type,
      content: content.trim(),
      mediaUrls: mediaList,
      grade,
      location: location.trim() || '未知地点',
      date,
      likes: 0,
      isLiked: false,
      author: '攀岩小达人',
      avatar: '',
      createTime: Date.now(),
      comments: []
    }

    app.addRecord(record)
    wx.showToast({ title: '发布成功', icon: 'success' })

    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' })
      this.resetForm()
    }, 800)
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
