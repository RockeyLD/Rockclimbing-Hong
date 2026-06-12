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

  loadData() {
    const records = app.globalData.records || []
    const sorted = [...records].sort((a, b) => b.createTime - a.createTime)
    this.setData({ records: sorted })
    this.calcStats(records)
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

  toggleLike(e) {
    const id = e.currentTarget.dataset.id
    const updated = app.toggleLike(id)
    const records = this.data.records.map(r => r.id === id ? updated : r)
    this.setData({ records })
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
