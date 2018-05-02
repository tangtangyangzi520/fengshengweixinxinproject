// pages/preTest/preTest.js
const app = getApp()
import tracker from '../../common/utils/tracker.js'

Page({

	/**
	 * 页面的初始数据
	 */
  data: {
    topicId: 1,
    title: "",
    topicNote: ["注意事项：",
      "1.你必须在5分钟内完成这套题。",
      "2.不要在某个题目上耽搁太久，尽可能凭第一印象回复。",
      "3.假如某道题看起来是多选，请选你认为最好那个选项。"],
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
  onLoad: function (options) {
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.title
    })
    wx.updateShareMenu({
      withShareTicket: true
    })

    this.setData({
      title: options.title,
      topicId: options.topicId
    })

    if (app.globalData.userInfo && app.globalData.tokenInfo && app.globalData.tokenInfo.token) {
      if (!options.isReTest) {
        this.checkIsTested(options.topicId);
      }
    } else {
      wx.showLoading({
        title: '正在加载中……',
        mask: true
      })
      app.userInfoReadyCallback = res => {
        if (!options.isReTest) {
          this.checkIsTested(options.topicId);
        } else {
          wx.hideLoading();
        }
      }
    }
    tracker.firstRead({ page_id: 3003, page_name: "开始测试页" });
  },

	/**
	 * 检查是否已经答过题目
	 */
  checkIsTested(topicId) {
    wx.showLoading({
      title: '正在加载中……',
    })
    wx.request({
      url: app.globalData.url + topicId + "/surveyfeedback",
      header: {
        'content-type': 'application/json', // 默认值
        'authorization': app.globalData.tokenInfo.token
      },
      success: res => {
        if (res.data.data) {
          wx.setStorageSync("resultData1", res.data.data);
          let groupId = app.globalData.groupId;
          let title = this.data.title;
          if (app.globalData.scene == 1044 && app.globalData.shareTicket) {
            if (groupId) {
              this.getRank(topicId, groupId, title);
            } else {
              app.reportGroupCallBack = res => {
                groupId = app.globalData.groupId;
                if (groupId) {
                  this.getRank(topicId, groupId, title);
                } else {
                  this.redirectToResult();
                }
              }
            }
          } else {
            this.redirectToResult();
          }
        }
        console.log(res)
      },
      complete: res => {
        wx.hideLoading();
      }
    })
  },

  redirectToResult() {
    wx.redirectTo({
      url: '/pages/result/result?topicId=' + this.data.topicId + '&title=' + this.data.title,
    })
  },

  getRank(topicId, groupId, title) {
    console.log('preTest/rank?topicId=' + topicId + "&groupId=" + groupId + "&title=" + title);
    wx.redirectTo({
      url: '/pages/rank/rank?topicId=' + topicId + "&groupId=" + groupId + "&title=" + title,
    })
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
      url: '/pages/test/test?topicId=' + topicId + '&title=' + this.data.title,
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
      path: '/pages/preTest/preTest?topicId=' + this.data.topicId + '&title=' + this.data.title,
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