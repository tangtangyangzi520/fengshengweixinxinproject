var app = getApp()
import alert from '../../utils/alert.js';
import client from '../../common/utils/client.js';
import { apiUrl } from "../../common/config.js"
import Tracker from '../../common/utils/tracker.js'
import utils from '../../common/utils/utils.js';
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		travelTitle: '',
		showStyle: 1, //1代表显示选择详情,2代表显示选择分类,3代表显示保存成功的样式
		isModify: false,//是否是修改
		categaryList: [],
		selectCatagaryIds: [],
		myCategaryList: [],
		bottomBtnEnableStatus: true,
	},

	onLoad: function (options) {
		Tracker.firstRead({ "page_id": 4003, "page_name": "选择二级标签页" });
		if (options.showStyle) {
			var showStyle = parseInt(options.showStyle);
			this.setData({
				showStyle: showStyle
			})
			switch (showStyle) {
				case 1://从创建清单过来
					{
						if (options.selectCategaryIds) {
							var selectCatagaryIds = options.selectCategaryIds.split(",");
							this.data.selectCatagaryIds = selectCatagaryIds;
						}

						if (options.travelTitle) {
							var travelTitle = options.travelTitle;
							this.setData({
								travelTitle: travelTitle
							})
						}
						break;
					}
				case 3://从查看清单详情过来
					{
						if (options.listId) {
							let listId = options.listId;
							this.requestMyListTagByListId(listId, true);
						}
						break;
					}
			}
		}

		if (options.templateListId) {
			this.data.templateListId = options.templateListId;
		}
		if (options.templateImg) {
			this.data.templateImg = options.templateImg
		}


		this.requestAllTags();


	},

	onShow: function () {
		wx.hideShareMenu()
	},

	//修改数据源 ()
	modifyCategaryList: function () {
		for (var index in this.data.categaryList) {
			var categary = this.data.categaryList[index];
			if (categary.isDefault) {
				categary.isSelect = true;
				continue;
			}
			for (var i = 0; i < this.data.selectCatagaryIds.length; i++) {
				var selectId = this.data.selectCatagaryIds[i];
				if (categary.parentTagId == selectId) {
					categary.isSelect = true;
					break;
				} else {
					categary.isSelect = false;
				}
			}
		}
		this.setData({
			categaryList: this.data.categaryList
		})
	},

	//左上角按钮点击
	changeShowStyle: function (event) {
		var showStyle = this.data.showStyle;
		if (showStyle == 1) {
			var selectCatagaryIds = [];
			for (var index in this.data.categaryList) {
				var categary = this.data.categaryList[index];
				if (categary.isSelect || categary.isDefault) {
					selectCatagaryIds.push(categary.parentTagId)
				}
			}
			//由1变为2，保存selectCatagaryIds
			showStyle = 2;
			this.data.selectCatagaryIds = selectCatagaryIds;
		} else if (showStyle == 3) {//弹出设置窗口
			Tracker.trackData({ "event_id": 4003008, "event_name": "点击管理", "action_type": "点击" });
			var that = this;
			wx.showActionSheet({
				itemList: ['修改清单', '删除清单'],
				itemColor: '#333333',
				success: function (res) {
					var tapIndex = res.tapIndex;
					switch (tapIndex) {
						case 0:
							{
								//修改清单
								Tracker.trackData({ "event_id": 4003009, "event_name": "点击管理-修改清单", "action_type": "点击" });

								//匹配数据
								that.data.myCategaryList.forEach(myCategary => {
									let targetCategary = that.data.categaryList.find(info => info.parentTagId == myCategary.parentTagId);
									if (targetCategary) {
										targetCategary.isSelect = true;
										myCategary.tags.forEach(myChoiceItem => {
											let targetItem = targetCategary.tags.find(item => item.tagId == myChoiceItem.tagId);
											if (targetItem) {
												targetItem.isSelect = true;
											} else {
												myChoiceItem.isSelect = true;
												targetCategary.tags.push(myChoiceItem)
											}
										})
									} else {
										myCategary.tags.forEach(myChoiceItem => {
											myChoiceItem.isSelect = true;
										})
										that.data.categaryList.push(myCategary);
									}
								})
								that.setData({
									showStyle: 1,
									isModify: true,
									categaryList: that.data.categaryList
								})
								break;
							}
						case 1:
							{//删除清单
								Tracker.trackData({ "event_id": 4003010, "event_name": "点击管理-删除清单", "action_type": "点击" });
								wx.showModal({
									title: '删除警告',
									content: '确定要删除这个清单吗？',
									cancelText: '放弃',
									confirmText: '删除',
									confirmColor: '#D0021B',
									success: function (res) {
										if (res.confirm) {
											that.deleteMyTravelList(that.data.listId)
										}
									}
								})
								break;
							}
					}
				}
			})
		} else {
			Tracker.trackData({ "event_id": 4003003, "event_name": "点击返回一级标签选择", "action_type": "点击" });
			//由2变为1，为取消操作，返回原状态
			this.modifyCategaryList();
			showStyle = 1;
		}
		this.setData({
			showStyle: showStyle
		})
	},

	//底部按钮点击
	bottomBtnClicked: function (event) {
		Tracker.trackData({ "event_id": 4003006, "event_name": "点击保存", "action_type": "点击" });
		switch (this.data.showStyle) {
			case 1:
				{
					if (this.data.isModify) {//保存修改
						this.updateTravelList();
					} else {//保存我的清单
						this.setData({
							bottomBtnEnableStatus: false
						})
						client.login().then(res => {
							this.creatTravelList();
						}, res => {
							this.setData({
								bottomBtnEnableStatus: true
							})
							setTimeout(function () {
								wx.showToast({
									title: res.res.data.msg,
								})
							}, 500)
						})

					}
					break;
				}
			case 2://选择分类保存
				{
					this.setData({
						showStyle: 1,
						categaryList: this.data.categaryList
					})
					break;
				}
			case 3://分享
				{

					break;
				}
		}
	},



	//获取包含有选择的元素的分类列表
	getCategaryListWhichHadElementChoice: function () {
		var fitList = [];
		this.data.categaryList.forEach(pitem => {
			if (pitem.tags.find(item => item.isSelect)) {
				fitList.push(Object.assign({}, pitem));
				var lastCategary = fitList[fitList.length - 1];
				let temp = [];
				lastCategary.tags.forEach((item, index) => {
					if (item.isSelect) {
						temp.push(item);
					}
				})
				lastCategary.tags = temp;
			}
		})
		return fitList;
	},

	//分类被点击（选择或取消选择）
	categaryItemClicked: function (event) {
		var item = event.currentTarget.dataset.item;
		let targetItem = this.data.categaryList.find(info => info.parentTagId == item.parentTagId);
		targetItem.isSelect = !targetItem.isSelect;
		this.setData({
			categaryList: this.data.categaryList
		})
	},

	//元素选择或取消选择
	elementChoiceOrNot: function (event) {
		var section = event.currentTarget.dataset.section;
		var row = event.currentTarget.dataset.row;

		var categary = this.data.categaryList[section];
		var item = categary.tags[row];

		item.isSelect = !item.isSelect;
		if (item.isSelect) {
			Tracker.trackData({ "event_id": 4003002, "event_name": "勾选内容", "action_type": "点击", "object1": item.tagName });
		}
		this.setData({
			categaryList: this.data.categaryList
		})
	},

	//元素准备或取消准备
	elementPrepareOrNot: function (event) {
		var section = event.currentTarget.dataset.section;
		var row = event.currentTarget.dataset.row;

		var categary = this.data.myCategaryList[section];
		var item = categary.tags[row];
		item.isPrepare = !item.isPrepare;
		this.setData({
			myCategaryList: this.data.myCategaryList
		})
		this.updateTagPrepareStatus(item.isPrepare, item.detailId);
	},


	//点击去购买按钮
	buyGoods: function (event) {

		var section = event.currentTarget.dataset.section;
		var row = event.currentTarget.dataset.row;

		var categary;
		var item;
		if (this.data.showStyle == 3) {
			categary = this.data.myCategaryList[section];
		} else {
			categary = this.data.categaryList[section];
		}
		item = categary.tags[row];
		Tracker.trackData({ "event_id": 4003004, "event_name": "点击去购买", "action_type": "点击", "object1": item.tagName })
		var path = item.pathList[0];
		wx.navigateToMiniProgram({
			appId: path.appId,
			path: path ? path : ''
		})
	},

	//输入框失去焦点
	inputBlur: function (event) {
		var section = event.currentTarget.dataset.section;
		var value = event.detail.value;
		if (value.length > 0) {
			var categary = this.data.categaryList[section];
			var newItem = {
				tagParentId: categary.parentTagId,
				tagName: value,
				isSelect: true,
				sortNum: 100000//排在最后面
			};
			categary.tags.push(newItem);
			this.setData({
				categaryList: this.data.categaryList,
				inputValue: ''
			})

			Tracker.trackData({ "event_id": 4003005, "event_name": "点击添加新项目", "action_type": "点击", "object1": value })
		}
	},

	//输入框点击完成
	inputFinish: function (event) {


	},

	onShareAppMessage: function (res) {
		Tracker.trackData({ "event_id": 4003007, "event_name": "点击发送给我的朋友", "action_type": "点击" });
		var path = "pages/share/share?listId=" + this.data.listId;
		return {
			title: this.data.travelTitle,
			path: path
		}
	},

	//mark网络请求
	//请求所有tags
	requestAllTags: function () {
		var that = this;
		wx.showNavigationBarLoading();

		client.postData(apiUrl + 'travel-api/travel/list/1.0.0/getAlltTags', {}).then(res => {
			wx.hideNavigationBarLoading()
			if (res.data.code == 200) {
				var categaryList = res.data.data;
				that.data.categaryList = categaryList;
				that.modifyCategaryList();
			} else {
				alert.showErrorToast(res.data.msg)
			}

		}, res => {
			wx.hideNavigationBarLoading()
			alert.showErrorToast(res.data.message);
		})

	},

	//创建旅游清单
	creatTravelList: function () {

		var fitCategaryList = this.getCategaryListWhichHadElementChoice();

		if (!fitCategaryList.length) {
			wx.showModal({
				title: '提示',
				content: '呀，忘了还未选择物品呢...',
				showCancel: false
			})
			this.setData({
				bottomBtnEnableStatus: true
			})
			return;
		}

		var that = this;
		var tags = [];
		fitCategaryList.forEach((categary) => {
			categary.tags.forEach((item) => {
				tags.push(item);
			})
		})

		var params = {
			listName: this.data.travelTitle,
			tags: tags
		};
		if (this.data.templateListId) {
			params.templateListId = this.data.templateListId;
		}

		alert.showLoading('创建中...');

		client.postData(apiUrl + 'travel-api/travel/list/1.0.0/createTravelList', params).then(res => {
			if (res.data.code == 200) {
				var listId = res.data.data.listId;
				this.requestMyListTagByListId(listId, false, '保存成功');
			} else {
				alert.showErrorToast(res.data.msg)
			}
			this.setData({
				bottomBtnEnableStatus: true
			})
		}, res => {
			alert.hideLoading();
			alert.showErrorToast(res.data.message);
			this.setData({
				bottomBtnEnableStatus: true
			})
		})

	},


	//根据清单id获取清单标签列表
	requestMyListTagByListId: function (listId, shouldLoading, showText) {
		if (shouldLoading) {
			wx.showNavigationBarLoading();
		}
		client.postData(apiUrl + 'travel-api/travel/list/1.0.0/getMyListTag', { 'listId': listId }).then(res => {
			if (shouldLoading) {
				wx.hideNavigationBarLoading();
			}
			if (res.data.code == 200) {
				var myCategaryList = res.data.data.tagResps;
				var travelTitle = res.data.data.listName;
				if (!travelTitle) {
					alert.showErrorToast('该清单已被删除');
					setTimeout(function () {
						wx.navigateBack({
							delta: 5
						})
					}, 2000)
				} else {
					this.setData({
						travelTitle: travelTitle,
						myCategaryList: myCategaryList,
						showStyle: 3,
						listId: listId
					})
				}


				if (showText) {
					alert.showSuccessToast(showText);
				}


			} else {
				alert.showErrorToast(res.data.msg)
			}

		}, res => {
			if (shouldLoading) {
				wx.hideNavigationBarLoading();
			}
			alert.showErrorToast(res.data.message);
		})
	},


	//设置清单标签准备状态
	updateTagPrepareStatus: function (isPrepare, detailId) {
		client.postData(apiUrl + 'travel-api/travel/list/1.0.0/updateTagPrepareStatus', { 'detailId': detailId, 'isPrepare': isPrepare ? "1" : "0" }).then(res => {

		}, res => {

		})
	},

	//删除旅游清单
	deleteMyTravelList: function (listId) {

		client.postData(apiUrl + 'travel-api/travel/list/1.0.0/deleteTravelList', { 'listId': listId }).then(res => {
			if (res.data.code == 200) {
				wx.navigateBack({
					delta: 5
				})
				wx.showToast({
					title: '删除成功',
				})
			} else {
				alert.showErrorToast(res.data.msg)
			}
		}, res => {
			alert.showErrorToast(res.data.message);
		})
	},

	//更新旅游清单
	updateTravelList: function () {

		var fitCategaryList = this.getCategaryListWhichHadElementChoice();

		if (!fitCategaryList.length) {
			wx.showModal({
				title: '提示',
				content: '呀，忘了还未选择物品呢...',
				showCancel: false
			})
			this.setData({
				bottomBtnEnableStatus: true
			})
			return;
		}

		var tags = [];
		fitCategaryList.forEach((categary) => {
			categary.tags.forEach((item) => {
				tags.push(item);
			})
		})

		var params = {
			listId: this.data.listId,
			tags: tags
		};

		alert.showLoading('正在更新...');

		client.postData(apiUrl + 'travel-api/travel/list/1.0.0/updateTravelList', params).then(res => {

			if (res.data.code == 200) {
				this.requestMyListTagByListId(this.data.listId, false, '修改成功');
			} else {
				alert.showErrorToast(res.data.msg)
			}
			this.setData({
				bottomBtnEnableStatus: true
			})

		}, res => {
			this.setData({
				bottomBtnEnableStatus: true
			})
			alert.hideLoading();
			alert.showErrorToast(res.data.message);
		})

	},
	submitFromId(e) {
		utils.onSubmitFromId(e.detail.formId, 0)
	},
})