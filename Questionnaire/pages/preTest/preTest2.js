// pages/preTest/preTest2.js
const app = getApp()
import tracker from '../../common/utils/tracker.js'

Page({

	/**
	 * 页面的初始数据
	 */
  data: {
    topicId: 1,
    title: ""
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
  onLoad: function (options) {    
    console.log(options)
    this.setData({
      title: options.title,
      topicId: options.topicId
    })
    wx.setNavigationBarTitle({
      title: options.title
    })
    wx.updateShareMenu({
      withShareTicket: true
    })

    if (!app.globalData.userInfo) {
      wx.showLoading({
        title: '正在加载中……',
      })
      app.userInfoReadyCallback = res => {
          wx.hideLoading();
      }
    }
    tracker.firstRead({ page_id: 3003, page_name: "开始测试页" });
  },

  onStartTest: function () {
    if (app.globalData.isError) {
      app.globalData.isError = false;
      app.login();
      return;
    }
    
    if (app.globalData.userInfo == null) {
      app.openSetting()
      return
    }

    let topicId = this.data.topicId;
    wx.redirectTo({
      url: '/pages/test/test2?topicId=' + topicId,
    })

    tracker.trackData({ event_id: 3003002, event_name: "点击开始测试", action_type: "点击" })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.title,
      path: '/pages/preTest/preTest2?topicId=' + this.data.topicId + '&title=' + this.data.titlt,
      success: function (res) {
        console.log(res)
        // 转发成功
      },
      fail: function (res) {
        console.log(res)
        // 转发失败
      }
    }
  }
})