const app = getApp()

Page({
  data: {
    records: [],
    stats: {
      total: 0,
      maxGrade: '-',
      thisMonth: 0
    },
    refreshing: false
  },

  onShow() {
    this.loadData()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  async loadData() {
    try {
      const res = await wx.cloud.callFunction({ name: 'rock-getRecords', data: { page: 1, pageSize: 100 } })
      if (res.result.code === 0) {
        const records = (res.result.data || []).map(r => ({
          ...r,
          id: r._id,
          mediaUrls: r.mediaUrls || r.mediaList || [],
          isLiked: r.isLiked || false
        }))
        this.setData({ records })
        this.calcStats(records)
      }
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  calcStats(records) {
    const app = getApp()
    const total = records.length
    const now = new Date()
    const thisMonth = records.filter(r => {
      const d = new Date(r.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length

    let maxVal = null
    let maxGrade = '-'
    records.forEach(r => {
      const val = app.normalizeGrade(r.grade)
      if (val !== null && (maxVal === null || val > maxVal)) {
        maxVal = val
        maxGrade = app.formatVGrade(val, r.grade)
      }
    })

    this.setData({
      stats: { total, maxGrade, thisMonth }
    })
  },

  onRefresh() {
    this.setData({ refreshing: true })
    setTimeout(() => {
      this.loadData()
      this.setData({ refreshing: false })
    }, 500)
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({ urls: [url] })
  },

  async toggleLike(e) {
    const id = e.currentTarget.dataset.id
    try {
      const res = await app.toggleLike(id)
      if (res.result.code === 0) {
        const records = this.data.records.map(r => {
          if (r.id === id) {
            return {
              ...r,
              isLiked: res.result.liked,
              likes: res.result.liked ? (r.likes || 0) + 1 : Math.max((r.likes || 0) - 1, 0)
            }
          }
          return r
        })
        this.setData({ records })
      }
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  shareRecord(e) {
    const id = e.currentTarget.dataset.id
    wx.showShareMenu({ withShareTicket: true })
  },

  onShareAppMessage(res) {
    if (res.from === 'button') {
      const id = res.target.dataset.id
      const record = this.data.records.find(r => r.id === id)
      return {
        title: record ? `${record.author} 的攀岩记录 - ${record.grade}` : '攀岩记录',
        path: `/pages/detail/detail?id=${id}`
      }
    }
    return {
      title: '🧗 攀岩记录 - 记录每一次攀登',
      path: '/pages/index/index'
    }
  }
})
