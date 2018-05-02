

//成功提示窗
function showSuccessToast(message){
    wx.showToast({
        title: message ? message :"成功"
    })
}

//错误提示窗
function showErrorToast(errorMsg){
    wx.showToast({
        title: errorMsg ? errorMsg : "未知错误",
        image:"/images/ic_120_wrong_normal@3x.png"
    })
}


//loading窗
function showLoading(message) {
    wx.showLoading({
        title: message ? message : "请稍后...",
    })
}

//隐藏loading窗
function hideLoading(){
    wx.hideLoading()
}


module.exports = {
    showSuccessToast: showSuccessToast,
    showErrorToast: showErrorToast,
    showLoading: showLoading,
    hideLoading: hideLoading
}