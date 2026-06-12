const app = getApp()

Page({
  data: {
    records: [],
    stats: {
      total: 0,
      maxGrade: '-',
      thisMonth: 0,
      totalLikes: 0
    },
    gradeDistribution: [],
    userInfo: {
      avatarText: '岩',
      nickname: '攀岩小达人',
      desc: '记录每一次攀登'
    }
  },

  onShow() {
    this.loadData()
    this.loadUserInfo()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  },

  loadData() {
    const records = [...app.globalData.records].sort((a, b) => b.createTime - a.createTime)
    this.setData({ records })
    this.calcStats(records)
    this.calcGradeDistribution(records)
  },

  calcStats(records) {
    const app = getApp()
    const total = records.length
    const now = new Date()
    const thisMonth = records.filter(r => {
      const d = new Date(r.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
    const totalLikes = records.reduce((sum, r) => sum + (r.likes || 0), 0)

    let maxVal = null
    let maxGrade = '-'
    records.forEach(r => {
      const val = app.normalizeGrade(r.grade)
      if (val !== null && (maxVal === null || val > maxVal)) {
        maxVal = val
        maxGrade = app.formatVGrade(val, r.grade)
      }
    })

    this.setData({ stats: { total, maxGrade, thisMonth, totalLikes } })
  },

  calcGradeDistribution(records) {
    const map = {}
    records.forEach(r => {
      map[r.grade] = (map[r.grade] || 0) + 1
    })
    const maxCount = Math.max(...Object.values(map), 1)
    const distribution = Object.entries(map)
      .map(([grade, count]) => ({ grade, count, percent: (count / maxCount) * 100 }))
      .sort((a, b) => b.count - a.count)
    this.setData({ gradeDistribution: distribution })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  deleteRecord(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      confirmColor: '#e53935',
      success: (res) => {
        if (res.confirm) {
          app.deleteRecord(id)
          this.loadData()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  clearAll() {
    if (this.data.records.length === 0) {
      wx.showToast({ title: '没有记录', icon: 'none' })
      return
    }
    wx.showModal({
      title: '确认清空',
      content: '将清空所有记录，是否继续？',
      confirmColor: '#e53935',
      success: (res) => {
        if (res.confirm) {
          app.saveRecords([])
          this.loadData()
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }
})
