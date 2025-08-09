// 课程预约页面逻辑
Page({
  data: {
    dateList: [],
    selectedDate: '',
    categoryList: [
      { label: '全部', value: 'all' },
      { label: '力量训练', value: 'strength' },
      { label: '有氧运动', value: 'cardio' },
      { label: '瑜伽', value: 'yoga' },
      { label: '舞蹈', value: 'dance' },
      { label: '搏击', value: 'boxing' }
    ],
    selectedCategory: 'all',
    courseList: [],
    filteredCourses: [],
    showBookingPopup: false,
    selectedCourse: null,
    bookingLoading: false
  },

  onLoad() {
    this.initDateList()
    this.loadCourses()
  },

  onShow() {
    // 设置tabbar状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 1
      })
    }
  },

  onPullDownRefresh() {
    this.loadCourses()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  // 初始化日期列表
  initDateList() {
    const dateList = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dayNames = ['日', '一', '二', '三', '四', '五', '六']
      const dayName = i === 0 ? '今天' : `周${dayNames[date.getDay()]}`
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
      
      dateList.push({
        day: dayName,
        date: dateStr,
        fullDate: date.toISOString().split('T')[0]
      })
    }
    
    this.setData({
      dateList,
      selectedDate: dateList[0].date
    })
  },

  // 加载课程数据
  loadCourses() {
    wx.showLoading({
      title: '加载中...'
    })
    
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading()
      
      const courseList = [
        {
          id: 1,
          name: '高强度间歇训练',
          category: '力量训练',
          startTime: '09:00',
          endTime: '10:00',
          coachName: '李教练',
          location: '训练室A',
          currentMembers: 8,
          maxMembers: 12,
          price: 0,
          status: 'available',
          statusText: '可预约',
          actionText: '预约'
        },
        {
          id: 2,
          name: '瑜伽基础班',
          category: '瑜伽',
          startTime: '10:30',
          endTime: '11:30',
          coachName: '王教练',
          location: '瑜伽室',
          currentMembers: 10,
          maxMembers: 15,
          price: 50,
          status: 'available',
          statusText: '可预约',
          actionText: '预约'
        },
        {
          id: 3,
          name: '拳击训练',
          category: '搏击',
          startTime: '14:00',
          endTime: '15:00',
          coachName: '张教练',
          location: '搏击室',
          currentMembers: 6,
          maxMembers: 8,
          price: 80,
          status: 'available',
          statusText: '可预约',
          actionText: '预约'
        },
        {
          id: 4,
          name: '有氧舞蹈',
          category: '舞蹈',
          startTime: '19:00',
          endTime: '20:00',
          coachName: '刘教练',
          location: '舞蹈室',
          currentMembers: 15,
          maxMembers: 15,
          price: 0,
          status: 'full',
          statusText: '已满员',
          actionText: '已满员'
        },
        {
          id: 5,
          name: '晚间跑步',
          category: '有氧运动',
          startTime: '20:30',
          endTime: '21:30',
          coachName: '陈教练',
          location: '跑步区',
          currentMembers: 0,
          maxMembers: 20,
          price: 0,
          status: 'cancelled',
          statusText: '已取消',
          actionText: '已取消'
        }
      ]
      
      this.setData({
        courseList
      })
      
      this.filterCourses()
    }, 1000)
  },

  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date
    this.setData({
      selectedDate: date
    })
    this.filterCourses()
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      selectedCategory: category
    })
    this.filterCourses()
  },

  // 筛选课程
  filterCourses() {
    const { courseList, selectedCategory } = this.data
    
    let filteredCourses = courseList
    
    if (selectedCategory && selectedCategory !== 'all') {
      filteredCourses = courseList.filter(course => course.category === selectedCategory)
    }
    
    this.setData({
      filteredCourses
    })
  },

  // 预约课程
  bookCourse(e) {
    const course = e.currentTarget.dataset.course
    
    if (course.status !== 'available') {
      return
    }
    
    this.setData({
      selectedCourse: course,
      showBookingPopup: true
    })
  },

  // 关闭预约弹窗
  closeBookingPopup() {
    this.setData({
      showBookingPopup: false,
      selectedCourse: null
    })
  },

  // 确认预约
  confirmBooking() {
    const { selectedCourse } = this.data
    
    if (!selectedCourse) {
      return
    }
    
    this.setData({
      bookingLoading: true
    })
    
    // 模拟API调用
    setTimeout(() => {
      this.setData({
        bookingLoading: false,
        showBookingPopup: false
      })
      
      wx.showToast({
        title: '预约成功！',
        icon: 'success'
      })
      
      // 更新课程状态
      const { courseList } = this.data
      const courseIndex = courseList.findIndex(course => course.id === selectedCourse.id)
      
      if (courseIndex !== -1) {
        const updatedCourse = {
          ...courseList[courseIndex],
          currentMembers: courseList[courseIndex].currentMembers + 1
        }
        
        if (updatedCourse.currentMembers >= updatedCourse.maxMembers) {
          updatedCourse.status = 'full'
          updatedCourse.statusText = '已满员'
          updatedCourse.actionText = '已满员'
        }
        
        courseList[courseIndex] = updatedCourse
        this.setData({
          courseList
        })
        
        this.filterCourses()
      }
      
      this.setData({
        selectedCourse: null
      })
    }, 2000)
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '一起来上课吧！',
      path: '/pages/booking/booking',
      imageUrl: '/images/course-share.svg'
    }
  }
})