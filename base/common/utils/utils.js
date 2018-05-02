import {apiUrl} from "../config.js"

function formatTime(date) {
	date = new Date(date)
	var year = formatNumber(date.getFullYear())
	var month = formatNumber(date.getMonth() + 1)
	var day = formatNumber(date.getDate())

	var hour = formatNumber(date.getHours())
	var minute = formatNumber(date.getMinutes())
	var second = formatNumber(date.getSeconds())

	return month + "月" + day + "日" + hour + ":" + minute
}

function formatNumber(n) {
	n = n.toString()
	return n[1] ? n : '0' + n
}
function uuid() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
	s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "";

	var uuid = s.join("");
	return uuid;
}
const getDiffDate = time => {
	if (time.toString().length!=13){
		time = time * 1000;
	}
	let diff = (time  - new Date().getTime()) / 1000
	let dateData = {
		years: 0,
		days: 0,
		hours: 0,
		min: 0,
		sec: 0,
		millisec: 0,
	}
	if (diff <= 0) {
		return -1
	}
	if (diff >= (365.25 * 86400)) {
		dateData.years = Math.floor(diff / (365.25 * 86400))
		diff -= dateData.years * 365.25 * 86400
	}
	if (diff >= 86400) {
		dateData.days = Math.floor(diff / 86400)
		diff -= dateData.days * 86400
	}
	if (diff >= 3600) {
		dateData.hours = Math.floor(diff / 3600)
		diff -= dateData.hours * 3600
	}
	if (diff >= 60) {
		dateData.min = Math.floor(diff / 60)
		diff -= dateData.min * 60
	}
	dateData.sec = Math.round(diff)
	dateData.millisec = diff % 1 * 1000
	if (dateData.days == 0) {
		dateData = formatDate(dateData.hours) + ":" + formatDate(dateData.min) + ":" + formatDate(dateData.sec)
	} else {
		dateData = formatDate(dateData.days) + "天" + formatDate(dateData.hours) + ":" + formatDate(dateData.min) + ":" + formatDate(dateData.sec)
	}
	return dateData
}
const getDiffDate2 = time => {
	if (time.toString().length!=13){
		time = time * 1000;
	}
	let diff = (time  - new Date().getTime()) / 1000
	let dateData = {
		years: 0,
		days: 0,
		hours: 0,
		min: 0,
		sec: 0,
		millisec: 0,
	}
	if (diff <= 0) {
		return -1
	}
	if (diff >= (365.25 * 86400)) {
		dateData.years = Math.floor(diff / (365.25 * 86400))
		diff -= dateData.years * 365.25 * 86400
	}
	if (diff >= 86400) {
		dateData.days = Math.floor(diff / 86400)
		diff -= dateData.days * 86400
	}
	if (diff >= 3600) {
		dateData.hours = Math.floor(diff / 3600)
		diff -= dateData.hours * 3600
	}
	if (diff >= 60) {
		dateData.min = Math.floor(diff / 60)
		diff -= dateData.min * 60
	}
	dateData.sec = Math.round(diff)
	dateData.millisec = diff % 1 * 1000
	dateData = formatDate(dateData.days) + "天" + formatDate(dateData.hours) + "小时"
	return dateData
}

function formatDate(d) {
	if (d < 10) {
		return "0" + d
	}
	return d
}

function showErrorModal(con) {
	wx.showModal({
		title: '提示',
		showCancel: false,
		content: con
	})
}


function onSubmitFromId(formId,state) {
	if (formId != 'the formId is a mock one') {
		wx.request({
			url: apiUrl + 'cms-pay/wechat/1.0.0/form/add',
			data: {
				"formId": formId,
				"appId": "abcd-xx",
				"fromType": state,//0=普通表单，1=支付 
				"openId": wx.getStorageSync("userLocalData").openid
			},
			method: 'POST',
			header: {
				'content-type': 'application/json',
			},
			success: (res) => {
				console.log(res)
			},
			fail: (res) => {
				console.log(res);
			}
		})
	}
}

//获取最近两个路由页面的source参数
function getRouteSource(){
  let routes = getCurrentPages();
  let sourceString;
  if (routes.length !== 0) {
    let source = routes[routes.length - 1].options.source;
    if (source) {
      //路由不为空且当前路由带有source
      sourceString = source;
    } else {
      //当前页面不带有source但上一个路由页面携带source，兼容有些场景进入小程序后跳转到其他页面
      if (routes.length > 1) {
        let sourcePrev = routes[routes.length - 2].options.source;
        if (sourcePrev) {
          sourceString = sourcePrev;
        }
      }
    }
  }
  return sourceString;
}

module.exports = {
	formatTime,
	formatNumber,
	getDiffDate,
	getDiffDate2,
	showErrorModal,
	onSubmitFromId,
  getRouteSource,
}
