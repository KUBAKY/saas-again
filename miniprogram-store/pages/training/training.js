// 训练记录页面
Page({
  data: {
    // 课程信息
    courseInfo: null,
    courseId: null,
    
    // 训练状态
    isRecording: false,
    isPaused: false,
    trainingDuration: 0,
    startTime: null,
    
    // 训练动作
    exercises: [],
    
    // 身体数据
    bodyData: {
      weight: '',
      bodyFat: '',
      muscle: '',
      heartRate: ''
    },
    
    // 媒体文件
    mediaList: [],
    
    // 训练备注
    trainingNotes: '',
    
    // 弹窗控制
    showExercisePopup: false,
    showBodyDataPopup: false,
    editingExercise: false,
    editingIndex: -1,
    
    // 表单数据
    exerciseForm: {
      name: '',
      weight: '',
      reps: '',
      duration: ''
    },
    bodyDataForm: {
      weight: '',
      bodyFat: '',
      muscle: '',
      heartRate: ''
    },
    
    // 定时器
    timer: null
  },

  onLoad(options) {
    const { courseId, action } = options;
    
    this.setData({
      courseId: courseId
    });
    
    if (courseId) {
      this.loadCourseInfo(courseId);
    }
    
    // 如果是完成课程操作，自动开始记录
    if (action === 'complete') {
      this.startRecording();
    }
  },

  onUnload() {
    // 清理定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  // 加载课程信息
  async loadCourseInfo(courseId) {
    try {
      // 模拟API调用
      const courseInfo = {
        id: courseId,
        courseType: '力量训练',
        startTime: '09:00',
        endTime: '10:00',
        member: {
          id: 1,
          name: '张三',
          phone: '138****1234'
        }
      };
      
      this.setData({
        courseInfo: courseInfo
      });
    } catch (error) {
      console.error('加载课程信息失败:', error);
    }
  },

  // 开始记录训练
  startRecording() {
    const now = Date.now();
    
    this.setData({
      isRecording: true,
      isPaused: false,
      startTime: now,
      trainingDuration: 0
    });
    
    // 启动计时器
    this.startTimer();
    
    wx.showToast({
      title: '开始记录训练',
      icon: 'success'
    });
  },

  // 暂停/继续记录
  pauseRecording() {
    if (this.data.isPaused) {
      // 继续记录
      this.setData({
        isPaused: false,
        startTime: Date.now() - this.data.trainingDuration * 1000
      });
      this.startTimer();
      
      wx.showToast({
        title: '继续记录',
        icon: 'success'
      });
    } else {
      // 暂停记录
      this.setData({
        isPaused: true
      });
      
      if (this.data.timer) {
        clearInterval(this.data.timer);
      }
      
      wx.showToast({
        title: '暂停记录',
        icon: 'success'
      });
    }
  },

  // 启动计时器
  startTimer() {
    const timer = setInterval(() => {
      if (!this.data.isPaused) {
        const duration = Math.floor((Date.now() - this.data.startTime) / 1000);
        this.setData({
          trainingDuration: duration
        });
      }
    }, 1000);
    
    this.setData({
      timer: timer
    });
  },

  // 格式化时间显示
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  },

  // 添加动作
  addExercise() {
    this.setData({
      showExercisePopup: true,
      editingExercise: false,
      exerciseForm: {
        name: '',
        weight: '',
        reps: '',
        duration: ''
      }
    });
  },

  // 编辑动作
  editExercise(e) {
    const index = e.currentTarget.dataset.index;
    const exercise = this.data.exercises[index];
    
    this.setData({
      showExercisePopup: true,
      editingExercise: true,
      editingIndex: index,
      exerciseForm: {
        name: exercise.name,
        weight: exercise.sets[0]?.weight || '',
        reps: exercise.sets[0]?.reps || '',
        duration: exercise.sets[0]?.duration || ''
      }
    });
  },

  // 删除动作
  deleteExercise(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个动作吗？',
      success: (res) => {
        if (res.confirm) {
          const exercises = [...this.data.exercises];
          exercises.splice(index, 1);
          
          this.setData({
            exercises: exercises
          });
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 保存动作
  saveExercise() {
    const { exerciseForm, editingExercise, editingIndex } = this.data;
    
    if (!exerciseForm.name.trim()) {
      wx.showToast({
        title: '请输入动作名称',
        icon: 'error'
      });
      return;
    }
    
    const exerciseData = {
      id: editingExercise ? this.data.exercises[editingIndex].id : Date.now(),
      name: exerciseForm.name,
      sets: [{
        weight: parseFloat(exerciseForm.weight) || 0,
        reps: parseInt(exerciseForm.reps) || 0,
        duration: parseInt(exerciseForm.duration) || 0
      }]
    };
    
    let exercises = [...this.data.exercises];
    
    if (editingExercise) {
      exercises[editingIndex] = exerciseData;
    } else {
      exercises.push(exerciseData);
    }
    
    this.setData({
      exercises: exercises,
      showExercisePopup: false
    });
    
    wx.showToast({
      title: editingExercise ? '修改成功' : '添加成功',
      icon: 'success'
    });
  },

  // 添加组数
  addSet(e) {
    const index = e.currentTarget.dataset.index;
    const exercises = [...this.data.exercises];
    const lastSet = exercises[index].sets[exercises[index].sets.length - 1];
    
    // 复制最后一组的数据作为新组的默认值
    exercises[index].sets.push({
      weight: lastSet.weight,
      reps: lastSet.reps,
      duration: lastSet.duration
    });
    
    this.setData({
      exercises: exercises
    });
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  // 编辑身体数据
  editBodyData() {
    this.setData({
      showBodyDataPopup: true,
      bodyDataForm: { ...this.data.bodyData }
    });
  },

  // 保存身体数据
  saveBodyData() {
    this.setData({
      bodyData: { ...this.data.bodyDataForm },
      showBodyDataPopup: false
    });
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  // 添加媒体文件
  addMedia() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择', '录制视频'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.takePhoto();
            break;
          case 1:
            this.chooseImage();
            break;
          case 2:
            this.recordVideo();
            break;
        }
      }
    });
  },

  // 拍照
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        this.addMediaToList(res.tempFiles[0], 'image');
      }
    });
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 9 - this.data.mediaList.length,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        res.tempFiles.forEach(file => {
          this.addMediaToList(file, 'image');
        });
      }
    });
  },

  // 录制视频
  recordVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['camera'],
      maxDuration: 60,
      success: (res) => {
        this.addMediaToList(res.tempFiles[0], 'video');
      }
    });
  },

  // 添加媒体到列表
  addMediaToList(file, type) {
    const mediaList = [...this.data.mediaList];
    mediaList.push({
      id: Date.now(),
      url: file.tempFilePath,
      type: type,
      size: file.size
    });
    
    this.setData({
      mediaList: mediaList
    });
  },

  // 预览媒体
  previewMedia(e) {
    const index = e.currentTarget.dataset.index;
    const media = this.data.mediaList[index];
    
    if (media.type === 'image') {
      const urls = this.data.mediaList
        .filter(item => item.type === 'image')
        .map(item => item.url);
      
      wx.previewImage({
        urls: urls,
        current: media.url
      });
    }
  },

  // 删除媒体
  deleteMedia(e) {
    e.stopPropagation();
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个文件吗？',
      success: (res) => {
        if (res.confirm) {
          const mediaList = [...this.data.mediaList];
          mediaList.splice(index, 1);
          
          this.setData({
            mediaList: mediaList
          });
        }
      }
    });
  },

  // 完成训练
  completeTraining() {
    if (this.data.exercises.length === 0) {
      wx.showModal({
        title: '提示',
        content: '还没有记录任何训练动作，确定要完成训练吗？',
        success: (res) => {
          if (res.confirm) {
            this.saveTrainingRecord();
          }
        }
      });
    } else {
      this.saveTrainingRecord();
    }
  },

  // 保存训练记录
  async saveTrainingRecord() {
    try {
      // 停止计时器
      if (this.data.timer) {
        clearInterval(this.data.timer);
      }
      
      const trainingRecord = {
        courseId: this.data.courseId,
        courseInfo: this.data.courseInfo,
        duration: this.data.trainingDuration,
        exercises: this.data.exercises,
        bodyData: this.data.bodyData,
        mediaList: this.data.mediaList,
        notes: this.data.trainingNotes,
        completedAt: new Date().toISOString()
      };
      
      // 模拟保存到服务器
      console.log('保存训练记录:', trainingRecord);
      
      wx.showToast({
        title: '训练记录已保存',
        icon: 'success',
        duration: 2000
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      
    } catch (error) {
      console.error('保存训练记录失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  // 关闭弹窗
  closeExercisePopup() {
    this.setData({
      showExercisePopup: false
    });
  },

  closeBodyDataPopup() {
    this.setData({
      showBodyDataPopup: false
    });
  },

  // 表单输入事件
  onExerciseNameChange(e) {
    this.setData({
      'exerciseForm.name': e.detail
    });
  },

  onWeightChange(e) {
    this.setData({
      'exerciseForm.weight': e.detail
    });
  },

  onRepsChange(e) {
    this.setData({
      'exerciseForm.reps': e.detail
    });
  },

  onDurationChange(e) {
    this.setData({
      'exerciseForm.duration': e.detail
    });
  },

  onBodyWeightChange(e) {
    this.setData({
      'bodyDataForm.weight': e.detail
    });
  },

  onBodyFatChange(e) {
    this.setData({
      'bodyDataForm.bodyFat': e.detail
    });
  },

  onMuscleChange(e) {
    this.setData({
      'bodyDataForm.muscle': e.detail
    });
  },

  onHeartRateChange(e) {
    this.setData({
      'bodyDataForm.heartRate': e.detail
    });
  },

  onNotesChange(e) {
    this.setData({
      trainingNotes: e.detail
    });
  }
});