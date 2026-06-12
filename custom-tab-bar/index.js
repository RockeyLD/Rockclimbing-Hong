const TAB_PAGES = ['pages/index/index', 'pages/profile/profile']

Component({
  data: {
    show: true,
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '首页', icon: '◈' },
      { pagePath: '/pages/post/post', text: '发布', icon: '+', isNav: true },
      { pagePath: '/pages/profile/profile', text: '我的', icon: '○' }
    ]
  },
  pageLifetimes: {
    show() {
      const pages = getCurrentPages()
      const route = pages.length ? pages[pages.length - 1].route : ''
      const isTab = TAB_PAGES.some(p => route.includes(p))
      this.setData({ show: isTab })
    }
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      if (data.nav) {
        wx.navigateTo({ url })
      } else {
        wx.switchTab({ url })
        this.setData({
          selected: data.index
        })
      }
    }
  }
})
