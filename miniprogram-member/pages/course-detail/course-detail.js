// 课程详情页面逻辑
Page({
  data: {
    courseId: '',
    courseDetail: {},
    coachInfo: {},
    isBooked: false,
    availableTimeSlots: [],
    selectedTimeSlot: null,
    showBookingPopup: false,
    bookingLoading: false,
    reviews: [],
    showReviewPopup: false,
    newReview: {
      rating: 5,
      comment: ''
    }
  },

  onLoad(options) {
    this.setData({
      courseId: options.id || '1'
    })
    this.loadCourseDetail()
    this.loadAvailableTimeSlots()
    this.loadReviews()
  },

  onShareAppMessage() {
    return {
      title: `${this.data.courseDetail.name} - 一起来上课吧！`,
      path: `/pages/course-detail/course-detail?id=${this.data.courseId}`,
      imageUrl: this.data.courseDetail.coverImage || '/images/course-share.svg'
    }
  },

  // 加载课程详情
  loadCourseDetail() {
    wx.showLoading({ title: '加载中...' })
    
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading()
      
      const courseDetail = {
        id: this.data.courseId,
        name: '高强度间歇训练',
        description: 'HIIT高强度间歇训练是一种高效的燃脂运动方式，通过高强度运动和低强度恢复的交替进行，能够在短时间内达到最佳的锻炼效果。',
        coverImage: '/images/course-cover.jpg',
        category: '力量训练',
        level: 'intermediate',
        levelText: '中级',
        duration: 60,
        maxParticipants: 12,
        currentParticipants: 8,
        price: 80,
        originalPrice: 100,
        tags: ['燃脂', '塑形', '提升体能'],
        benefits: [
          '快速燃烧脂肪，提高新陈代谢',
          '增强心肺功能和耐力',
          '塑造紧致身体线条',
          '提升整体体能水平'
        ],
        requirements: [
          '具备基础运动能力',
          '无严重心血管疾病',
          '建议运动前进行热身'
        ],
        equipment: ['哑铃', '壶铃', '瑜伽垫', '阻力带'],
        location: '训练室A',
        rating: 4.8,
        totalSessions: 156,
        coachId: '1'
      }
      
      const coachInfo = {
        id: '1',
        name: '李教练',
        avatar: '/images/coach-avatar.jpg',
        specialties: ['力量训练', 'HIIT', '体能训练'],
        experience: 5,
        rating: 4.9,
        introduction: '专业健身教练，拥有5年丰富教学经验，擅长力量训练和HIIT课程，帮助学员快速达成健身目标。',
        certifications: ['NASM认证私人教练', 'HIIT专业认证']
      }
      
      this.setData({
        courseDetail,
        coachInfo
      })
    }, 1000)
  },

  // 加载可预约时间段
  loadAvailableTimeSlots() {
    setTimeout(() => {
      const timeSlots = [
        {
          id: '1',
          date: '2024-01-10',
          dateText: '今天',
          startTime: '09:00',
          endTime: '10:00',
          available: true,
          currentParticipants: 6,
          maxParticipants: 12
        },
        {
          id: '2', 
          date: '2024-01-10',
          dateText: '今天',
          startTime: '19:00',
          endTime: '20:00',
          available: true,
          currentParticipants: 10,
          maxParticipants: 12
        },
        {
          id: '3',
          date: '2024-01-11',
          dateText: '明天',
          startTime: '09:00',
          endTime: '10:00',
          available: false,
          currentParticipants: 12,
          maxParticipants: 12
        }
      ]
      
      this.setData({
        availableTimeSlots: timeSlots
      })
    }, 500)
  },

  // 加载评价
  loadReviews() {
    setTimeout(() => {
      const reviews = [
        {
          id: '1',
          memberName: '健身小白',
          memberAvatar: '/images/member1.jpg',
          rating: 5,
          comment: '教练很专业，动作指导很到位，强度适中，出汗很爽！',
          date: '2024-01-08',
          helpful: 12
        },
        {
          id: '2',
          memberName: '运动达人',
          memberAvatar: '/images/member2.jpg', 
          rating: 4,
          comment: '课程设计不错，就是人有点多，希望能控制下人数。',
          date: '2024-01-07',
          helpful: 8
        }
      ]
      
      this.setData({
        reviews
      })
    }, 800)
  },

  // 选择时间段
  selectTimeSlot(e) {
    const slot = e.currentTarget.dataset.slot
    if (!slot.available) return
    
    this.setData({
      selectedTimeSlot: slot
    })
  },

  // 预约课程
  bookCourse() {
    if (!this.data.selectedTimeSlot) {
      wx.showToast({
        title: '请选择上课时间',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      showBookingPopup: true
    })
  },

  // 关闭预约弹窗
  closeBookingPopup() {
    this.setData({
      showBookingPopup: false
    })
  },

  // 确认预约
  confirmBooking() {
    this.setData({
      bookingLoading: true
    })
    
    // 模拟API调用
    setTimeout(() => {
      this.setData({
        bookingLoading: false,
        showBookingPopup: false,
        isBooked: true
      })
      
      wx.showToast({
        title: '预约成功！',
        icon: 'success'
      })
    }, 2000)
  },

  // 取消预约
  cancelBooking() {
    wx.showModal({
      title: '取消预约',
      content: '确定要取消预约吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          
          setTimeout(() => {
            wx.hideLoading()
            this.setData({
              isBooked: false,
              selectedTimeSlot: null
            })
            
            wx.showToast({
              title: '已取消预约',
              icon: 'success'
            })
          }, 1000)
        }
      }
    })
  },

  // 查看教练详情
  viewCoachDetail() {
    wx.navigateTo({
      url: `/pages/coach-detail/coach-detail?id=${this.data.coachInfo.id}`
    })
  },

  // 显示评价弹窗
  showReviewDialog() {
    if (!this.data.isBooked) {
      wx.showToast({
        title: '请先预约课程',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      showReviewPopup: true
    })
  },

  // 关闭评价弹窗
  closeReviewPopup() {
    this.setData({
      showReviewPopup: false,
      'newReview.rating': 5,
      'newReview.comment': ''
    })
  },

  // 评分变化
  onRatingChange(e) {
    this.setData({
      'newReview.rating': e.detail
    })
  },

  // 评价内容变化
  onCommentInput(e) {
    this.setData({
      'newReview.comment': e.detail.value
    })
  },

  // 提交评价
  submitReview() {
    const { newReview } = this.data
    
    if (!newReview.comment.trim()) {
      wx.showToast({
        title: '请输入评价内容',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({ title: '提交中...' })
    
    setTimeout(() => {
      wx.hideLoading()
      this.setData({
        showReviewPopup: false
      })
      
      wx.showToast({
        title: '评价成功！',
        icon: 'success'
      })
      
      // 重新加载评价
      this.loadReviews()
    }, 1500)
  },

  // 点赞评价
  likeReview(e) {
    const reviewId = e.currentTarget.dataset.id
    const reviews = this.data.reviews.map(review => {
      if (review.id === reviewId) {
        review.helpful += 1
      }
      return review
    })
    
    this.setData({
      reviews
    })
    
    wx.showToast({
      title: '点赞成功',
      icon: 'none'
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
  }
})