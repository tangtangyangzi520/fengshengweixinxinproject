import config from '../config.js';
import utils from './utils.js';
//统计tracker接口
let TRACKER = 'https://tracker.fshtop.com/sts/flume/post'

//时间戳
let timeString = function () {
  return +new Date().getTime()
}

//创建时间
function createTime() {
  let dates = new Date(),
    year = dates.getFullYear(),
    month = dates.getMonth() + 1,
    day = dates.getDate(),
    hour = dates.getHours(),
    minute = dates.getMinutes(),
    second = dates.getSeconds();
  month = checkTime(month)
  day = checkTime(day)
  hour = checkTime(hour)
  minute = checkTime(minute)
  second = checkTime(second)
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
}

//年月日时分秒转化；
function checkTime(times) {
  return times = (times < 10 ? '0' + times : times)
}

//随机生成指定N位数
function randNum(n) {
  let rnd = ''
  for (let i = 0; i < n; i++) {
    rnd += Math.floor(Math.random() * 10)
  }
  return rnd
}

const startSeries = timeString() + randNum(5)

// 获取系统信息同步接口
let systemInfo = wx.getSystemInfoSync()

//所有事件的公共的字段
const postArr = function () {
  let source = wx.getStorageSync("sourceData");
  if (source == '' || !source) {
    source = utils.getRouteSource();
  }
  return {
    'id': wx.getStorageSync("tokenInfo").openId,
    'appId': config.appId,
    'startSeries': startSeries,
    'memberId': wx.getStorageSync("tokenInfo").memberId,
    'brand': systemInfo.brand,
    'model': systemInfo.model,
    'pixelRatio': systemInfo.pixelRatio,
    'screenWidth': systemInfo.screenWidth,
    'screenHeight': systemInfo.screenHeight,
    'windowWidth': systemInfo.windowWidth,
    'windowHeight': systemInfo.windowHeight,
    'language': systemInfo.language,
    'version': systemInfo.version,
    'system': systemInfo.system,
    'platform': systemInfo.platform,
    'fontSizeSetting': systemInfo.fontSizeSetting,
    'SDKVersion': systemInfo.SDKVersion,
    'app_key': 100003,
    'create_time': createTime(Date.now()),
    'promoteSource': source,
    'latitude': '',
    'longitude': '',
  }
}

//刚浏览页面的时间戳
const startRead = timeString()

//初次进入浏览页面tracker
const firstRead = function (e) {
  //初次进入浏览页面上传对象
  let firstEvent = postArr()
  firstEvent.global_event = 3;
  firstEvent.pageId = e.page_id;
  firstEvent.pageName = e.page_name;
  firstEvent.object1 = e.object1;
  firstEvent.object2 = e.object2;
  firstEvent.object3 = e.object3;
  let combine = firstEvent;
  console.log(combine)
  wx.request({
    url: TRACKER,
    method: 'POST',
    header: {
      'content-type': 'application/json'
    },
    data: JSON.stringify([combine]),
    success: (res) => { }
  })
}


//点击事件tracker
const trackData = function (e) {
  //点击事件上传对象
  let clickEvent = postArr()
  clickEvent.global_event = 4
  clickEvent.eventId = e.event_id;
  clickEvent.event_name = e.event_name;
  clickEvent.action_type = e.action_type;
  clickEvent.object1 = e.object1;
  clickEvent.object2 = e.object2;
  clickEvent.object3 = e.object3;
  let combine = clickEvent;
  console.log(combine)
  wx.request({
    url: TRACKER,
    method: 'POST',
    header: {
      'content-type': 'application/json'
    },
    data: JSON.stringify([combine]),
    success: (res) => { }
  })
}

const tracker = {
  trackData,
  firstRead
}

export default tracker