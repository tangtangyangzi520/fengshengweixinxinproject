// pages/rank/rank.js
const app = getApp()
import tracker from '../../common/utils/tracker.js'

Page({

	/**
	 * 页面的初始数据
	 */
  data: {
    topicId: null,
    title: null,
    surveyRankVos: [
      // {
      //   rank: 1,
      //   age: 20,
      //   avatar: "https://wx.qlogo.cn/mmopen/vi_32/skbupBhJ87qHjsqgS5v84EThXR7mUlTgoeGagVhPibTLic04aznmnQ3WBwK7r0gKcTKxzevcexUZR6NccwCN3hKQ/0",
      //   userName: "蜗牛",
      // },
    ],
    surveyRankVo: {
      // rank: 1,
      // age: 20,
      // avatar: "https://wx.qlogo.cn/mmopen/vi_32/skbupBhJ87qHjsqgS5v84EThXR7mUlTgoeGagVhPibTLic04aznmnQ3WBwK7r0gKcTKxzevcexUZR6NccwCN3hKQ/0",
      // userName: "蜗牛",
    }
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
  onLoad: function (options) {
    console.log(options)
    wx.showLoading({
      title: '正在加载中……',
    })
    wx.setNavigationBarTitle({
      title: options.title,
    })
    this.setData({
      title: options.title,
      topicId: options.topicId
    })
    wx.request({
      url: app.globalData.url + options.topicId + "/" + options.groupId + "/" + app.globalData.appId,
      header: {
        'content-type': 'application/json', // 默认值
        'authorization': app.globalData.tokenInfo.token
      },
      success: res => {
        console.log(res)
        this.setData(res.data.data);
      },
      complete: res => {
        wx.hideLoading();
      }
    })
    wx.updateShareMenu({
      withShareTicket: true
    })

    tracker.firstRead({ page_id: 3005, page_name: "测试排行榜页" });
  },

  onMall() {
    // wx.navigateToMiniProgram({
    // 	appId: 'wxe7a6f4d8f9da15c0',
    // 	path: "pages/home/dashboard/index",
    // 	complete: res => {
    // 		console.log(res)
    // 	}
    // })
    wx.navigateToMiniProgram({
      appId: 'wxe7a6f4d8f9da15c0',
      path: 'pages/home/feature/index?id=19471',
      // envVersion: 'develop',
      success(res) {
        // 打开成功
      }
    })
    tracker.trackData({ event_id: 3005001, event_name: "点击教你变年轻的秘籍", action_type: "点击" })
  },

  onBackHome() {
    wx.reLaunch({
      url: '/pages/home/home',
    })
  },

	/**
	 * 用户点击右上角分享
	 */
  onShareAppMessage: function () {
    tracker.trackData({ event_id: 3005002, event_name: "分享到其他群", action_type: "点击" })
    let pageTitle = this.data.title;
    let age = this.data.surveyRankVo.differAge > 0 ? "+" + this.data.surveyRankVo.differAge : this.data.surveyRankVo.differAge;
    let title = "我身体比实际年龄" + age + "岁！你呢？敢来PK一下吗？";
    let topicId = this.data.topicId;
    return {
      title: title,
      path: "/pages/preTest/preTest?topicId=" + topicId + "&title=" + pageTitle,
      success: res => {
        console.log(res)
      }
    }
  }
})