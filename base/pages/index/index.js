//index.js
//获取应用实例
import client from '../../common/utils/client';
import Tracker from '../../common/utils/tracker.js';
const app = getApp();
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    Tracker.firstRead({ "page_id": 101, "page_name": "page view" });
    Tracker.trackData({ "event_id": 102, "event_name": "点击按钮", "action_type": "点击" });
    
  },
  login() {
    let _this = this;
    client.login().then(res => {
      console.log('login success', res);
    }, res => {
      console.log('login reject', res);
      //1001:用户拒绝允许授权获取信息,
      //1002:获取openId接口服务报错,
      //1003:获取openId接口网络错误,
      //1004:微信登录调用失败
      if (res.code == 1001) {
        wx.showModal({
          content: '请允许微信授权',
          showCancel: false,
          success: res => {
          }
        })
      }
    });
  },
})
