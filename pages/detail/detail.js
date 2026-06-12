const app = getApp()

Page({
  data: {
    record: null,
    commentText: '',
    currentUser: ''
  },

  onLoad(options) {
    this.loadRecord(options.id)
    const userInfo = app.globalData.userInfo
    this.setData({
      currentUser: userInfo ? userInfo.nickName : '攀岩小达人'
    })
  },

  onShow() {
    if (this.data.record) {
      this.loadRecord(this.data.record.id)
    }
  },

  loadRecord(id) {
    const record = app.globalData.records.find(r => r.id === id)
    if (record) {
      this.setData({ record })
    } else {
      wx.showToast({ title: '记录不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({ urls: [url] })
  },

  toggleLike() {
    const updated = app.toggleLike(this.data.record.id)
    this.setData({ record: updated })
  },

  deleteRecord() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      confirmColor: '#e53935',
      success: (res) => {
        if (res.confirm) {
          app.deleteRecord(this.data.record.id)
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 800)
        }
      }
    })
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  submitComment() {
    const text = this.data.commentText.trim()
    if (!text) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }

    const comment = {
      id: 'cmt_' + Date.now(),
      author: this.data.currentUser || '攀岩小达人',
      content: text,
      createTime: Date.now()
    }

    const updated = app.addComment(this.data.record.id, comment)
    this.setData({ record: updated, commentText: '' })
    wx.showToast({ title: '评论成功', icon: 'success' })
  },

  deleteComment(e) {
    const commentId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '删除这条评论？',
      confirmColor: '#e53935',
      success: (res) => {
        if (res.confirm) {
          const updated = app.deleteComment(this.data.record.id, commentId)
          this.setData({ record: updated })
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  onShare() {
    wx.showShareMenu({ withShareTicket: true })
  },

  onShareAppMessage() {
    const r = this.data.record
    return {
      title: `${r.author} 的攀岩记录 - ${r.grade}`,
      path: `/pages/detail/detail?id=${r.id}`
    }
  }
})
