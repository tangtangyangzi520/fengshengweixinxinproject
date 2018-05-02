//app.js
import client from 'common/utils/client';
let loginCount = 0;
App({
  onLoad(e){
  },
  onLaunch: function () {
    //小程序初始化完成给公共工具传入APP实例
    client.init(this);
    let _this = this;
    console.log(this)
    this.login();
    //网络请求getData,postData
    let data = {};
    client.getData(client.apiUrl + '/survey/survey/1.0.0/topic', data).then(res => {
      //网络请求成功
      console.log(res);
    }, res => {
      //网络请求失败
      console.log(res);
    })
    // wx.chooseImage({
    //   success: function (res) {
      
    //     wx.getFileInfo({
    //       filePath: res.tempFilePaths[0],
    //       success(res) {
    //         console.log(res)
    //         console.log(res.digest)
    //       }
    //     })
    //   }
    // })
    //提交form表单
    // client.submitWXForm(formId,formType);
  },
  login(){
    loginCount++;
    if (loginCount>5){
      wx.showModal({
        title: '提示',
        content: '系统登录异常，请退出稍后再试',
        showCancel: false,
        success: res=>{
          if(res.confirm){
            loginCount = 0;
            this.login();
          }
        }
      })
      return;
    }
    //登录
    client.login().then(res => {
      //登录成功返回userInfo,tokenInfo
      //res = {userInfo,tokenInfo}
      console.log(res);
      //可从缓存读取userInfo,tokenInfo
      console.log(wx.getStorageSync('userInfo'))
      console.log(wx.getStorageSync('tokenInfo'))
    }, res => {
      //登录失败
      // code=1001:用户拒绝允许授权获取信息,
      // code=1002:获取openId接口服务报错,
      // code=1003:获取openId接口网络错误,
      // code=1004:微信登录调用失败
      this.login();
      console.log(res);
    });
  },
  globalData: {
    userInfo: null,
    tokenInfo: null,
    jsCode: null,
  }
})