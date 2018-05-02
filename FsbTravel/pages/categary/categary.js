
var app = getApp();
import alert from '../../utils/alert.js';
import client from '../../common/utils/client.js';
import { apiUrl } from "../../common/config.js"
import Tracker from '../../common/utils/tracker.js'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        travelTitle: '',
        categaryList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var travelTitle = options.travelTitle;
        this.setData({
            travelTitle: travelTitle,
        });
        this.requestAllTags();
        Tracker.firstRead({ "page_id": 4002, "page_name": "选择一级标签页" });
    },



    // 点击下一步
    nextStep:function(event){
        Tracker.trackData({ "event_id": 4002003, "event_name": "点击下一步", "action_type": "点击" });
        var selectCategaryIds = [];
        for (var i = 0; i < this.data.categaryList.length; i ++) {
            var item = this.data.categaryList[i];
            if (item.isDefault || item.isSelect) {
                selectCategaryIds.push(item.parentTagId);
            }
        }
    
        wx.redirectTo({
            url: '/pages/creatTravelList/creatTravelList?showStyle=' + 1 + '&selectCategaryIds=' + selectCategaryIds +"&" +  'travelTitle=' + this.data.travelTitle,
        })
    },

    //分类被点击
    categaryItemClicked:function(event){
       
        var item = event.currentTarget.dataset.item;
        let targetItem = this.data.categaryList.find(info => info.parentTagId == item.parentTagId);
        targetItem.isSelect = !targetItem.isSelect;
        if (targetItem.isSelect) {
            Tracker.trackData({ "event_id": 4002002, "event_name": "选择类型", "action_type": "点击", "object1": targetItem.parentTagName });
        }
        this.setData({
            categaryList: this.data.categaryList
        })
        
    },

    //网络请求
    requestAllTags:function(){
        var that = this;
        wx.showNavigationBarLoading();
        client.postData(apiUrl + 'travel-api/travel/list/1.0.0/getAlltTags', {}).then(res => {
            if (res.data.code == 200) {
                var categaryList = res.data.data;
                that.setData({
                    categaryList: categaryList
                })
            }  else {
                alert.showErrorToast(res.data.msg)
            }
            wx.hideNavigationBarLoading()
        }, res => {
            alert.showErrorToast(res.data.message);
            wx.hideNavigationBarLoading()
        })
    }
})