App({
  globalData: {
    records: [],
    userInfo: null,
    isLoggedIn: false
  },

  onLaunch() {
    wx.cloud.init({
      env: 'eduction-cloud1-9g1g39x5d24e6574',
      traceUser: true
    })
    this.loadRecords()
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn')
    const userInfo = wx.getStorageSync('userInfo')
    this.globalData.isLoggedIn = !!isLoggedIn
    this.globalData.userInfo = userInfo || null
  },

  loadRecords() {
    return wx.cloud.callFunction({
      name: 'rock-getRecords',
      data: { page: 1, pageSize: 100 }
    }).then(res => {
      if (res.result.code === 0) {
        this.globalData.records = res.result.data || []
      }
    }).catch(() => {
      this.globalData.records = []
    })
  },

  addRecord(record) {
    return wx.cloud.callFunction({
      name: 'rock-addRecord',
      data: record
    })
  },

  deleteRecord(id) {
    return wx.cloud.callFunction({
      name: 'rock-deleteRecord',
      data: { id }
    })
  },

  toggleLike(id) {
    return wx.cloud.callFunction({
      name: 'rock-updateRecord',
      data: { id, action: 'like' }
    })
  },

  addComment(recordId, comment) {
    return wx.cloud.callFunction({
      name: 'rock-addComment',
      data: { recordId, content: comment.content, author: comment.author }
    })
  },

  deleteComment(recordId, commentId) {
    return wx.cloud.callFunction({
      name: 'rock-deleteComment',
      data: { recordId, commentId }
    })
  },

  // 将各种难度格式归一化为 V-scale 数值（V0=0, V1=1, ...）
  normalizeGrade(grade) {
    if (!grade || typeof grade !== 'string') return null
    const g = grade.trim()

    // V-scale: V0, V1, V2, V10, V0+, V1- 等
    const vMatch = g.match(/^V(\d+)([+-]?)$/i)
    if (vMatch) {
      let val = parseInt(vMatch[1])
      if (vMatch[2] === '+') val += 0.3
      if (vMatch[2] === '-') val -= 0.3
      return val
    }

    // YDS: 5.10a, 5.11b 等 → V-scale
    const ydsMatch = g.match(/^5\.(\d+)([a-d]?)$/i)
    if (ydsMatch) {
      const minor = ydsMatch[1]
      const sub = (ydsMatch[2] || '').toLowerCase()
      const map = {
        '5': 0, '6': 0, '7': 0, '8': 0, '9': 0.5,
        '10a': 0, '10b': 0, '10c': 0.5, '10d': 0.5,
        '11a': 1, '11b': 1, '11c': 2, '11d': 2,
        '12a': 3, '12b': 3, '12c': 4, '12d': 4,
        '13a': 5, '13b': 5, '13c': 6, '13d': 6,
        '14a': 7, '14b': 7, '14c': 8, '14d': 8,
        '15a': 9, '15b': 10, '15c': 11, '15d': 12
      }
      const key = minor + sub
      if (map[key] !== undefined) return map[key]
      const major = parseInt(minor)
      if (major <= 4) return 0
      if (major >= 16) return 13
      return null
    }

    // Font: 4, 5, 6A, 6A+, 7B, 8C+ 等 → V-scale
    const fontMatch = g.match(/^(\d+)([A-C])(\+?)$/i)
    if (fontMatch) {
      const num = parseInt(fontMatch[1])
      const letter = fontMatch[2].toUpperCase()
      const plus = fontMatch[3] ? 0.3 : 0
      const baseMap = {
        '4': 0, '5': 1,
        '6A': 2, '6B': 3, '6C': 4,
        '7A': 5, '7B': 6, '7C': 7,
        '8A': 8, '8B': 10, '8C': 12,
        '9A': 14, '9B': 16
      }
      const key = num + letter
      let base = baseMap[key]
      if (base === undefined) {
        base = (num - 4) * 3 + (letter === 'A' ? 0 : letter === 'B' ? 1 : 2)
      }
      return base + plus
    }

    return null
  },

  // 将 V-scale 数值转回字符串，优先保留用户原始输入格式
  formatVGrade(val, originalGrade) {
    if (val === null || val === undefined) return '-'
    const g = originalGrade ? originalGrade.trim() : ''
    // 如果原始输入就是 V 格式，直接保留
    if (g && /^V\d+/i.test(g)) {
      return g.toUpperCase()
    }
    // 如果原始输入是 YDS、Font 等其他格式，保留原样
    if (g) {
      return g
    }
    const base = Math.floor(val)
    const frac = val - base
    if (frac >= 0.25 && frac <= 0.35) return `V${base}+`
    if (frac >= -0.35 && frac <= -0.25) return `V${base}-`
    return `V${base}`
  }
})
