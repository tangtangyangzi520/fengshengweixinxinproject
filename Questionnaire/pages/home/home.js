// pages/home/home.j
import util from '../../utils/util.js'
import tracker from '../../common/utils/tracker.js'
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // items: [{
    //   "topicId": 1,
    //   "topicTitle": "测一测你的身体多少岁？",
    //   "topicPicture": null,
    //   "testerAmount": 142
    // }]
    items: null
  },

  onItemClicked(e) {
    if (app.globalData.isError) {
      app.globalData.isError = false;
      app.login();
      return;
    }

    if (app.globalData.userInfo == null) {
      app.openSetting()
      return
    }

    const index = e.currentTarget.dataset.value;
    const item = this.data.items[index];
    console.log(item.topicTitle);
    const title = (item.topicTitle);

    let n = item.topicId == 1 ? '' : item.topicId;
    wx.navigateTo({
      url: '/pages/preTest/preTest' + n + '?topicId=' + item.topicId + '&title=' + title,
    })

    tracker.trackData({ event_id: 3001002, event_name: "点击试题", action_type: "点击", object1: item.topicTitle, object2: item.topicId })
  },

  onSubmit(e) {
    util.submitFormId(app, e.detail.formId);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (!app.globalData.userInfo) {
      wx.showLoading({
        title: '正在加载中……',
      })
      console.log(Date.now())
      app.userInfoReadyCallback = res => {
        wx.hideLoading();
      }
    }
    wx.request({
      url: app.globalData.url + "topic",
      success: res => {
        this.setData({
          items: res.data.data
        })
      }
    })
    wx.updateShareMenu({
      withShareTicket: true
    })

    tracker.firstRead({ page_id: 3001, page_name: "测试首页" });
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
      title: '测多多',
      path: '/pages/home/home',
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