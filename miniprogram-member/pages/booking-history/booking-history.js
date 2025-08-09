// 预约历史页面逻辑
Page({
  data: {
    activeTab: 0, // 0: 全部, 1: 已预约, 2: 已完成, 3: 已取消
    bookingList: [],
    filteredBookings: [],
    loading: false,
    page: 1,
    hasMore: true,
    showCancelDialog: false,
    selectedBooking: null,
    cancelLoading: false,
    searchKeyword: '',
    showFilterPopup: false,
    filterOptions: {
      dateRange: '',
      courseType: '',
      status: ''
    }
  },

  onLoad() {
    this.loadBookingHistory()
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshData()
  },

  onPullDownRefresh() {
    this.refreshData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreBookings()
    }
  },

  // 刷新数据
  refreshData() {
    this.setData({
      page: 1,
      hasMore: true,
      bookingList: [],
      filteredBookings: []
    })
    this.loadBookingHistory()
  },

  // 加载预约历史
  loadBookingHistory() {
    if (this.data.loading) return

    this.setData({ loading: true })
    
    // 模拟API调用
    setTimeout(() => {
      const mockBookings = this.generateMockBookings()
      
      this.setData({
        bookingList: this.data.page === 1 ? mockBookings : [...this.data.bookingList, ...mockBookings],
        loading: false,
        hasMore: mockBookings.length === 10, // 每页10条，小于10条表示没有更多
        page: this.data.page + 1
      })
      
      this.filterBookings()
    }, 1000)
  },

  // 加载更多预约记录
  loadMoreBookings() {
    this.loadBookingHistory()
  },

  // 生成模拟预约数据
  generateMockBookings() {
    const statuses = ['upcoming', 'completed', 'cancelled']
    const courses = [
      { name: '高强度间歇训练', type: '力量训练', coach: '李教练' },
      { name: '瑜伽基础班', type: '瑜伽', coach: '王教练' },
      { name: '普拉提塑形', type: '塑形', coach: '张教练' },
      { name: '动感单车', type: '有氧运动', coach: '刘教练' },
      { name: '拳击基础', type: '格斗', coach: '陈教练' }
    ]

    const bookings = []
    for (let i = 0; i < 10; i++) {
      const course = courses[Math.floor(Math.random() * courses.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)) // 最近30天

      bookings.push({
        id: Date.now() + i,
        courseId: Math.floor(Math.random() * 100) + 1,
        courseName: course.name,
        courseType: course.type,
        coachName: course.coach,
        bookingDate: this.formatDate(date),
        bookingTime: this.getRandomTime(),
        duration: [45, 60, 90][Math.floor(Math.random() * 3)],
        location: `训练室${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
        status: status,
        statusText: this.getStatusText(status),
        price: Math.floor(Math.random() * 100) + 50,
        participants: `${Math.floor(Math.random() * 15) + 5}/${Math.floor(Math.random() * 5) + 15}`,
        canCancel: status === 'upcoming' && this.canCancelBooking(date),
        canReview: status === 'completed',
        coverImage: `/images/course-${Math.floor(Math.random() * 5) + 1}.jpg`
      })
    }

    return bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 获取随机时间
  getRandomTime() {
    const times = ['09:00-10:00', '10:30-11:30', '14:00-15:00', '19:00-20:00', '20:30-21:30']
    return times[Math.floor(Math.random() * times.length)]
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      upcoming: '已预约',
      completed: '已完成',
      cancelled: '已取消'
    }
    return statusMap[status] || '未知'
  },

  // 判断是否可以取消预约
  canCancelBooking(bookingDate) {
    const now = new Date()
    const booking = new Date(bookingDate)
    const hoursDiff = (booking - now) / (1000 * 60 * 60)
    return hoursDiff > 2 // 预约时间前2小时可以取消
  },

  // 切换标签页
  switchTab(e) {
    const tabIndex = e.currentTarget.dataset.index
    this.setData({
      activeTab: tabIndex
    })
    this.filterBookings()
  },

  // 筛选预约记录
  filterBookings() {
    let filtered = [...this.data.bookingList]
    
    // 根据标签筛选
    switch (this.data.activeTab) {
      case 1: // 已预约
        filtered = filtered.filter(item => item.status === 'upcoming')
        break
      case 2: // 已完成
        filtered = filtered.filter(item => item.status === 'completed')
        break
      case 3: // 已取消
        filtered = filtered.filter(item => item.status === 'cancelled')
        break
      default: // 全部
        break
    }

    // 根据搜索关键词筛选
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(item => 
        item.courseName.toLowerCase().includes(keyword) ||
        item.coachName.toLowerCase().includes(keyword) ||
        item.courseType.toLowerCase().includes(keyword)
      )
    }

    // 根据高级筛选条件筛选
    const { dateRange, courseType, status } = this.data.filterOptions
    if (dateRange) {
      // 实际开发中根据日期范围筛选
    }
    if (courseType) {
      filtered = filtered.filter(item => item.courseType === courseType)
    }
    if (status) {
      filtered = filtered.filter(item => item.status === status)
    }

    this.setData({
      filteredBookings: filtered
    })
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    
    // 防抖处理
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      this.filterBookings()
    }, 500)
  },

  // 显示筛选弹窗
  showFilter() {
    this.setData({
      showFilterPopup: true
    })
  },

  // 关闭筛选弹窗
  closeFilter() {
    this.setData({
      showFilterPopup: false
    })
  },

  // 重置筛选条件
  resetFilter() {
    this.setData({
      filterOptions: {
        dateRange: '',
        courseType: '',
        status: ''
      },
      searchKeyword: '',
      showFilterPopup: false
    })
    this.filterBookings()
  },

  // 查看课程详情
  viewCourseDetail(e) {
    const courseId = e.currentTarget.dataset.courseid
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${courseId}`
    })
  },

  // 显示取消预约对话框
  showCancelDialog(e) {
    const booking = e.currentTarget.dataset.booking
    this.setData({
      showCancelDialog: true,
      selectedBooking: booking
    })
  },

  // 关闭取消预约对话框
  closeCancelDialog() {
    this.setData({
      showCancelDialog: false,
      selectedBooking: null
    })
  },

  // 确认取消预约
  confirmCancel() {
    if (!this.data.selectedBooking) return

    this.setData({ cancelLoading: true })
    
    // 模拟API调用
    setTimeout(() => {
      const bookingId = this.data.selectedBooking.id
      const bookingList = this.data.bookingList.map(item => {
        if (item.id === bookingId) {
          return {
            ...item,
            status: 'cancelled',
            statusText: '已取消',
            canCancel: false
          }
        }
        return item
      })

      this.setData({
        bookingList,
        cancelLoading: false,
        showCancelDialog: false,
        selectedBooking: null
      })

      this.filterBookings()

      wx.showToast({
        title: '取消成功',
        icon: 'success'
      })
    }, 1500)
  },

  // 重新预约
  rebookCourse(e) {
    const courseId = e.currentTarget.dataset.courseid
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${courseId}`
    })
  },

  // 去评价
  goToReview(e) {
    const booking = e.currentTarget.dataset.booking
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${booking.courseId}&showReview=1`
    })
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '如有疑问请联系客服\n电话：400-123-4567',
      confirmText: '拨打电话',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '4001234567'
          })
        }
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '我的健身记录',
      path: '/pages/index/index',
      imageUrl: '/images/share-bg.svg'
    }
  }
})