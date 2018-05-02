// pages/test/test2.js
import util from '../../utils/util.js'
import tracker from '../../common/utils/tracker.js'
const imageUtils = require('../../common/utils/imageUtils.js')
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
    title: '',
    question: null,
    questions: null,
    choiceNum: '第一题',
    btn_type: 'bt_start_normal@2x.png',
    now: "2017-12-21"
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
      now: util.formatTime(new Date())
    });
    index = 0;
    answerData.answers = [];
    answerData.topicId = options.topicId;
    answerData.acessToken = app.globalData.tokenInfo.token;
    if (app.globalData.userInfo)
      answerData.userName = app.globalData.userInfo.nickName;

    let url = app.globalData.url + options.topicId + "/question";
    console.log(url)
    wx.request({
      url: url,
      success: res => {
        let data = res.data.data;
        wx.setNavigationBarTitle({
          title: data.topicTitle
        })
        data.title = data.topicTitle;
        this.setDataInfo(data);
      }
    })

    wx.updateShareMenu({
      withShareTicket: true
    })

    tracker.firstRead({ page_id: 3002, page_name: "测试详情页" });
  },

  setDataInfo(data) {
    let question = data.questions[index];
    this.setData({
      title: data.title,
      question: question,
      questions: data.questions,

      choiceNum: this.getChoiceNumStr(index),
      btn_type: question.questionType == 4 ? 'bt_start_normal@2x.png' : question.questionType == 5 ? "bt_ok_normal@2x.png" : "bt_result_normal@2x.png",
    })
  },

  getChoiceNumStr(num) {
    if (num > 0 && num <= 10) {
      return "第" + ("一，二，三，四，五，六，七，八，九，十".split('，')[num - 1]) + "题";
    }
    return "";
  },

  onInput(e) {
    this.setSelfDefineData(e.detail.value)
  },

  setSelfDefineData(selfDefined) {
    let question = this.data.question;
    question.selfDefined = selfDefined;
    this.setData({
      question: question
    })
  },

  onSubmitInput(res) {
    let data = this.data;
    let selfDefined = data.question.selfDefined;
    if (!selfDefined || selfDefined == '') {
      let qType = data.question.questionType;
      let tips = qType == 4 ? "请选择出生日期" : qType == 5 ? "请输入名字" : "请选择一张图片"; 
      wx.showToast({
        title: tips,
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
      selfDefined: selfDefined
    }
    index++;
    tracker.trackData({ event_id: 3002003, event_name: "点击下一步", action_type: "点击", object1: data.title, object2: answerData.topicId })
    if (index >= data.questions.length) {
      this.onFinishQuestion();
      return
    }
    this.setDataInfo(data)
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
    this.setDataInfo(data)
  },

  onFinishQuestion() {
    this.setData({
      isCounting: true
    })
    let waitingTime = 1500;
    let dt = Date.now();
    console.log(answerData);
    wx.request({
      url: app.globalData.url + answerData.topicId + "/submit",
      data: answerData,
      method: "POST",
      success: res => {
        console.log(res)
        wx.setStorageSync("resultData2", res.data.data);
        let timeout = waitingTime - (Date.now() - dt);
        this.onRedirectTo(timeout);
      },
      fail: res => {
        console.error(res)
      }
    })
  },

  onRedirectTo(timeout) {
    let title = this.data.title;
    setTimeout(
      function () {
        wx.redirectTo({
          url: '/pages/result/result2?title=' + title + '&topicId=' + answerData.topicId,
        })
      }, timeout)
  },

  onSubmit(e) {
    util.submitFormId(app, e.detail.formId);
  },

  onAddPic() {
    imageUtils.addPic(1, {
      onUploaded: data => {
        this.setSelfDefineData(data.data.ossUrl);
      },
    })
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
    console.log("title = " + this.data.title);
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
      path: "/pages/preTest/preTest2?topicId=" + topicId + "&title=" + title,
      success: res => {
        console.log(res)
      }
    }
  }
})