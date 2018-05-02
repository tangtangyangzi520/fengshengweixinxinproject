// pages/test/test.js
import util from '../../utils/util.js'
import tracker from '../../common/utils/tracker.js'
const app = getApp()
let index = 0;

const answerData = {
  answers: [
    {
      choiceId: 0,
      questionId: 0,
      selfDefined: ""
    }
  ],
  topicId: 0,
  userName: "",
  acessToken: null,
}

Page({

	/**
	 * 页面的初始数据
	 */
  data: {
    choice_progress: "1/9",
    question: null,
    questions: null,
    isCounting: false,
    topicId: 1,
    title: ""
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
  onLoad: function (options) {
    if (app.globalData.userInfo == null) {
      app.openSetting()
      return
    }

    this.setData({
      title: options.title,
      topicId: options.topicId
    })

    index = 0;
    answerData.answers = [];
    let url = app.globalData.url + options.topicId + "/question";
    answerData.topicId = options.topicId;
    answerData.acessToken = app.globalData.tokenInfo.token;
    if (app.globalData.userInfo)
      answerData.userName = app.globalData.userInfo.nickName;
    console.log(url)
    wx.request({
      url: url,
      success: res => {
        let data = res.data.data;
        wx.setNavigationBarTitle({
          title: data.topicTitle
        })

        this.setData({
          title: data.topicTitle,
          choice_progress: (index + 1) + "/" + data.questions.length,
          question: data.questions[index],
          questions: data.questions
        })
      }
    })

    wx.updateShareMenu({
      withShareTicket: true
    })

    tracker.firstRead({ page_id: 3002, page_name: "测试详情页" });
  },

  onInputAge(e) {
    let question = this.data.question;
    question.selfDefined = e.detail.value;
    this.setData({
      question: question
    })
  },

  onSubmitInput() {
    let data = this.data;
    let age = +data.question.selfDefined;
    if (isNaN(age) || age <= 0) {
      wx.showToast({
        title: '请输入年龄',
        duration: 2000
      })
      let question = this.data.question;
      question.selfDefined = "";
      this.setData({
        question: question
      })
      return;
    }

    answerData.answers[index] = {
      questionId: data.question.questionId,
      selfDefined: data.question.selfDefined
    }
    index++;
    this.setData({
      choice_progress: (index + 1) + "/" + data.questions.length,
      question: data.questions[index],
      questions: data.questions
    })
    tracker.trackData({ event_id: 3002003, event_name: "点击下一步", action_type: "点击", object1: data.title, object2: answerData.topicId })
  },

  onChoiced(e) {
    let data = this.data;
    answerData.answers[index] = {
      questionId: data.question.questionId,
      choiceId: e.currentTarget.dataset.value
    }
    index++;
    tracker.trackData({ event_id: 3002003, event_name: "点击下一步", action_type: "点击", object1: data.title, object2: answerData.topicId })
    if (index >= data.questions.length) {
      this.onFinishQuestion();
      return
    }
    this.setData({
      choice_progress: (index + 1) + "/" + data.questions.length,
      question: data.questions[index],
      questions: data.questions
    })
  },

  onFinishQuestion() {
    this.setData({
      isCounting: true
    })
    let waitingTime = 1500;
    let dt = Date.now();
    wx.request({
      url: app.globalData.url + answerData.topicId + "/submit",
      data: answerData,
      method: "POST",
      success: res => {
        console.log(res)
        wx.setStorageSync("resultData1", res.data.data);
        let timeout = waitingTime - (Date.now() - dt);
        this.onRedirectTo(timeout);
      },
      fail: res => {
        console.log("/submit/submit")
        console.log(res)
      }
    })
  },

  onRedirectTo(timeout) {
    let title = this.data.title;
    let topicId = this.data.topicId;
    setTimeout(
      function () {
        wx.redirectTo({
          url: '/pages/result/result?title=' + title + '&topicId=' + topicId,
        })
      }, timeout)
  },

  onSubmit(e) {
    util.submitFormId(app, e.detail.formId);
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
    let title = this.data.title;
    let topicId = answerData.topicId;
    return {
      title: title,
      path: "/pages/preTest/preTest?topicId=" + topicId + "&title=" + title,
      success: res => {
        console.log(res)
      }
    }
  }
})