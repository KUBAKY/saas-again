// pages/members/members.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 搜索相关
    searchKeyword: '',
    activeTab: 'all',
    
    // 筛选相关
    genderFilter: 'all',
    sortBy: 'joinDate',
    
    // 会员列表
    memberList: [],
    allMembers: [], // 存储所有会员数据，用于筛选
    
    // 分页相关
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    
    // 统计数据
    memberStats: {
      total: 0,
      active: 0,
      expired: 0,
      frozen: 0
    },
    
    // 弹窗相关
    showMemberDetail: false,
    selectedMember: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadMemberData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时刷新数据
    this.loadMemberData();
  },

  /**
   * 加载会员数据
   */
  async loadMemberData() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      // 模拟API调用，实际项目中应该调用真实API
      const mockData = this.generateMockData();
      
      this.setData({
        allMembers: mockData,
        memberList: mockData,
        memberStats: this.calculateStats(mockData)
      });
      
      // 根据当前选中的标签筛选数据
      this.filterMembersByTab();
      
    } catch (error) {
      console.error('加载会员数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 生成模拟数据
   */
  generateMockData() {
    const members = [];
    const memberTypes = ['月卡', '季卡', '半年卡', '年卡', '私教卡'];
    const statuses = ['active', 'expired', 'frozen'];
    const statusTexts = { active: '正常', expired: '过期', frozen: '冻结' };
    const genders = ['male', 'female'];
    const coaches = ['张教练', '李教练', '王教练', '赵教练', '陈教练'];
    
    for (let i = 1; i <= 50; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const memberType = memberTypes[Math.floor(Math.random() * memberTypes.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const joinDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const startDate = new Date(joinDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000);
      const expireDate = new Date(startDate.getTime() + (30 + Math.random() * 335) * 24 * 60 * 60 * 1000);
      const remainingDays = Math.max(0, Math.floor((expireDate - new Date()) / (24 * 60 * 60 * 1000)));
      const hasPersonalCoach = memberType === '私教卡' || Math.random() > 0.7;
      
      members.push({
        id: i,
        name: `会员${i.toString().padStart(3, '0')}`,
        phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        avatar: Math.random() > 0.7 ? `/images/default-avatar.png` : null,
        gender: gender,
        status: remainingDays <= 0 ? 'expired' : status,
        statusText: remainingDays <= 0 ? '过期' : statusTexts[status],
        membershipType: memberType,
        startDate: this.formatDate(startDate),
        expireDate: this.formatDate(expireDate),
        joinDate: this.formatDate(joinDate),
        remainingDays: remainingDays,
        totalSpent: Math.floor(Math.random() * 10000) + 1000,
        personalCoach: hasPersonalCoach ? coaches[Math.floor(Math.random() * coaches.length)] : null,
        remainingClasses: hasPersonalCoach ? Math.floor(Math.random() * 20) + 1 : null,
        checkinCount: Math.floor(Math.random() * 100)
      });
    }
    
    return members;
  },

  /**
   * 计算统计数据
   */
  calculateStats(members) {
    const stats = {
      total: members.length,
      active: 0,
      expired: 0,
      frozen: 0
    };
    
    members.forEach(member => {
      stats[member.status]++;
    });
    
    return stats;
  },

  /**
   * 格式化日期
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 搜索输入变化
   */
  onSearchChange(e) {
    this.setData({
      searchKeyword: e.detail
    });
  },

  /**
   * 执行搜索
   */
  onSearch() {
    this.filterMembers();
  },

  /**
   * 清空搜索
   */
  onSearchClear() {
    this.setData({
      searchKeyword: ''
    });
    this.filterMembers();
  },

  /**
   * 标签切换
   */
  onTabChange(e) {
    this.setData({
      activeTab: e.detail.name
    });
    this.filterMembersByTab();
  },

  /**
   * 根据标签筛选会员
   */
  filterMembersByTab() {
    const { activeTab, allMembers } = this.data;
    let filteredMembers = allMembers;
    
    if (activeTab !== 'all') {
      if (activeTab === 'personal') {
        filteredMembers = allMembers.filter(member => member.personalCoach);
      } else {
        filteredMembers = allMembers.filter(member => member.status === activeTab);
      }
    }
    
    this.setData({
      memberList: filteredMembers
    });
    
    // 如果有搜索关键词，继续筛选
    if (this.data.searchKeyword) {
      this.filterMembers();
    }
  },

  /**
   * 筛选会员（搜索）
   */
  filterMembers() {
    const { searchKeyword, activeTab, allMembers } = this.data;
    let filteredMembers = allMembers;
    
    // 先按标签筛选
    if (activeTab !== 'all') {
      filteredMembers = filteredMembers.filter(member => member.status === activeTab);
    }
    
    // 再按搜索关键词筛选
    if (searchKeyword) {
      filteredMembers = filteredMembers.filter(member => 
        member.name.includes(searchKeyword) || 
        member.phone.includes(searchKeyword)
      );
    }
    
    this.setData({
      memberList: filteredMembers
    });
  },

  /**
   * 点击会员项
   */
  onMemberTap(e) {
    const member = e.currentTarget.dataset.member;
    this.setData({
      selectedMember: member,
      showMemberDetail: true
    });
  },

  /**
   * 关闭会员详情弹窗
   */
  closeMemberDetail() {
    this.setData({
      showMemberDetail: false,
      selectedMember: null
    });
  },

  /**
   * 续费按钮点击
   */
  onRenewTap(e) {
    e.stopPropagation();
    const member = e.currentTarget.dataset.member;
    wx.showModal({
      title: '续费确认',
      content: `确定为 ${member.name} 办理续费吗？`,
      success: (res) => {
        if (res.confirm) {
          this.renewMember(member);
        }
      }
    });
  },

  /**
   * 详情按钮点击
   */
  onDetailTap(e) {
    e.stopPropagation();
    const member = e.currentTarget.dataset.member;
    this.setData({
      selectedMember: member,
      showMemberDetail: true
    });
  },

  /**
   * 续费会员
   */
  renewMember(member) {
    wx.showToast({
      title: '续费功能开发中',
      icon: 'none'
    });
    // TODO: 实现续费逻辑
  },

  /**
   * 续费会员（详情页）
   */
  onRenewMember() {
    this.renewMember(this.data.selectedMember);
    this.closeMemberDetail();
  },

  /**
   * 冻结会员
   */
  onFreezeMember() {
    const member = this.data.selectedMember;
    wx.showModal({
      title: '冻结确认',
      content: `确定冻结会员 ${member.name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '冻结功能开发中',
            icon: 'none'
          });
          // TODO: 实现冻结逻辑
        }
      }
    });
  },

  /**
   * 解冻会员
   */
  onUnfreezeMember() {
    const member = this.data.selectedMember;
    wx.showModal({
      title: '解冻确认',
      content: `确定解冻会员 ${member.name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '解冻功能开发中',
            icon: 'none'
          });
          // TODO: 实现解冻逻辑
        }
      }
    });
  },

  /**
   * 编辑会员信息
   */
  onEditMember() {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
    // TODO: 跳转到编辑页面
  },

  /**
   * 新增会员
   */
  onAddMember() {
    wx.showToast({
      title: '新增功能开发中',
      icon: 'none'
    });
    // TODO: 跳转到新增页面
  },

  /**
   * 加载更多
   */
  loadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    // 模拟加载更多数据
    setTimeout(() => {
      this.setData({
        loading: false,
        hasMore: false // 模拟数据加载完毕
      });
      wx.showToast({
        title: '已加载全部数据',
        icon: 'none'
      });
    }, 1000);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadMemberData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadMore();
  },

  /**
   * 性别筛选
   */
  onGenderFilter(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({
      genderFilter: gender
    });
    this.applyFilters();
  },

  /**
   * 排序方式切换
   */
  onSortChange(e) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({
      sortBy: sort
    });
    this.applyFilters();
  },

  /**
   * 应用所有筛选条件
   */
  applyFilters() {
    const { searchKeyword, activeTab, genderFilter, sortBy, allMembers } = this.data;
    let filteredMembers = [...allMembers];
    
    // 按标签筛选
    if (activeTab !== 'all') {
      if (activeTab === 'personal') {
        filteredMembers = filteredMembers.filter(member => member.personalCoach);
      } else {
        filteredMembers = filteredMembers.filter(member => member.status === activeTab);
      }
    }
    
    // 按性别筛选
    if (genderFilter !== 'all') {
      filteredMembers = filteredMembers.filter(member => member.gender === genderFilter);
    }
    
    // 按搜索关键词筛选
    if (searchKeyword) {
      filteredMembers = filteredMembers.filter(member => 
        member.name.includes(searchKeyword) || 
        member.phone.includes(searchKeyword)
      );
    }
    
    // 排序
    if (sortBy === 'joinDate') {
      filteredMembers.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
    } else if (sortBy === 'expireDate') {
      filteredMembers.sort((a, b) => new Date(a.expireDate) - new Date(b.expireDate));
    }
    
    this.setData({
      memberList: filteredMembers
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止事件冒泡
  },

  /**
   * 训练记录按钮点击
   */
  onTrainingRecord(e) {
    const member = e.currentTarget.dataset.member;
    wx.navigateTo({
      url: `/pages/training/training?memberId=${member.id}&memberName=${member.name}&coachName=${member.personalCoach}`
    });
  },

  /**
   * 分配教练
   */
  onAssignCoach() {
    wx.showToast({
      title: '分配教练功能开发中',
      icon: 'none'
    });
    // TODO: 实现分配教练逻辑
  },

  /**
   * 查看训练记录
   */
  onViewTrainingRecord() {
    const member = this.data.selectedMember;
    wx.navigateTo({
      url: `/pages/training/training?memberId=${member.id}&memberName=${member.name}&coachName=${member.personalCoach}`
    });
    this.closeMemberDetail();
  }
})