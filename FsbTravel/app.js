//app.js
import client from 'common/utils/client';
let loginCount = 0;
App({
	onLaunch: function () {
		//小程序初始化完成给公共工具传入APP实例
		client.init(this);
		this.login();
	},
	globalData: {
		appId: 'wxeea2bf70b89f0983'
	},
	login() {
		if (loginCount > 3) {
			wx.showModal({
				title: '提示',
				content: '系统登录异常，请退出稍后再试',
				showCancel: false,
				success: res => {
					if (res.confirm) {
						loginCount = 0;
						this.login();
					}
				}
			})
			return;
		}
		// 登录
		client.login().then(res => {
			console.log('login success', res);
		}, res => {
			console.log('login reject', res);
			this.login();
			if (res.code == 1002 || res.code == 1003) {
				loginCount++;
			}
		});
	},
})