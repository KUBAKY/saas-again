// 课程管理页面
Page({
  data: {
    // 当前角色：personal(私教) / group(团课)
    activeRole: 'personal',
    
    // 时间选择
    activeTimeTab: 'today',
    currentDate: '',
    showCalendar: false,
    
    // 课程统计
    courseStats: {
      total: 0,
      completed: 0,
      upcoming: 0,
      cancelled: 0
    },
    
    // 私教课程列表
    personalCourses: [],
    
    // 团课列表
    groupCourses: [],
    
    // 弹窗控制
    showCourseDetailPopup: false,
    showMembersPopup: false,
    selectedCourse: null,
    courseMembers: [],
    
    // 加载状态
    loading: false
  },

  onLoad() {
    this.initCurrentDate();
    this.loadCourseData();
  },

  onShow() {
    this.loadCourseData();
  },

  // 初始化当前日期
  initCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    this.setData({
      currentDate: `${year}-${month}-${day}`
    });
  },

  // 切换角色
  switchRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({
      activeRole: role
    });
    this.loadCourseData();
  },

  // 切换时间标签
  switchTimeTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTimeTab: tab
    });
    this.loadCourseData();
  },

  // 显示日期选择器
  showDatePicker() {
    this.setData({
      showCalendar: true
    });
  },

  // 关闭日期选择器
  closeCalendar() {
    this.setData({
      showCalendar: false
    });
  },

  // 确认日期选择
  onDateConfirm(e) {
    const date = new Date(e.detail);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    this.setData({
      currentDate: `${year}-${month}-${day}`,
      showCalendar: false
    });
    this.loadCourseData();
  },

  // 加载课程数据
  async loadCourseData() {
    this.setData({ loading: true });
    
    try {
      if (this.data.activeRole === 'personal') {
        await this.loadPersonalCourses();
      } else {
        await this.loadGroupCourses();
      }
      this.calculateStats();
    } catch (error) {
      console.error('加载课程数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载私教课程
  async loadPersonalCourses() {
    // 模拟API调用
    const mockData = [
      {
        id: 1,
        startTime: '09:00',
        endTime: '10:00',
        status: 'upcoming',
        statusText: '待上课',
        courseType: '力量训练',
        duration: 60,
        location: '训练区A',
        member: {
          id: 1,
          name: '张三',
          phone: '138****1234',
          avatar: '',
          goal: '增肌塑形'
        }
      },
      {
        id: 2,
        startTime: '14:00',
        endTime: '15:00',
        status: 'completed',
        statusText: '已完成',
        courseType: '有氧训练',
        duration: 60,
        location: '训练区B',
        member: {
          id: 2,
          name: '李四',
          phone: '139****5678',
          avatar: '',
          goal: '减脂塑形'
        }
      },
      {
        id: 3,
        startTime: '16:00',
        endTime: '17:00',
        status: 'ongoing',
        statusText: '进行中',
        courseType: '功能性训练',
        duration: 60,
        location: '训练区C',
        member: {
          id: 3,
          name: '王五',
          phone: '137****9012',
          avatar: '',
          goal: '康复训练'
        }
      }
    ];

    this.setData({
      personalCourses: mockData
    });
  },

  // 加载团课数据
  async loadGroupCourses() {
    // 模拟API调用
    const mockData = [
      {
        id: 1,
        startTime: '10:00',
        endTime: '11:00',
        status: 'upcoming',
        statusText: '待开始',
        courseName: '瑜伽基础班',
        location: '团课教室1',
        instructor: '张教练',
        currentCount: 8,
        maxCapacity: 15,
        capacityPercentage: 53
      },
      {
        id: 2,
        startTime: '19:00',
        endTime: '20:00',
        status: 'ongoing',
        statusText: '进行中',
        courseName: '动感单车',
        location: '团课教室2',
        instructor: '李教练',
        currentCount: 12,
        maxCapacity: 20,
        capacityPercentage: 60
      },
      {
        id: 3,
        startTime: '20:30',
        endTime: '21:30',
        status: 'upcoming',
        statusText: '待开始',
        courseName: '普拉提',
        location: '团课教室3',
        instructor: '王教练',
        currentCount: 6,
        maxCapacity: 12,
        capacityPercentage: 50
      }
    ];

    this.setData({
      groupCourses: mockData
    });
  },

  // 计算统计数据
  calculateStats() {
    const courses = this.data.activeRole === 'personal' ? this.data.personalCourses : this.data.groupCourses;
    
    const stats = {
      total: courses.length,
      completed: courses.filter(c => c.status === 'completed').length,
      upcoming: courses.filter(c => c.status === 'upcoming').length,
      cancelled: courses.filter(c => c.status === 'cancelled').length
    };

    this.setData({
      courseStats: stats
    });
  },

  // 显示课程详情
  showCourseDetail(e) {
    const course = e.currentTarget.dataset.course;
    this.setData({
      selectedCourse: course,
      showCourseDetailPopup: true
    });
  },

  // 显示团课详情
  showGroupCourseDetail(e) {
    const course = e.currentTarget.dataset.course;
    this.setData({
      selectedCourse: course,
      showCourseDetailPopup: true
    });
  },

  // 关闭课程详情
  closeCourseDetail() {
    this.setData({
      showCourseDetailPopup: false,
      selectedCourse: null
    });
  },

  // 开始私教课程
  startCourse(e) {
    e.stopPropagation();
    const courseId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认开始',
      content: '确定要开始这节课程吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateCourseStatus(courseId, 'ongoing');
          wx.showToast({
            title: '课程已开始',
            icon: 'success'
          });
        }
      }
    });
  },

  // 结束课程
  endCourse(e) {
    e.stopPropagation();
    const courseId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认结束',
      content: '确定要结束这节课程吗？',
      success: (res) => {
        if (res.confirm) {
          // 跳转到训练记录页面
          wx.navigateTo({
            url: `/pages/training/training?courseId=${courseId}&action=complete`
          });
        }
      }
    });
  },

  // 开始团课
  startGroupCourse(e) {
    e.stopPropagation();
    const courseId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '开始签到',
      content: '确定要开始课程签到吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateCourseStatus(courseId, 'ongoing');
          wx.showToast({
            title: '签到已开始',
            icon: 'success'
          });
        }
      }
    });
  },

  // 结束团课
  endGroupCourse(e) {
    e.stopPropagation();
    const courseId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认结束',
      content: '确定要结束这节团课吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateCourseStatus(courseId, 'completed');
          wx.showToast({
            title: '课程已结束',
            icon: 'success'
          });
        }
      }
    });
  },

  // 调课申请
  reschedule(e) {
    e.stopPropagation();
    const courseId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '调课申请',
      content: '是否要申请调整这节课程？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '申请已提交',
            icon: 'success'
          });
        }
      }
    });
  },

  // 查看学员
  viewMembers(e) {
    e.stopPropagation();
    const courseId = e.currentTarget.dataset.id;
    
    // 模拟学员数据
    const mockMembers = [
      {
        id: 1,
        name: '张三',
        phone: '138****1234',
        avatar: '',
        checkedIn: true
      },
      {
        id: 2,
        name: '李四',
        phone: '139****5678',
        avatar: '',
        checkedIn: false
      },
      {
        id: 3,
        name: '王五',
        phone: '137****9012',
        avatar: '',
        checkedIn: true
      }
    ];

    this.setData({
      courseMembers: mockMembers,
      showMembersPopup: true
    });
  },

  // 关闭学员列表
  closeMembersPopup() {
    this.setData({
      showMembersPopup: false,
      courseMembers: []
    });
  },

  // 添加课程
  addCourse() {
    wx.navigateTo({
      url: '/pages/course-add/course-add'
    });
  },

  // 从详情页开始课程
  startCourseFromDetail() {
    const courseId = this.data.selectedCourse.id;
    this.updateCourseStatus(courseId, 'ongoing');
    this.closeCourseDetail();
    wx.showToast({
      title: '课程已开始',
      icon: 'success'
    });
  },

  // 从详情页结束课程
  endCourseFromDetail() {
    const courseId = this.data.selectedCourse.id;
    this.closeCourseDetail();
    
    // 跳转到训练记录页面
    wx.navigateTo({
      url: `/pages/training/training?courseId=${courseId}&action=complete`
    });
  },

  // 从详情页申请调课
  rescheduleFromDetail() {
    wx.showModal({
      title: '调课申请',
      content: '是否要申请调整这节课程？',
      success: (res) => {
        if (res.confirm) {
          this.closeCourseDetail();
          wx.showToast({
            title: '申请已提交',
            icon: 'success'
          });
        }
      }
    });
  },

  // 更新课程状态
  updateCourseStatus(courseId, status) {
    const statusMap = {
      'upcoming': '待上课',
      'ongoing': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };

    if (this.data.activeRole === 'personal') {
      const courses = this.data.personalCourses.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            status: status,
            statusText: statusMap[status]
          };
        }
        return course;
      });
      
      this.setData({
        personalCourses: courses
      });
    } else {
      const courses = this.data.groupCourses.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            status: status,
            statusText: statusMap[status]
          };
        }
        return course;
      });
      
      this.setData({
        groupCourses: courses
      });
    }
    
    this.calculateStats();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadCourseData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});