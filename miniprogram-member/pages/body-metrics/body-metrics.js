// 身体数据记录页面逻辑
Page({
  data: {
    userProfile: {
      avatar: '/images/default-avatar.svg',
      name: '健身达人',
      age: 25,
      height: 175,
      targetWeight: 70
    },
    currentMetrics: {
      weight: 0,
      bodyFat: 0,
      muscleMass: 0,
      bmi: 0,
      lastUpdated: ''
    },
    metricsHistory: [],
    activeTab: 0, // 0: 体重, 1: 体脂, 2: 肌肉量
    showAddDialog: false,
    newMetrics: {
      weight: '',
      bodyFat: '',
      muscleMass: '',
      date: '',
      note: ''
    },
    chartData: {
      weight: [],
      bodyFat: [],
      muscleMass: []
    },
    loading: false,
    showTargetDialog: false,
    targetWeight: '',
    achievements: [],
    showAchievementPopup: false,
    selectedAchievement: null
  },

  onLoad() {
    this.loadUserProfile()
    this.loadCurrentMetrics()
    this.loadMetricsHistory()
    this.loadAchievements()
    this.initDate()
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadCurrentMetrics()
  },

  onPullDownRefresh() {
    this.loadUserProfile()
    this.loadCurrentMetrics()
    this.loadMetricsHistory()
    this.loadAchievements()
    
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1500)
  },

  // 初始化日期
  initDate() {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    this.setData({
      'newMetrics.date': dateStr
    })
  },

  // 加载用户信息
  loadUserProfile() {
    setTimeout(() => {
      this.setData({
        userProfile: {
          avatar: '/images/default-avatar.svg',
          name: '健身达人',
          age: 25,
          height: 175,
          targetWeight: 70
        }
      })
    }, 300)
  },

  // 加载当前身体数据
  loadCurrentMetrics() {
    this.setData({ loading: true })
    
    setTimeout(() => {
      const currentMetrics = {
        weight: 72.5,
        bodyFat: 18.2,
        muscleMass: 45.8,
        bmi: 23.7,
        lastUpdated: '2024-01-10'
      }
      
      this.setData({
        currentMetrics,
        loading: false
      })
    }, 800)
  },

  // 加载历史数据
  loadMetricsHistory() {
    setTimeout(() => {
      const history = this.generateMockHistory()
      const chartData = this.processChartData(history)
      
      this.setData({
        metricsHistory: history,
        chartData
      })
    }, 1000)
  },

  // 生成模拟历史数据
  generateMockHistory() {
    const history = []
    const today = new Date()
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // 模拟数据变化趋势
      const baseWeight = 75 - (i * 0.08) // 体重逐渐下降
      const weight = baseWeight + (Math.random() - 0.5) * 2
      const bodyFat = 22 - (i * 0.12) + (Math.random() - 0.5) * 1.5
      const muscleMass = 42 + (i * 0.12) + (Math.random() - 0.5) * 1
      
      if (i % 3 === 0) { // 每3天记录一次
        history.push({
          id: Date.now() + i,
          date: this.formatDate(date),
          weight: Math.round(weight * 10) / 10,
          bodyFat: Math.round(bodyFat * 10) / 10,
          muscleMass: Math.round(muscleMass * 10) / 10,
          bmi: Math.round((weight / Math.pow(1.75, 2)) * 10) / 10,
          note: i % 9 === 0 ? '今天训练强度很高' : ''
        })
      }
    }
    
    return history.reverse()
  },

  // 处理图表数据
  processChartData(history) {
    return {
      weight: history.map(item => ({
        date: item.date,
        value: item.weight
      })),
      bodyFat: history.map(item => ({
        date: item.date,
        value: item.bodyFat
      })),
      muscleMass: history.map(item => ({
        date: item.date,
        value: item.muscleMass
      }))
    }
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 切换标签页
  switchTab(e) {
    const tabIndex = e.currentTarget.dataset.index
    this.setData({
      activeTab: tabIndex
    })
  },

  // 显示添加数据对话框
  showAddDialog() {
    this.setData({
      showAddDialog: true
    })
  },

  // 关闭添加数据对话框
  closeAddDialog() {
    this.setData({
      showAddDialog: false,
      newMetrics: {
        weight: '',
        bodyFat: '',
        muscleMass: '',
        date: this.data.newMetrics.date,
        note: ''
      }
    })
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`newMetrics.${field}`]: value
    })
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      'newMetrics.date': e.detail.value
    })
  },

  // 提交新数据
  submitMetrics() {
    const { newMetrics } = this.data
    
    // 验证数据
    if (!newMetrics.weight || !newMetrics.bodyFat || !newMetrics.muscleMass) {
      wx.showToast({
        title: '请填写完整数据',
        icon: 'none'
      })
      return
    }

    if (parseFloat(newMetrics.weight) < 30 || parseFloat(newMetrics.weight) > 200) {
      wx.showToast({
        title: '请输入合理的体重数据',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '保存中...' })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 计算BMI
      const weight = parseFloat(newMetrics.weight)
      const height = this.data.userProfile.height / 100
      const bmi = Math.round((weight / Math.pow(height, 2)) * 10) / 10
      
      const newRecord = {
        id: Date.now(),
        date: newMetrics.date,
        weight: parseFloat(newMetrics.weight),
        bodyFat: parseFloat(newMetrics.bodyFat),
        muscleMass: parseFloat(newMetrics.muscleMass),
        bmi: bmi,
        note: newMetrics.note
      }
      
      // 更新历史记录
      const updatedHistory = [...this.data.metricsHistory, newRecord]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      
      // 更新当前数据
      const currentMetrics = {
        weight: newRecord.weight,
        bodyFat: newRecord.bodyFat,
        muscleMass: newRecord.muscleMass,
        bmi: newRecord.bmi,
        lastUpdated: newRecord.date
      }
      
      // 更新图表数据
      const chartData = this.processChartData(updatedHistory)
      
      this.setData({
        metricsHistory: updatedHistory,
        currentMetrics,
        chartData,
        showAddDialog: false
      })
      
      // 重置表单
      this.closeAddDialog()
      
      wx.showToast({
        title: '记录成功！',
        icon: 'success'
      })

      // 检查是否达成成就
      this.checkAchievements(newRecord)
      
    }, 1500)
  },

  // 检查成就
  checkAchievements(newRecord) {
    const { userProfile, metricsHistory } = this.data
    
    // 检查各种成就条件
    let newAchievements = []
    
    // 达到目标体重
    if (Math.abs(newRecord.weight - userProfile.targetWeight) <= 0.5) {
      newAchievements.push({
        id: 'target_weight',
        title: '目标达成',
        description: '恭喜你达到了目标体重！',
        icon: '🎯'
      })
    }
    
    // 连续记录
    if (metricsHistory.length >= 7) {
      newAchievements.push({
        id: 'consistent_tracking',
        title: '坚持记录',
        description: '已连续记录身体数据7次',
        icon: '📊'
      })
    }
    
    // 体脂率优化
    if (newRecord.bodyFat < 20 && newRecord.bodyFat > 10) {
      newAchievements.push({
        id: 'body_fat_optimal',
        title: '体脂达标',
        description: '体脂率进入健康范围',
        icon: '💪'
      })
    }
    
    if (newAchievements.length > 0) {
      this.showAchievementNotification(newAchievements[0])
    }
  },

  // 显示成就通知
  showAchievementNotification(achievement) {
    this.setData({
      selectedAchievement: achievement,
      showAchievementPopup: true
    })
  },

  // 关闭成就弹窗
  closeAchievementPopup() {
    this.setData({
      showAchievementPopup: false,
      selectedAchievement: null
    })
  },

  // 显示目标设置对话框
  showTargetDialog() {
    this.setData({
      showTargetDialog: true,
      targetWeight: String(this.data.userProfile.targetWeight)
    })
  },

  // 关闭目标设置对话框
  closeTargetDialog() {
    this.setData({
      showTargetDialog: false
    })
  },

  // 目标体重输入
  onTargetWeightInput(e) {
    this.setData({
      targetWeight: e.detail.value
    })
  },

  // 保存目标体重
  saveTargetWeight() {
    const targetWeight = parseFloat(this.data.targetWeight)
    
    if (!targetWeight || targetWeight < 30 || targetWeight > 200) {
      wx.showToast({
        title: '请输入合理的目标体重',
        icon: 'none'
      })
      return
    }

    this.setData({
      'userProfile.targetWeight': targetWeight,
      showTargetDialog: false
    })

    wx.showToast({
      title: '目标已更新',
      icon: 'success'
    })
  },

  // 加载成就列表
  loadAchievements() {
    setTimeout(() => {
      this.setData({
        achievements: [
          {
            id: 'first_record',
            title: '首次记录',
            description: '完成第一次身体数据记录',
            icon: '🌟',
            unlocked: true,
            date: '2024-01-01'
          },
          {
            id: 'week_streak',
            title: '一周打卡',
            description: '连续记录一周身体数据',
            icon: '📅',
            unlocked: true,
            date: '2024-01-08'
          },
          {
            id: 'target_weight',
            title: '目标达成',
            description: '达到目标体重',
            icon: '🎯',
            unlocked: false
          }
        ]
      })
    }, 500)
  },

  // 删除记录
  deleteRecord(e) {
    const recordId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '删除记录',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedHistory = this.data.metricsHistory.filter(item => item.id !== recordId)
          const chartData = this.processChartData(updatedHistory)
          
          this.setData({
            metricsHistory: updatedHistory,
            chartData
          })
          
          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
        }
      }
    })
  },

  // 获取BMI状态
  getBMIStatus(bmi) {
    if (bmi < 18.5) return { text: '偏瘦', color: '#409eff' }
    if (bmi < 24) return { text: '正常', color: '#67c23a' }
    if (bmi < 28) return { text: '超重', color: '#e6a23c' }
    return { text: '肥胖', color: '#f56c6c' }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '我的健身数据记录',
      path: '/pages/index/index',
      imageUrl: '/images/share-bg.svg'
    }
  }
})