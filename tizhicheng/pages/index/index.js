//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    date: '',
    sex: -1,
    height: 120,
    hArr: [],
    hasSelectHeight: false,
    sexArr: ['男', '女'],
  },
  onLoad() {
    let userData = {};
    try {
      userData = wx.getStorageSync('userData')
      if (userData) {
        this.setData({
          sex: userData.sex,
          date: userData.date,
          height: userData.height,
          hasSelectHeight: true
        })
      }
    } catch (e) {
    }
    let harr = [];
    for (let i = 50; i <= 250; i++) {
      harr.push(i + 'cm');
    }
    this.setData({
      hArr: harr
    })
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindSexChange(e) {
    let _this = this;
    wx.showActionSheet({
      itemList: ['男', '女'],
      success: function (res) {
        if (!res.cancel) {
          _this.setData({ sex: res.tapIndex })
          console.log(res.tapIndex)
        }
      }
    });
  },
  bindHeightChange(e) {
    this.setData({
      hasSelectHeight: true,
      height: e.detail.value
    })
    console.log(e.detail.value)
  },
  goStart() {
    if (this.data.sex === '') {
      this.showMsg('请选择性别');
      return;
    }
    if (this.data.date == '') {
      this.showMsg('请选择出生年月');
      return;
    }
    if (!this.data.hasSelectHeight) {
      this.showMsg('请选择身高');
      return;
    }
    wx.setStorageSync('userData', {
      sex: this.data.sex,
      date: this.data.date,
      height: this.data.height
    });
    wx.navigateTo({
      url: '/pages/connect/index?data=fd370003000000000000c9',
    })
  },
  showMsg(msg){
    wx.showModal({
      title: '温馨提示',
      content: msg,
      showCancel: false,
      success: function (res) {
      }
    });
  }
})
