//index.js
//获取应用实例
const app = getApp()
let arr = [];
Page({
  data: {
    info: '',
    btOpen: false,
    stateMsg: '扫描设备中...',
    onerror: false,
    errorMsg: '未检测到设备',
    scaleOutIn1: {},
    scaleOutIn2: {}
  },
  onLoad(e) {
    this.userInfo = e.data;
    this.startScan();
    // this.playAnimation();
  },
  //扫描动画
  playAnimation() {
    var animation1 = wx.createAnimation({
      duration: 1000, delay: 0
    })
    var animation2 = wx.createAnimation({
      duration: 1000, delay: 0
    })
    animation1.scale(1, 1).opacity(1).step({ duration: 1000, delay: 0 }).scale(2, 2).opacity(0).step({ duration: 1600, delay: 1000 });
    animation2.scale(1, 1).opacity(1).step({ duration: 1000, delay: 0 }).scale(2, 2).opacity(0).step({ duration: 1600, delay: 1800 });
    this.setData({
      scaleOutIn1: animation1.export(),
      scaleOutIn2: animation2.export()
    })
  },
  //开始扫描附近的蓝牙设备
  startScan() {
    let _this = this;

    wx.openBluetoothAdapter({
      success(res) {
        console.log(res)

        //已经开启手机蓝牙
        _this.setData({
          btOpen: true,
          onerror: false,
        });
        wx.startBluetoothDevicesDiscovery({
          services: [],
          success: function (res) {
            console.log(res);
            _this.scanText();
            _this.isScaning = true;
            // _this.playAnimation();
            //开始搜索附近的蓝牙设备
            _this.setData({ stateMsg: '扫描设备中' });
            setTimeout(() => {
              if (_this.isScaning) {
                wx.closeBluetoothAdapter({
                  success: function (res) {
                    _this.disconnect();
                    _this.setData({
                      onerror: true,
                      errorMsg: '未检测到设备'
                    })
                  }
                })
              }
            }, 10000)
          }
        })
      },
      fail(res) {
        console.log(res)
        _this.setData({ stateMsg: '连接失败' })
      }
    })
    this.onBluetoothDeviceFound();
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log(res)
      _this.setData({
        btOpen: res.available,
        stateMsg: res.available ? '扫描设备中' : '连接失败'
      })
      if (res.available) {
        _this.scanText();
      }
    })
  },
  //关闭连接
  disconnect() {
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res)
      }
    })
  },
  //扫描过程文字动画
  scanText() {
    let index = 0;
    this.scanTimer && clearInterval(this.scanTimer)
    this.scanTimer = setInterval(() => {
      if (this.data.btOpen) {
        index++;
        index = index > 2 ? 0 : index;
        let len = index > 1 ? '...' : (index == 1 ? '..' : '.');
        this.setData({ stateMsg: '扫描设备中' + len });
      }      
    }, 500)
  },
  //发现附近设备
  onBluetoothDeviceFound() {
    let _this = this;
    wx.onBluetoothDeviceFound(function (devices) {
      console.log('devices', devices);
      wx.getBluetoothDevices({
        success: function (res) {
          console.log('found', res)
          res.devices.forEach(item => {
            //只过滤出体脂称设备
            if (/Health Scale/gi.test(item.name)) {
              _this.isScaning = false;
              //停止扫描蓝牙设备
              wx.stopBluetoothDevicesDiscovery({
                success: function (res) {
                  console.log(res)
                }
              })
              //连接找到的设备
              _this.createBLEConnection(item.deviceId);
            }
          })
        }
      })
    })
  },
  //连接设备并获取设备所有服务
  createBLEConnection(deviceId) {

    let _this = this;
    wx.createBLEConnection({
      deviceId: deviceId,
      success: function (res) {
      clearInterval(_this.scanTimer);
        _this.setData({ stateMsg: '设备连接成功，请暂时不要下秤哦~' })
        wx.getBLEDeviceServices({
          deviceId: deviceId,
          success: function (res) {
            //只获取FFFO服务的特征值
            let serviceId = res.services.find(item => item.uuid.substr(4, 4) == 'FFF0').uuid;
            wx.getBLEDeviceCharacteristics({
              deviceId: deviceId,
              serviceId: serviceId,
              success: function (res) {
                let readItem = res.characteristics.find(item => item.uuid.substr(4, 4) == 'FFF1');
                let sendItem = res.characteristics.find(item => item.uuid.substr(4, 4) == 'FFF4');
                _this.onBLECharacteristicValueChange();
                // wx.showModal({
                //   title: '标题',
                //   content: JSON.stringify(res.characteristics)
                // });
                console.log('sendItem', sendItem)
                console.log('readItem', readItem)
                _this.notifyBLECharacteristicValueChange({ deviceId: deviceId, serviceId: serviceId, characteristicId: sendItem.uuid, readItem: readItem, sendItem: sendItem });
                _this.readBLECharacteristicValue({ deviceId: deviceId, serviceId: serviceId, characteristicId: readItem.uuid });
                _this.setData({
                  readItem,
                  sendItem,
                  deviceId,
                  serviceId
                });
              }
            })
          }
        })
      }
    })
  },
  //读取设备特征值
  readBLECharacteristicValue(options) {
    wx.readBLECharacteristicValue({
      deviceId: options.deviceId,
      serviceId: options.serviceId,
      characteristicId: options.characteristicId,
      success: function (res) {
        console.log('readBLECharacteristicValue:', res.characteristic.value)
      }
    })
  },
  //监听设备特征值变化
  notifyBLECharacteristicValueChange(options) {
    let _this = this;
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      deviceId: options.deviceId,
      serviceId: options.serviceId,
      characteristicId: options.characteristicId,
      success: function (res) {
        console.log('notifyBLECharacteristicValueChange1 ', res.errMsg);
        _this.writeBLECharacteristicValue(options);
        setTimeout(() => {
          _this.writeBLECharacteristicValue(options);
        }, 500)
      }
    })
  },
  //向设备发送数据
  writeBLECharacteristicValue(options) {
    // 向蓝牙设备发送一个0x00的16进制数据
    // let hex = 'fd370003000000000000c9';
    // var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    //   return parseInt(h, 16)
    // }))
    let hex = 'fd370003000000000000c9';
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))
    var buffer = typedArray.buffer
    wx.writeBLECharacteristicValue({
      deviceId: options.deviceId,
      serviceId: options.serviceId,
      characteristicId: options.readItem.uuid,
      value: buffer,
      success: function (res) {
        console.log('writeBLECharacteristicValue:', res.errMsg)
      }
    })
  },
  //读取体脂称发出的数据
  onBLECharacteristicValueChange() {
    let hasGetData = false;
    wx.onBLECharacteristicValueChange(function (characteristics) {
      if (hasGetData) { return }
      hasGetData = true;
      var cfValue = buf2hex(characteristics.value)
      var value = wx.getStorageSync('userData')
      var str = value.date;
      var r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
      if (r == null) return false;
      var d = new Date(r[1], r[3] - 1, r[4]);
      if (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3] && d.getDate() == r[4]) {
        var Y = new Date().getFullYear();
        var Age = Y - r[1]
      }
      wx.request({
        url: 'https://tapi.fshtop.com/intelligence-api/wechat/cf/1.0.0/upload', //接口地址
        data: {
          "age": Age,
          "cfData": cfValue,
          "gender": value.sex,
          "height": value.height
        },
        method: "POST",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          wx.setStorageSync('bodyData', {
            allUserInfo: res.data.data
          });
          wx.navigateTo({
            url: '/pages/result/index',
          })
        }
      })
     
      // wx.showModal({
      //   title: '标题1',
      //   content: JSON.stringify(arr)
      // });
    })
  },
  goStart() {
    if (this.data.onerror) {
      this.startScan();
    }
  }
})
function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}