// 个人中心页面逻辑
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
      checkInDays: 0
    },
    levelText: '铜牌会员',
    upcomingBookings: 0,
    membershipStatus: '有效期至2024-12-31',
    showBenefitPopup: false,
    currentBenefit: {}
  },

  onLoad() {
    this.loadUserInfo()
    this.loadMemberInfo()
    this.loadMemberStats()
  },

  onShow() {
    // 设置tabbar状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 3
      })
    }
  },

  onPullDownRefresh() {
    this.loadUserInfo()
    this.loadMemberInfo()
    this.loadMemberStats()
    
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
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
        levelText: levelMap[memberInfo.level] || '铜牌会员'
      })
    }, 500)
  },

  // 加载会员统计
  loadMemberStats() {
    setTimeout(() => {
      this.setData({
        memberStats: {
          points: 1250,
          checkInDays: 28
        },
        upcomingBookings: 3
      })
    }, 800)
  },

  // 更换头像
  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        
        wx.showLoading({
          title: '上传中...'
        })
        
        // 模拟上传
        setTimeout(() => {
          wx.hideLoading()
          this.setData({
            'userInfo.avatar': tempFilePath
          })
          
          wx.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
        }, 2000)
      }
    })
  },

  // 显示权益详情
  showBenefitDetail(e) {
    const type = e.currentTarget.dataset.type
    
    const benefitDetails = {
      'free-courses': {
        title: '免费课程权益',
        description: '每月可免费参加3次团体课程，包括瑜伽、有氧、力量等多种课程类型。',
        rules: [
          '每月1日重置免费次数',
          '需提前24小时预约',
          '取消需提前2小时，否则扣除次数',
          '不可转让给他人使用'
        ]
      },
      'personal-training': {
        title: '私教优惠权益',
        description: '所有私人教练课程享受9折优惠，帮您更好地达成健身目标。',
        rules: [
          '适用于所有私教课程',
          '不与其他优惠叠加',
          '需提前48小时预约',
          '取消需提前4小时'
        ]
      },
      'guest-pass': {
        title: '访客通行权益',
        description: '每月可携带2位朋友免费体验健身房设施和团体课程。',
        rules: [
          '访客需提供身份证件',
          '每月限2次，不可累积',
          '访客需签署免责声明',
          '仅限团体课程和基础器械'
        ]
      },
      'equipment': {
        title: '器械优先权益',
        description: '在健身房高峰期（17:00-21:00）享受器械优先使用权。',
        rules: [
          '仅在高峰时段生效',
          '每次使用限30分钟',
          '需遵守器械使用规范',
          '与其他会员友好协商'
        ]
      }
    }
    
    this.setData({
      currentBenefit: benefitDetails[type] || {},
      showBenefitPopup: true
    })
  },

  // 关闭权益弹窗
  closeBenefitPopup() {
    this.setData({
      showBenefitPopup: false,
      currentBenefit: {}
    })
  },

  // 页面跳转
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    
    if (url) {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
  },

  // 显示设置
  showSettings() {
    wx.showActionSheet({
      itemList: ['个人资料', '隐私设置', '通知设置', '关于我们'],
      success: (res) => {
        const options = [
          '编辑个人资料',
          '隐私设置',
          '通知设置',
          '关于我们'
        ]
        
        wx.showToast({
          title: options[res.tapIndex],
          icon: 'none'
        })
      }
    })
  },

  // 显示帮助
  showHelp() {
    wx.showModal({
      title: '帮助中心',
      content: '常见问题解答、使用指南等功能正在开发中，敬请期待！',
      showCancel: false
    })
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：09:00-21:00',
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
      title: `我在健身房的${this.data.memberStats.checkInDays}天健身记录`,
      path: '/pages/index/index',
      imageUrl: '/images/profile-share.svg'
    }
  },

  onShareTimeline() {
    return {
      title: '我的健身日记',
      query: '',
      imageUrl: '/images/profile-share.svg'
    }
  }
})