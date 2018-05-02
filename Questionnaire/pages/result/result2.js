// pages/result/result2.js
const app = getApp();
import tracker from '../../common/utils/tracker.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    result: {
      topicId: 2,
      answerPicture: "",
      answerTitle: "",
      answerDesc: ""
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let title = options.title;
    wx.setNavigationBarTitle({
      title: title
    })
    this.setData({
      title: title,
      topicId: options.topicId
    })

    let resultData = wx.getStorageSync("resultData2");
    if (resultData) {
      this.setData({
        result: resultData
      })      
    }
    wx.updateShareMenu({
      withShareTicket: true
    })
    tracker.firstRead({ page_id: 3004, page_name: "测试结果页" });
  },

  onTestAgain() {
    wx.redirectTo({
      url: '/pages/preTest/preTest2?isReTest=true&title=' + this.data.title + "&topicId=" + this.data.topicId,
    })

    tracker.trackData({ event_id: 3004006, event_name: "点击再测一次", action_type: "点击" })
  },

  onBackHome() {
    wx.reLaunch({
      url: '/pages/home/home',
    })
    tracker.trackData({ event_id: 3004005, event_name: "点击回到首页", action_type: "点击" })
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
    tracker.trackData({ event_id: 3004004, event_name: "点击转发至微信群", action_type: "点击" })
    let pageTitle = this.data.title;
    let title = this.data.result.obj1 + "未来最有可能成为——";
    let topicId = this.data.topicId;
    return {
      title: title,
      path: "/pages/preTest/preTest2?topicId=" + topicId + "&title=" + pageTitle,
      success: res => {
        console.log(res)
      }
    }
  }
})