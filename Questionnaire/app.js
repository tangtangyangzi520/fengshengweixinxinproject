//app.js
import client from 'common/utils/client.js';
const host = "https://api.fshtop.com";
const appId = "wxc1e6d573b7dee2b7";

let loginRetry = 5;

App({
  onLaunch(option) {
    client.init(this);
    console.log(option);
    this.login();
  },
  login() {
    if (loginRetry < 0) {
      loginRetry = 5;
      wx.showModal({
        title: '登录失败',
        content: '登录失败，服务器异常，请退出稍后重试！',
        showCancel: false
      })
      this.globalData.isError = true;
      return;
    }
    client.login().then(res => {
      if (this.userInfoReadyCallback) {
        this.userInfoReadyCallback(res)
      }
      if (this.userTokenReadyCallback) {
        this.userTokenReadyCallback(res);
      }
    }, res => {
      if (res.code == 1002 || res.code == 1003) {
        loginRetry--;
      }
      this.login();
    })
  },
  // 获取用户信息
  getSetting() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          this.getUInfo()
        } else {
          wx.authorize({
            scope: 'scope.userInfo',
            success: res => {
              this.getUInfo()
            },
            fail: res => {
              this.openSetting()
            }
          })
        }
      }
    })
  },

  getUInfo() {
    wx.getUserInfo({
      success: res => {
        console.log(res)
        // 可以将 res 发送给后台解码出 unionId
        this.globalData.userInfo = res.userInfo

        if (this.globalData.jsCode) {
          this.loadUserTokenInfo();
        } else {
          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res)
          }
          if (this.userTokenReadyCallback) {
            this.userTokenReadyCallback(res);
          }
        }
      }
    })
  },

  saveTokenInfo(tokenInfo) {
    wx.setStorage({
      key: 'tokenInfo',
      data: tokenInfo,
    });
  },

  getTokenInfo() {
    let tokenInfo = wx.getStorageSync("tokenInfo");
    return tokenInfo == '' ? {} : tokenInfo;
  },

  loadUserTokenInfo() {
    let userInfo = this.globalData.userInfo;
    let tokenInfo = this.globalData.tokenInfo;
    wx.request({
      url: host + "/cms-pay/wechat/1.0.0/getOpenId",
      data: {
        appId: appId,
        jsCode: this.globalData.jsCode,
        city: userInfo.city,
        country: userInfo.country,
        headimgurl: userInfo.avatarUrl,
        nickname: userInfo.nickName,
        province: userInfo.province,
        sex: userInfo.gender
      },
      method: "POST",
      success: res => {
        this.log(res)
        tokenInfo.openId = res.data.data.openid;
        tokenInfo.unionId = res.data.data.unionid;
        tokenInfo.token = res.data.data.token;
        tokenInfo.memberId = res.data.data.memberId;

        this.saveTokenInfo(tokenInfo);

        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (this.userInfoReadyCallback) {
          this.userInfoReadyCallback(res)
        }
        if (this.userTokenReadyCallback) {
          this.userTokenReadyCallback(res);
        }
      },
      fail: res => {
        this.log(res)
      }
    })
  },

  reportGroup() {
    let tokenInfo = this.globalData.tokenInfo;
    let encryptedData = this.globalData.encryptedData;
    let iv = this.globalData.iv;
    if (tokenInfo && tokenInfo.token && encryptedData && iv) {
      wx.request({
        url: host + "/cms-pay/wechat/1.0.0/reportGroup",
        data: {
          appId: appId,
          group: encryptedData,
          groupIv: iv
        },
        header: {
          'content-type': 'application/json', // 默认值
          'authorization': tokenInfo.token
        },
        method: "POST",
        success: res => {
          console.log(res);
          this.globalData.groupId = res.data.data && res.data.data.groupId;
          if (this.reportGroupCallBack) {
            this.reportGroupCallBack(res);
            this.reportGroupCallBack = null;
          }
        }
      })
    } else {
      console.log("tokenInfo = " + tokenInfo + " encryptedData = " + encryptedData + " iv = " + iv);
    }
  },

  openSetting() {
    // let durationTime = 2500;
    wx.showModal({
      content: '请允许微信授权再开始测试',
      showCancel: false,
      complete: res => {
        wx.openSetting({
          success: res => {
            this.getUInfo();
          },
          complete: res => {
            console.log(res);
          }
        })
      }
    })
  },

  log(res) {
    console.log(res)
  },

  onShow(options) {
    console.log(options)
    this.globalData.groupId = null;
    this.globalData.scene = options.scene;
    if (options.scene == 1044 && options.shareTicket && options.query.topicId == 1) {
      this.globalData.shareTicket = options.shareTicket;
      wx.getShareInfo({
        shareTicket: options.shareTicket,
        success: res => {
          this.log(res)

          if (res.iv && res.encryptedData) {
            this.globalData.iv = res.iv;
            this.globalData.encryptedData = res.encryptedData;

            if (this.globalData.tokenInfo && this.globalData.tokenInfo.token) {
              this.reportGroup();
            } else {
              this.userTokenReadyCallback = res => {
                this.reportGroup();
                this.userTokenReadyCall = null;
              }
            }
          }
        },
        fail: res => {
          this.globalData.shareTicket = null;
          if (this.reportGroupCallBack) {
            this.reportGroupCallBack(res);
            this.reportGroupCallBack = null;
          }
        }
      })
    }
  },

  globalData: {
    tokenInfo: {
      openId: null,
      unionId: null,
      token: null,
      memberId: null,
    },
    groupId: null,
    userInfo: null,
    scene: 0,
    shareTicket: null,
    appId: appId,
    jsCode: null,
    encryptedData: null,
    iv: null,
    host: host,
    url: host + "/survey/survey/1.0.0/",
    isDebug: true,
    isError: false
  }
})