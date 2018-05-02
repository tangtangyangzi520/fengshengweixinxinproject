//获取应用实例
const app = getApp()
import { apiUrl } from "../../common/config.js"
import Tracker from '../../common/utils/tracker.js'
import utils from '../../common/utils/utils.js';



Page({
    data:{
        inputValue:'',
        templateList:[]
    },

    //
    onLoad:function(option){
        this.requestTemplateList();
        Tracker.firstRead({ "page_id": 4001, "page_name": "首页" });
    },

    onShareAppMessage: function (res) {
        
    },
    // 输入框聚焦时
    inputFocus:function(event) {
        Tracker.trackData({ "event_id": 4001002, "event_name": "点击输入目的地", "action_type": "点击" });
    },

    //输入框字符串变化
    inputValueChanged:function(event){
        this.data.inputValue = event.detail.value
    },

    //点击“创建我的打包清单”
    creatTravelList:function(event){
        Tracker.trackData({ "event_id": 4001003, "event_name": "点击创建我的打包清单", "action_type": "点击", "object1": this.data.inputValue});
        if (this.data.inputValue.length > 0) {
            wx.navigateTo({
                url: '/pages/categary/categary?travelTitle=' + this.data.inputValue,
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '还未输入旅行目的地呢...',
                showCancel:false
            })
        }
    },

    //点击模板
    templateClicked:function(event){
        var template = event.currentTarget.dataset.template;
        Tracker.trackData({ "event_id": 4001004, "event_name": "点击热门目的地", "action_type": "点击", "object1": template.templateListArea});

        wx.navigateTo({
            url: '/pages/creatTravelList/creatTravelList?showStyle=' + 1 + '&selectCategaryIds=' + template.parentTagIds + '&travelTitle=' + template.templateListName + '&templateListId=' + template.templateListId + '&templateImg=' + template.img
,
        })
    },

    //网络请求模板清单列表
    requestTemplateList:function(){
        var that = this;
        wx.showNavigationBarLoading();
        wx.request({
            url: apiUrl + 'travel-api/travel/list/1.0.0/getTemplateList',
            method: 'post',
            header: {
                "content-type": "application/json"
            },
            success:  res =>{
                if (res.data.success){
                    var templateList = res.data.data;
                    that.setData({
                        templateList: templateList
                    });
                }
                
            },
            fail: function (error) {
                console.log(error)
            },
            complete: function () {
                wx.hideNavigationBarLoading();
            }
        })
    },
    submitFromId(e) {
	    utils.onSubmitFromId(e.detail.formId, 0)
    },
})