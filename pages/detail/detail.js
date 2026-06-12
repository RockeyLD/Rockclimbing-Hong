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
      this.loadRecord(this.data.record._id)
    }
  },

  async loadRecord(id) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'rock-getRecordDetail',
        data: { id }
      })
      if (res.result.code === 0) {
        const r = res.result.data
        this.setData({
          record: {
            ...r,
            _id: r._id,
            id: r._id,
            mediaUrls: r.mediaList
          }
        })
      } else {
        wx.showToast({ title: '记录不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      }
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({ urls: [url] })
  },

  async toggleLike() {
    try {
      const res = await app.toggleLike(this.data.record._id)
      if (res.result.code === 0) {
        const record = this.data.record
        this.setData({
          record: {
            ...record,
            isLiked: res.result.liked,
            likes: res.result.liked ? (record.likes || 0) + 1 : Math.max((record.likes || 0) - 1, 0)
          }
        })
      }
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  deleteRecord() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      confirmColor: '#e53935',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.deleteRecord(this.data.record._id)
            wx.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 800)
          } catch (e) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  async submitComment() {
    const text = this.data.commentText.trim()
    if (!text) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }

    try {
      const res = await app.addComment(this.data.record._id, {
        author: this.data.currentUser || '攀岩小达人',
        content: text
      })
      if (res.result.code === 0) {
        const comment = res.result.data
        const record = this.data.record
        this.setData({
          record: {
            ...record,
            comments: [...(record.comments || []), comment]
          },
          commentText: ''
        })
        wx.showToast({ title: '评论成功', icon: 'success' })
      } else {
        wx.showToast({ title: res.result.message || '评论失败', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '评论失败', icon: 'none' })
    }
  },

  deleteComment(e) {
    const commentId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '删除这条评论？',
      confirmColor: '#e53935',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.deleteComment(this.data.record._id, commentId)
            const record = this.data.record
            this.setData({
              record: {
                ...record,
                comments: (record.comments || []).filter(c => c._id !== commentId)
              }
            })
            wx.showToast({ title: '已删除', icon: 'success' })
          } catch (e) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
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
