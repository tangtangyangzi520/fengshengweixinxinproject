// pages/result/result.js
const app = getApp();
import tracker from '../../common/utils/tracker.js'

Page({
	/**
	 * 页面的初始数据
	 */
  data: {
    title: "",
    result: {
      topicId: 1,
      feedbackNumber: 0,
      answerPicture: "",
      answerTitle: "我的身体年龄是",
      answerSplit: "岁",
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

    let resultData = wx.getStorageSync("resultData1");
    if (resultData) {
      let answerTitles = resultData.answerTitle.split("#");
      resultData.answerTitle = answerTitles[0];
      resultData.answerSplit = answerTitles[1];
      this.setData({
        title: options.title,
        result: resultData
      })

      if (app.globalData.scene == 1044 && app.globalData.groupId) {
        wx.showLoading({
          title: '加载排名……',
        })

        this.redirectToRank();
      }
    }
    wx.updateShareMenu({
      withShareTicket: true
    })
    tracker.firstRead({ page_id: 3004, page_name: "测试结果页" });
  },

  redirectToRank() {
    let topicId = this.data.topicId;
    let title = this.data.title;
    let groupId = app.globalData.groupId;

    setTimeout(function () {
      console.log('/result/rank?topicId=' + topicId + "&groupId=" + groupId + "&title=" + title)
      wx.navigateTo({
        url: '/pages/rank/rank?topicId=' + topicId + "&groupId=" + groupId + "&title=" + title,
      })
      wx.hideLoading();
    }, 2000);
  },

  onTestAgain() {
    wx.redirectTo({
      url: '/pages/preTest/preTest?isReTest=true&title=' + this.data.title + "&topicId=" + this.data.result.topicId,
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
  onShareAppMessage: function (res) {
    console.log(res)
    tracker.trackData({ event_id: 3004004, event_name: "点击转发至微信群", action_type: "点击" })
    let pageTitle = this.data.title;
    let topicId = this.data.topicId;
    let age = this.data.result.differAge > 0 ? "+" + this.data.result.differAge : this.data.result.differAge;
    let title = "我身体比实际年龄" + age + "岁！你呢？敢来PK一下吗？";
    return {
      title: title,
      path: "/pages/preTest/preTest?topicId=" + topicId + "&title=" + pageTitle,
      success: res => {
        console.log(res)
      }
    }
  }
})