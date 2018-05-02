//选择图片并且上传，上传图片张数：count，上传完网络图片回调：callback.onUploaded(data); callback.uploadingProgress(res);callback.onFailed(res);
const app = getApp();

function addPic(count, callback) {
  if (!count || !callback) {
    throw "count && callback";
  }

  wx.chooseImage({
    count: count > 0 ? count : 1,
    sizeType: ['compressed'],
    success: res => {
      var tempFilePaths = res.tempFilePaths[0];
      uploadImage(tempFilePaths, callback);
    }
  })
}

function uploadImage(filePath, callback) {
  wx.showLoading({
    title: '正在上传图片...',
  })

  let fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
  console.log("memberId = " + app.globalData.tokenInfo.memberId)
  const uploadTask = wx.uploadFile({
    url: 'https://video.fshtop.com/common/1.0.0/upload/file',
    filePath: filePath,
    name: 'multiFile',
    formData: {
      "creator": app.globalData.tokenInfo.memberId,
      "fileName": fileName,
      "mediumType": 1,
      "storeType": 3
    },
    success: res => {
      var data = JSON.parse(res.data);
      //do something
      console.log(data)
      if (callback.onUploaded)
        callback.onUploaded(data);
    },
    fail: res => {
      if (callback.onFailed)
        callback.onFailed(res);
      console.log(res)
    },
    complete: res => {
      wx.hideLoading();
    }
  })

  uploadTask.onProgressUpdate((res) => {
    if (callback.uploadingProgress)
      callback.uploadingProgress(res);
    // console.log('上传进度', res.progress)
    // console.log('已经上传的数据长度', res.totalBytesSent)
    // console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
  })
}

module.exports = {
  addPic: addPic
}