const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}
const submitFormId = (app, formId) => {
	console.log(formId)
	if (formId != "the formId is a mock one") {
		wx.request({
			url: app.globalData.host + "/cms-pay/wechat/1.0.0/form/add",
			data: {
				appId: app.globalData.appId,
				formId: formId,
				fromType: 0,
				openId: app.globalData.tokenInfo.openId
			},
			method: "POST",
			success: res => {
				console.log(res)
			}
		})
	}
}

module.exports = {
	formatTime: formatTime,
	submitFormId: submitFormId
}
