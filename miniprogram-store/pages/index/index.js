// 门店端小程序首页逻辑
Page({
  data: {
    storeInfo: {
      name: '',
      address: '',
      status: 'open',
      statusText: '营业中'
    },
    dailyStats: {
      checkIns: 0,
      checkInsChange: 0,
      newMembers: 0,
      newMembersChange: 0,
      revenue: 0,
      revenueChange: 0
    },
    todayCourses: [],
    recentActivities: [],
    todoList: [],
    showCourseDetail: false,
    selectedCourse: null
  },

  onLoad() {
    this.loadStoreInfo()
    this.loadDailyStats()
    this.loadTodayCourses()
    this.loadRecentActivities()
    this.loadTodoList()
  },

  onShow() {
    // 设置tabbar状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 0
      })
    }
    
    // 刷新实时数据
    this.loadDailyStats()
    this.loadRecentActivities()
  },

  onPullDownRefresh() {
    // 下拉刷新所有数据
    Promise.all([
      this.loadStoreInfo(),
      this.loadDailyStats(),
      this.loadTodayCourses(),
      this.loadRecentActivities(),
      this.loadTodoList()
    ]).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载门店信息
  loadStoreInfo() {
    return new Promise((resolve) => {
      // 模拟API调用
      setTimeout(() => {
        this.setData({
          storeInfo: {
            name: '健身房(世纪大道店)',
            address: '上海市浦东新区世纪大道1000号',
            status: 'open',
            statusText: '营业中'
          }
        })
        resolve()
      }, 300)
    })
  },

  // 加载今日统计数据
  loadDailyStats() {
    return new Promise((resolve) => {
      wx.showLoading({
        title: '加载中...'
      })
      
      // 模拟API调用
      setTimeout(() => {
        wx.hideLoading()
        
        this.setData({
          dailyStats: {
            checkIns: 156,
            checkInsChange: 23,
            newMembers: 8,
            newMembersChange: 3,
            revenue: 4680,
            revenueChange: 15.6
          }
        })
        resolve()
      }, 800)
    })
  },

  // 加载今日课程
  loadTodayCourses() {
    return new Promise((resolve) => {
      // 模拟API调用
      setTimeout(() => {
        this.setData({
          todayCourses: [
            {
              id: 1,
              name: '晨间瑜伽',
              startTime: '08:00',
              endTime: '09:00',
              duration: 60,
              coachName: '王教练',
              bookedCount: 12,
              maxCount: 15,
              status: 'ongoing',
              statusText: '进行中'
            },
            {
              id: 2,
              name: '力量训练',
              startTime: '10:30',
              endTime: '11:30',
              duration: 60,
              coachName: '李教练',
              bookedCount: 8,
              maxCount: 10,
              status: 'upcoming',
              statusText: '即将开始'
            },
            {
              id: 3,
              name: '有氧运动',
              startTime: '19:00',
              endTime: '20:00',
              duration: 60,
              coachName: '张教练',
              bookedCount: 15,
              maxCount: 20,
              status: 'scheduled',
              statusText: '已排课'
            }
          ]
        })
        resolve()
      }, 600)
    })
  },

  // 加载最新会员动态
  loadRecentActivities() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setData({
          recentActivities: [
            {
              id: 1,
              memberName: '张三',
              action: '完成签到',
              time: '刚刚',
              type: 'checkin',
              icon: 'location-o',
              avatar: '/images/default-avatar.png'
            },
            {
              id: 2,
              memberName: '李四',
              action: '购买年卡',
              time: '5分钟前',
              type: 'purchase',
              icon: 'shopping-cart-o',
              avatar: '/images/default-avatar.png'
            },
            {
              id: 3,
              memberName: '王五',
              action: '预约私教课',
              time: '10分钟前',
              type: 'booking',
              icon: 'calendar-o',
              avatar: '/images/default-avatar.png'
            },
            {
              id: 4,
              memberName: '赵六',
              action: '完成训练',
              time: '15分钟前',
              type: 'workout',
              icon: 'medal-o',
              avatar: '/images/default-avatar.png'
            }
          ]
        })
        resolve()
      }, 400)
    })
  },

  // 加载待办事项
  loadTodoList() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setData({
          todoList: [
            {
              id: 1,
              title: '设备维护提醒',
              description: '跑步机#3需要定期保养',
              priority: 'high',
              icon: 'warning-o'
            },
            {
              id: 2,
              title: '会员到期提醒',
              description: '5位会员会籍卡即将到期',
              priority: 'medium',
              icon: 'clock-o'
            },
            {
              id: 3,
              title: '课程安排确认',
              description: '明日瑜伽课程待确认教练',
              priority: 'medium',
              icon: 'calendar-o'
            }
          ]
        })
        resolve()
      }, 200)
    })
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

  // 查看所有课程
  showAllCourses() {
    wx.navigateTo({
      url: '/pages/courses/courses'
    })
  },

  // 显示课程详情
  showCourseDetail(e) {
    const course = e.currentTarget.dataset.course
    this.setData({
      selectedCourse: course,
      showCourseDetail: true
    })
  },

  // 关闭课程详情
  closeCourseDetail() {
    this.setData({
      showCourseDetail: false,
      selectedCourse: null
    })
  },

  // 管理课程
  manageCourse() {
    const course = this.data.selectedCourse
    if (course) {
      wx.navigateTo({
        url: `/pages/course-manage/course-manage?id=${course.id}`
      })
    }
    this.closeCourseDetail()
  },

  // 处理待办事项
  handleTodo(e) {
    const todo = e.currentTarget.dataset.todo
    
    switch (todo.id) {
      case 1:
        wx.showModal({
          title: '设备维护',
          content: '是否现在安排设备维护？',
          success: (res) => {
            if (res.confirm) {
              wx.showToast({
                title: '已安排维护',
                icon: 'success'
              })
            }
          }
        })
        break
      case 2:
        wx.navigateTo({
          url: '/pages/member-expiry/member-expiry'
        })
        break
      case 3:
        wx.navigateTo({
          url: '/pages/course-schedule/course-schedule'
        })
        break
      default:
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        })
    }
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
      title: '门店管理小程序',
      path: '/pages/index/index',
      imageUrl: '/images/store-share.jpg'
    }
  }
})