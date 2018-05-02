import alert from '../../utils/alert.js';
import client from '../../common/utils/client.js';
import { apiUrl } from "../../common/config.js"
import Tracker from '../../common/utils/tracker.js'
import utils from '../../common/utils/utils.js';
var app = getApp();



Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		myTravelList: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		Tracker.firstRead({ "page_id": 4004, "page_name": "我的清单页" });
	},

	onShow: function () {
		client.login().then(res => {
			this.requestMyTravelList();
		}, res => {
			setTimeout(function () {
				wx.showToast({
					title: res.res.data.msg,
				})
			}, 500)
		})
	},

	//查看详情
	checkListDetail: function (event) {
		Tracker.trackData({ "event_id": 4004002, "event_name": "点击目的地", "action_type": "点击" });
		var item = event.currentTarget.dataset.item;
		var listId = item.listId;

		wx.navigateTo({
			url: '/pages/creatTravelList/creatTravelList?showStyle=' + 3 + '&listId=' + listId,
		})
	},

	//请求我的清单列表
	requestMyTravelList: function () {
		client.postData(apiUrl + 'travel-api/travel/list/1.0.0/getMyList', {}).then(res => {
			if (res.data.code == 200) {
				var myTravelList = res.data.data;
				this.setData({
					myTravelList: myTravelList,
				})
			} else {
				alert.showErrorToast(res.data.msg)
			}

		}, res => {

			alert.showErrorToast(res.data.message);
		})
	},
	submitFromId(e) {
		utils.onSubmitFromId(e.detail.formId, 0)
	},

})