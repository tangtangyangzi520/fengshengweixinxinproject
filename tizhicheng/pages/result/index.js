//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: [],
    userInfo:''
  },
  onLoad: function () {
    var allUserInfo = wx.getStorageSync('bodyData');
    this.setData({
      userInfo: allUserInfo, 
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  }
})
