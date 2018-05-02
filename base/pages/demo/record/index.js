
const recorderManager = wx.getRecorderManager();
Page({

	/**
	 * 页面的初始数据
	 */
  data: {
    page: 1,
    goodList: [],
    allPage: 1,
    hiddenEva: true
  },
  startRecord: function () {
    let _this = this;
    wx.startRecord({
       success: function (res) {
         let tempFilePath = res.tempFilePath
         console.log('dgdf',res)
         _this.uploadRecord(tempFilePath);
       },
       fail: function (res) {
         //录音失败
         console.log('dgdf', res)
       }
     })
  },
  stopRecord: function () {
    wx.stopRecord()
  },
  uploadRecord(filePath) {
    wx.showLoading({
      title: '正在上传音频...',
    })
    let fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
    const uploadTask = wx.uploadFile({
      url: 'https://video.fshtop.com/common/1.0.0/upload/file',
      filePath: filePath,
      name: 'multiFile',
      formData: {
        // "creator": "",
        // "fileName": fileName,
        // "mediumType": 2,
        // "storeType": 1
      },
      success: res => {
        let data = JSON.parse(res.data);
        //do something
        console.log('66', data)
        /*  if (callback.onUploaded)
           callback.onUploaded(data); */
      },
      fail: res => {
        /*    if (callback.onFailed)
             callback.onFailed(res); */
        console.log("ss", res)
      },
      complete: res => {
        wx.hideLoading();
      }
    })

    uploadTask.onProgressUpdate((res) => {
      /*  if (callback.uploadingProgress)
         callback.uploadingProgress(res); */
      console.log('上传进度', res.progress)
      // console.log('已经上传的数据长度', res.totalBytesSent)
      // console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
    })
  },
  onLoad: function (options) {
  }
})