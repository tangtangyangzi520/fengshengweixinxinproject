var app = getApp()
import alert from '../../utils/alert.js';
import client from '../../common/utils/client.js';
import { apiUrl } from "../../common/config.js"
import utils from '../../common/utils/utils.js';


Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		shareCategaryList: [],
		travelTitle: '',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var listId = options.listId;
		this.data.listId = listId;
		this.getShareTravelListTag();
		// app.login();
	},


	//点击去购买按钮
	buyGoods: function (event) {
		var section = event.currentTarget.dataset.section;
		var row = event.currentTarget.dataset.row;
		var categary = this.data.shareCategaryList[section];;
		var item = categary.tags[row];
		var path = item.path[0];
		wx.navigateToMiniProgram({
			appId: 'wxe7a6f4d8f9da15c0',
			path: path ? path : ''
		})
	},

	//保存为我的清单
	bottomBtnClicked: function (event) {

		client.login().then(res => {
			alert.showLoading('正在为您保存');
			client.postData(apiUrl + 'travel-api/travel/list/1.0.0/saveAsMyTravelList', { 'listId': this.data.listId }).then(res => {
				alert.hideLoading()
				if (res.data.code == 200) {
					wx.switchTab({
						url: '/pages/mine/mine',
					})
				} else {
					alert.showErrorToast(res.data.msg)
				}

			}, res => {
				alert.showErrorToast(res.data.message);
			})
		}, res => {
			setTimeout(function () {
				wx.showToast({
					title: res.res.data.msg,
				})
			}, 500)
		})


	},



	//获取分享清单标签列表
	getShareTravelListTag: function () {
		wx.showNavigationBarLoading();
		client.postData(apiUrl + 'travel-api/travel/list/1.0.0/getShareTravelListTag?listId=' + this.data.listId, {}).then(res => {
			wx.hideNavigationBarLoading()
			if (res.data.code == 200) {
				var shareCategaryList = res.data.data.tagResps;
				var travelTitle = res.data.data.listName;

				if (!travelTitle) {
					alert.showErrorToast('该清单已被删除');
					setTimeout(function () {
						wx.switchTab({
							url: '/pages/find/find',
						})
					}, 2000)
				} else {
					this.setData({
						travelTitle: travelTitle,
						shareCategaryList: shareCategaryList
					})
				}

			} else {
				alert.showErrorToast(res.data.msg)
			}

		}, res => {
			wx.hideNavigationBarLoading()
			alert.showErrorToast(res.data.message);
		})
	},
	submitFromId(e) {
		utils.onSubmitFromId(e.detail.formId, 0)
	},

})