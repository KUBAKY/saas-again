// 会员端小程序首页逻辑
Page({
  data: {
    userInfo: {},
    memberInfo: {
      name: '',
      memberNumber: '',
      level: 'bronze',
      status: 'active'
    },
    memberStats: {
      points: 0,
      checkInDays: 0,
      courseCount: 0
    },
    upcomingCourses: [],
    weeklyRecords: [],
    notices: [],
    showCheckInPopup: false,
    checkInReward: 0,
    levelText: '铜牌会员'
  },

  onLoad() {
    this.initData()
    this.loadUserInfo()
    this.loadMemberInfo()
    this.loadUpcomingCourses()
    this.loadWeeklyRecords()
    this.loadNotices()
  },

  onShow() {
    // 页面显示时刷新数据
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 0
      })
    }
    this.loadMemberInfo()
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.loadUserInfo()
    this.loadMemberInfo()
    this.loadUpcomingCourses()
    this.loadWeeklyRecords()
    this.loadNotices()
    
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  // 初始化数据
  initData() {
    const today = new Date()
    const weeklyRecords = []
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    
    for (let i = 0; i < 7; i++) {
      weeklyRecords.push({
        day: days[i],
        hasWorkout: Math.random() > 0.4, // 模拟数据
        intensity: Math.random() // 强度 0-1
      })
    }
    
    this.setData({
      weeklyRecords,
      notices: [
        {
          id: 1,
          title: '春节期间营业时间调整通知',
          date: '2024-01-08'
        },
        {
          id: 2,
          title: '新增瑜伽课程，欢迎体验',
          date: '2024-01-07'
        }
      ]
    })
  },

  // 加载用户信息
  loadUserInfo() {
    // 模拟API调用
    setTimeout(() => {
      this.setData({
        userInfo: {
          avatar: '/images/default-avatar.svg',
          nickName: '健身达人'
        }
      })
    }, 300)
  },

  // 加载会员信息
  loadMemberInfo() {
    // 模拟API调用
    setTimeout(() => {
      const memberInfo = {
        name: '张三',
        memberNumber: 'M2024001',
        level: 'gold',
        status: 'active'
      }
      
      const levelMap = {
        bronze: '铜牌会员',
        silver: '银牌会员', 
        gold: '金牌会员',
        platinum: '白金会员',
        diamond: '钻石会员'
      }
      
      this.setData({
        memberInfo,
        levelText: levelMap[memberInfo.level] || '铜牌会员',
        memberStats: {
          points: 1250,
          checkInDays: 28,
          courseCount: 5
        }
      })
    }, 500)
  },

  // 加载即将开始的课程
  loadUpcomingCourses() {
    // 模拟API调用
    setTimeout(() => {
      this.setData({
        upcomingCourses: [
          {
            id: 1,
            courseName: '高强度间歇训练',
            startTime: '今天 19:00',
            coachName: '李教练'
          },
          {
            id: 2,
            courseName: '瑜伽基础班',
            startTime: '明天 10:00',
            coachName: '王教练'
          }
        ]
      })
    }, 800)
  },

  // 加载本周记录
  loadWeeklyRecords() {
    // 数据已在 initData 中初始化
  },

  // 加载通知公告
  loadNotices() {
    // 数据已在 initData 中初始化
  },

  // 快速签到
  quickCheckIn() {
    wx.showLoading({
      title: '签到中...'
    })
    
    // 模拟签到API调用
    setTimeout(() => {
      wx.hideLoading()
      
      // 模拟签到成功
      const reward = Math.floor(Math.random() * 20) + 10
      this.setData({
        showCheckInPopup: true,
        checkInReward: reward
      })
      
      // 更新积分
      const currentStats = this.data.memberStats
      this.setData({
        'memberStats.points': currentStats.points + reward,
        'memberStats.checkInDays': currentStats.checkInDays + 1
      })
    }, 2000)
  },

  // 关闭签到弹窗
  closeCheckInPopup() {
    this.setData({
      showCheckInPopup: false
    })
  },

  // 进入课程
  enterCourse(e) {
    const courseId = e.currentTarget.dataset.id
    wx.showToast({
      title: '正在进入课程...',
      icon: 'loading'
    })
    
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/course-detail/course-detail?id=${courseId}`
      })
    }, 1500)
  },

  // 页面跳转
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url: url,
        fail() {
          wx.switchTab({
            url: url
          })
        }
      })
    }
  },

  // 显示通知详情
  showNoticeDetail(e) {
    const notice = e.currentTarget.dataset.notice
    wx.showModal({
      title: notice.title,
      content: '这是通知的详细内容，实际开发中从API获取。',
      showCancel: false
    })
  },

  // 即将上线提示
  showComingSoon() {
    wx.showToast({
      title: '功能即将上线',
      icon: 'none'
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '一起来健身吧！',
      path: '/pages/index/index',
      imageUrl: '/images/share-bg.svg'
    }
  },

  onShareTimeline() {
    return {
      title: '我的健身记录',
      query: '',
      imageUrl: '/images/share-bg.svg'
    }
  }
})