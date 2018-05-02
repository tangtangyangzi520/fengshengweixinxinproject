//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },
  onLoad: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/index/index',
    })
  }
})
