// 门店工作人员个人中心页面
Page({
  data: {
    userInfo: {
      name: '',
      avatar: '',
      role: '',
      storeId: '',
      storeName: '',
      workId: '',
      phone: ''
    },
    todayStats: {
      checkInCount: 0,
      salesAmount: 0,
      newMembers: 0
    },
    showLogoutDialog: false
  },

  onLoad() {
    this.loadUserInfo()
    this.loadTodayStats()
  },

  onShow() {
    // 设置tabbar状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 3
      })
    }
    
    // 刷新今日数据
    this.loadTodayStats()
  },

  onPullDownRefresh() {
    Promise.all([
      this.loadUserInfo(),
      this.loadTodayStats()
    ]).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载用户信息
  loadUserInfo() {
    return new Promise((resolve) => {
      // 模拟API调用
      setTimeout(() => {
        this.setData({
          userInfo: {
            name: '张小明',
            avatar: '/images/default-avatar.svg',
            role: '店长',
            storeId: 'ST001',
            storeName: '健身房(世纪大道店)',
            workId: 'EMP001',
            phone: '138****8888'
          }
        })
        resolve()
      }, 300)
    })
  },

  // 加载今日工作数据
  loadTodayStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setData({
          todayStats: {
            checkInCount: 23,
            salesAmount: 4680,
            newMembers: 8
          }
        })
        resolve()
      }, 500)
    })
  },

  // 导航到页面
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url: url
      })
    }
  },

  // 显示销售开单页面
  showSalesPage() {
    wx.navigateTo({
      url: '/pages/sales/sales'
    })
  },

  // 显示设置页面
  showSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 显示帮助页面
  showHelp() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 显示关于页面
  showAbout() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 显示退出登录对话框
  showLogout() {
    this.setData({
      showLogoutDialog: true
    })
  },

  // 关闭退出登录对话框
  closeLogoutDialog() {
    this.setData({
      showLogoutDialog: false
    })
  },

  // 确认退出登录
  confirmLogout() {
    wx.showLoading({
      title: '退出中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }, 1000)
  },

  // 编辑个人信息
  editProfile() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 查看工作统计
  viewWorkStats() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
})