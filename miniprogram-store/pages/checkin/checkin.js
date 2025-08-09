// 会员签到页面逻辑
Page({
  data: {
    searchKeyword: '',
    searchResults: [],
    searched: false,
    todayCheckins: [],
    showCheckinConfirm: false,
    selectedMember: null,
    currentTime: '',
    checkinLoading: false,
    showCheckinSuccess: false,
    checkedMember: null,
    successTime: ''
  },

  onLoad() {
    this.loadTodayCheckins()
    this.updateCurrentTime()
    
    // 每分钟更新时间
    this.timeInterval = setInterval(() => {
      this.updateCurrentTime()
    }, 60000)
  },

  onShow() {
    // 设置tabbar状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 2
      })
    }
  },

  onUnload() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  },

  onPullDownRefresh() {
    this.loadTodayCheckins()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  // 更新当前时间
  updateCurrentTime() {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })
    this.setData({
      currentTime: timeStr
    })
  },

  // 开始扫码
  startScan() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log('扫码结果:', res.result)
        
        // 模拟解析二维码获取会员信息
        this.processScanResult(res.result)
      },
      fail: (error) => {
        console.error('扫码失败:', error)
        wx.showToast({
          title: '扫码失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 处理扫码结果
  processScanResult(qrcode) {
    wx.showLoading({
      title: '识别中...'
    })
    
    // 模拟API调用解析二维码
    setTimeout(() => {
      wx.hideLoading()
      
      // 模拟会员数据
      const memberData = {
        id: '1',
        name: '张三',
        memberNumber: 'M2024001',
        phone: '138****5678',
        avatar: '/images/default-avatar.png',
        status: 'active',
        statusText: '正常',
        lastCheckin: '昨天 18:30'
      }
      
      this.showCheckinDialog(memberData)
    }, 1500)
  },

  // 搜索关键词改变
  onSearchChange(e) {
    this.setData({
      searchKeyword: e.detail,
      searched: false
    })
  },

  // 搜索会员
  searchMember() {
    const keyword = this.data.searchKeyword.trim()
    
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '搜索中...'
    })
    
    // 模拟API搜索
    setTimeout(() => {
      wx.hideLoading()
      
      // 模拟搜索结果
      const results = [
        {
          id: '1',
          name: '张三',
          memberNumber: 'M2024001',
          phone: '138****5678',
          avatar: '/images/default-avatar.png',
          status: 'active',
          statusText: '正常',
          lastCheckin: '昨天 18:30'
        },
        {
          id: '2',
          name: '李四',
          memberNumber: 'M2024002',
          phone: '139****1234',
          avatar: '/images/default-avatar.png',
          status: 'expired',
          statusText: '已过期',
          lastCheckin: '一周前'
        }
      ]
      
      this.setData({
        searchResults: keyword.includes('138') ? [results[0]] : results,
        searched: true
      })
    }, 1000)
  },

  // 选择会员
  selectMember(e) {
    const member = e.currentTarget.dataset.member
    this.showCheckinDialog(member)
  },

  // 显示签到确认对话框
  showCheckinDialog(member) {
    this.setData({
      selectedMember: member,
      showCheckinConfirm: true
    })
  },

  // 关闭签到确认
  closeCheckinConfirm() {
    this.setData({
      showCheckinConfirm: false,
      selectedMember: null
    })
  },

  // 确认签到
  confirmCheckin() {
    const member = this.data.selectedMember
    
    if (!member || member.status !== 'active') {
      wx.showToast({
        title: '该会员无法签到',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      checkinLoading: true
    })
    
    // 模拟签到API调用
    setTimeout(() => {
      this.setData({
        checkinLoading: false,
        showCheckinConfirm: false,
        showCheckinSuccess: true,
        checkedMember: member,
        successTime: this.data.currentTime
      })
      
      // 添加到今日签到记录
      const newRecord = {
        id: Date.now(),
        memberId: member.id,
        memberName: member.name,
        avatar: member.avatar,
        checkInTime: this.data.currentTime,
        type: '健身签到'
      }
      
      this.setData({
        todayCheckins: [newRecord, ...this.data.todayCheckins]
      })
      
      // 清空搜索结果
      this.setData({
        searchKeyword: '',
        searchResults: [],
        searched: false
      })
      
    }, 2000)
  },

  // 关闭签到成功弹窗
  closeCheckinSuccess() {
    this.setData({
      showCheckinSuccess: false,
      checkedMember: null
    })
  },

  // 加载今日签到记录
  loadTodayCheckins() {
    wx.showLoading({
      title: '加载中...'
    })
    
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading()
      
      const records = [
        {
          id: 1,
          memberId: '001',
          memberName: '王五',
          avatar: '/images/default-avatar.png',
          checkInTime: '09:15',
          type: '健身签到'
        },
        {
          id: 2,
          memberId: '002',
          memberName: '赵六',
          avatar: '/images/default-avatar.png',
          checkInTime: '08:45',
          type: '健身签到'
        },
        {
          id: 3,
          memberId: '003',
          memberName: '孙七',
          avatar: '/images/default-avatar.png',
          checkInTime: '08:30',
          type: '健身签到'
        }
      ]
      
      this.setData({
        todayCheckins: records
      })
    }, 800)
  },

  // 查看所有记录
  viewAllRecords() {
    wx.navigateTo({
      url: '/pages/checkin-records/checkin-records'
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '门店签到管理',
      path: '/pages/checkin/checkin',
      imageUrl: '/images/checkin-share.jpg'
    }
  }
})