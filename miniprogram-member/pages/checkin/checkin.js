// pages/checkin/checkin.js
Page({
  data: {
    currentDate: '',
    weekDay: '',
    weather: null,
    isCheckedIn: false,
    todayCheckIn: null,
    showCheckInSuccess: false,
    monthStats: {
      checkInDays: 0,
      continuousDays: 0,
      totalMinutes: 0
    },
    recentCheckIns: []
  },

  onLoad(options) {
    this.initData();
  },

  onShow() {
    this.loadCheckInStatus();
    this.loadMonthStats();
    this.loadRecentCheckIns();
  },

  onPullDownRefresh() {
    this.loadCheckInStatus();
    this.loadMonthStats();
    this.loadRecentCheckIns();
    wx.stopPullDownRefresh();
  },

  // 初始化数据
  initData() {
    const now = new Date();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    this.setData({
      currentDate: this.formatDate(now),
      weekDay: weekDays[now.getDay()]
    });

    // 模拟获取天气信息
    this.loadWeather();
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 格式化时间
  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 加载天气信息
  loadWeather() {
    // 模拟天气数据
    setTimeout(() => {
      this.setData({
        weather: {
          text: '晴',
          temperature: 22
        }
      });
    }, 500);
  },

  // 加载签到状态
  loadCheckInStatus() {
    const today = this.formatDate(new Date());
    const checkInKey = `checkin_${today}`;
    
    try {
      const todayCheckIn = wx.getStorageSync(checkInKey);
      if (todayCheckIn) {
        this.setData({
          isCheckedIn: true,
          todayCheckIn: todayCheckIn
        });
      } else {
        this.setData({
          isCheckedIn: false,
          todayCheckIn: null
        });
      }
    } catch (error) {
      console.error('加载签到状态失败:', error);
    }
  },

  // 加载月度统计
  loadMonthStats() {
    // 模拟从本地存储或服务器获取数据
    setTimeout(() => {
      this.setData({
        monthStats: {
          checkInDays: 15,
          continuousDays: 7,
          totalMinutes: 450
        }
      });
    }, 300);
  },

  // 加载最近签到记录
  loadRecentCheckIns() {
    // 模拟最近签到数据
    setTimeout(() => {
      const recentCheckIns = [
        {
          id: 1,
          date: '12-20',
          time: '09:30',
          location: '健身房A区',
          duration: 60
        },
        {
          id: 2,
          date: '12-19',
          time: '18:45',
          location: '健身房B区',
          duration: 45
        },
        {
          id: 3,
          date: '12-18',
          time: '07:20',
          location: '健身房A区',
          duration: 90
        },
        {
          id: 4,
          date: '12-17',
          time: '19:15',
          location: '健身房C区',
          duration: 30
        },
        {
          id: 5,
          date: '12-16',
          time: '08:00',
          location: '健身房A区',
          duration: 75
        }
      ];

      this.setData({
        recentCheckIns: recentCheckIns
      });
    }, 400);
  },

  // 处理签到
  handleCheckIn() {
    if (this.data.isCheckedIn) {
      wx.showToast({
        title: '今日已签到',
        icon: 'success'
      });
      return;
    }

    // 模拟获取位置信息
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.doCheckIn(res);
      },
      fail: () => {
        // 如果获取位置失败，仍然允许签到
        this.doCheckIn(null);
      }
    });
  },

  // 执行签到
  doCheckIn(locationInfo) {
    const now = new Date();
    const today = this.formatDate(now);
    const time = this.formatTime(now);
    
    const checkInData = {
      date: today,
      time: time,
      location: '健身房A区', // 可以根据位置信息确定
      timestamp: now.getTime()
    };

    // 保存到本地存储
    try {
      const checkInKey = `checkin_${today}`;
      wx.setStorageSync(checkInKey, checkInData);
      
      this.setData({
        isCheckedIn: true,
        todayCheckIn: checkInData,
        showCheckInSuccess: true
      });

      // 更新连续签到天数
      this.updateContinuousDays();
      
      // 触发震动反馈
      wx.vibrateShort();
      
    } catch (error) {
      console.error('签到失败:', error);
      wx.showToast({
        title: '签到失败，请重试',
        icon: 'error'
      });
    }
  },

  // 更新连续签到天数
  updateContinuousDays() {
    const currentStats = this.data.monthStats;
    this.setData({
      monthStats: {
        ...currentStats,
        checkInDays: currentStats.checkInDays + 1,
        continuousDays: currentStats.continuousDays + 1
      }
    });
  },

  // 关闭签到成功弹窗
  closeCheckInPopup() {
    this.setData({
      showCheckInSuccess: false
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `我已连续签到${this.data.monthStats.continuousDays}天！`,
      path: '/pages/checkin/checkin',
      imageUrl: '/images/share-bg.svg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: `健身打卡第${this.data.monthStats.continuousDays}天`,
      query: '',
      imageUrl: '/images/share-bg.svg'
    }
  }
});