<template>
  <div class="home">
    <el-container>
      <el-header height="80px">
        <div class="left">
          <img src="../assets/images/logo.jpg" alt="">
          <img src="../assets/images/logo2.jpg" alt="">
          <span class="title">噪音实时监控平台</span>
          <span class="today">今日事件数： <span class="count">{{eventNum}}</span></span>
          <el-button type="primary" @click="query">数据查询</el-button>
        </div>
        <div class="right">
          <span>热力图开关</span>
          <el-switch
            v-model="noiseSwitch"
            @change="heartChange"
            inactive-color="#000">>
          </el-switch>
        </div>
      </el-header>
      <el-container>
        <el-aside width="400px">
          <div class="header">事件信息</div>
          <div class="container">
            <el-row>
              <el-col :span="8">地点</el-col>
              <el-col :span="8">事件</el-col>
              <el-col :span="8">时间</el-col>
            </el-row>
            <div class="box">
              <div class="container">
                <ScrollView ref="scrollView">
                  <div class="content-list">
                    <el-row v-for="item in eventList" :key="item.ID">
                      <el-col :span="8">{{
                          item | formatAddress(fixedDeviceMap)
                        }}</el-col>
                      <el-col :span="8">{{ item[getClassTable][0].CLASS }}</el-col>
                      <el-col :span="8">{{ item.TIME | formatTime }}</el-col>
                    </el-row>
                  </div>
                </ScrollView>
              </div>
            </div>
          </div>
        </el-aside>
        <el-container>
          <el-main id="map"></el-main>
          <el-footer height="210px">
            <Chart/>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
    <el-drawer
      title="数据查询"
      :modal="true"
      :visible.sync="drawer"
      :with-header="true">
      <div class="query">
        <div class="top">
          <div>
            <span>查询日期</span>
            <el-date-picker
              v-model="queryDay"
              type="date"
              placeholder="选择日期">
            </el-date-picker>
          </div>
          <div class="timeRange">
            <span>时间范围</span>
            <el-time-picker
              v-model="startTime"
              :picker-options="{
                selectableRange: '00:00:00 - 23:59:59'
              }"
              placeholder="任意时间点">
            </el-time-picker>
            <el-time-picker
              v-model="endTime"
              :picker-options="{
                selectableRange: '00:00:00 - 23:59:59'
              }"
              placeholder="任意时间点">
            </el-time-picker>
          </div>
          <div class="details">
            <span>详细查询</span>
            <div class="left">
              <el-select v-model="queryType" placeholder="请选择查询类型">
                <el-option
                  v-for="item in types"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="right">
              <el-select v-if="queryType === '地点'" v-model="queryAddress" placeholder="请选择查询类型">
                <el-option
                  v-for="item in Address"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
              <el-select v-else-if="queryType === '事件'" v-model="queryEvent" placeholder="请选择查询类型">
                <el-option
                  v-for="item in events"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="queryButton">
            <el-button type="primary" @click="querySelect">查询</el-button>
          </div>
        </div>
        <div class="bottom">
          <el-row>
            <el-col :span="6">位置</el-col>
            <el-col :span="6">分贝</el-col>
            <el-col :span="6">时间</el-col>
            <el-col :span="6">事件</el-col>
          </el-row>
          <p class="line"></p>
          <div class="data">
            <div class="container-list">
              <ScrollView ref="scrollView2">
                <div class="content-list">
                  <el-row v-for="(item, index) in queryResult" :key="item.ID" :class="index % 2 === 0 ? 'odd' : ''">
                    <el-col :span="6">{{item.address}}</el-col>
                    <el-col :span="6">{{item.DECIBEL | formatDB}}</el-col>
                    <el-col :span="6">{{item.TIME | formatVoiceTime}}</el-col>
                    <el-col :span="6">{{item.EVENT_TYPE | formatQueryEvent}}</el-col>
                  </el-row>
                </div>
              </ScrollView>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import AMapLoader from '@amap/amap-jsapi-loader'
import mapConfig from '../config/MapConfig'
import ScrollView from '../components/ScrollView'
import Chart from '@/components/Chart'
// eslint-disable-next-line no-unused-vars
import { getFixedDevice, getHeatmapData, getNewVoice, getTodayCount, getTodayVoice, getVoice, getAllMobile } from '@/api'
import { formatTime, getTodayClassTable, debounce } from '../util/tool'
export default {
  name: 'Home',
  components: {
    ScrollView,
    Chart
  },
  data () {
    return {
      redIcon: null,
      mobileMap: null,
      addressMap: null,
      debounceSetFit: null,
      debounceGetData: null,
      drawer: false,
      noiseSwitch: true,
      infoWindow: null,
      queryDay: '',
      startTime: new Date(2021, 1, 1, 0, 0),
      endTime: new Date(2021, 1, 1, 0, 0),
      types: [
        {
          value: '地点',
          label: '地点'
        },
        {
          value: '事件',
          label: '事件'
        }
      ],
      queryType: '',
      Address: [],
      queryAddress: '',
      queryEvent: '',
      events: ['全部', '玻璃破碎声', '尖叫声', '汽车鸣笛声', '爆炸声', '背景噪声', '鞭炮声', '其他'],
      eventList: [],
      fixedDeviceMap: {},
      fixedDevice: [],
      updateListFlag: false,
      eventNum: 0,
      heartData: [],
      heatmap: null,
      heatmapGradient: {
        0.55: '#006400',
        0.7: '#0000FF',
        0.85: '#FFFF00',
        0.95: '#FFA500',
        1: '#FF0000'
      },
      queryResult: [],
      list: [],
      mobileHeartData: [],
      fixDeviceHeartData: [],
      mobileChange: [],
      chart: null
    }
  },
  filters: {
    formatAddress: function (value, map) {
      if (value.DEVICE_TYPE === 'fixed') return map.get(value.IMEI).address
      return '移动设备地点'
    },
    formatTime: (value) => {
      return formatTime(value, 'MM-DD  hh:mm')
    },
    formatDB: (val) => {
      return (val * 1).toFixed(2)
    },
    formatQueryEvent: (val) => {
      return val === 'Other' ? '其他' : val
    },
    formatVoiceTime: (val) => {
      const d = new Date(val * 1)
      // return d
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` + '  ' + `${d.getHours() > 9 ? d.getHours() : '0' + d.getHours()}:${d.getMinutes() > 9 ? d.getMinutes() : '0' + d.getMinutes()}`
    },
    formatEvent: (value, table) => {
      console.log(value)
      console.log(table)
      let res = value[table]
      res = res[0].CLASS
      res = value === 'Other' ? '其他' : value
      console.log(res)
      return res
    }
  },
  computed: {
    getClassTable: function () {
      return getTodayClassTable()
    }
  },
  methods: {
    heartChange (val) {
      if (val) {
        this.heatmap && this.heatmap.show()
      } else {
        this.heatmap && this.heatmap.hide()
      }
    },
    querySelect () {
      // const query = {
      //   startTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0),
      //   endTime: null,
      //   event: '全部',
      //   address: '全部'
      // }
      const query = {}
      // 开始时间
      query.startTime = new Date(this.queryDay.getFullYear(), this.queryDay.getMonth(), this.queryDay.getDate(),
        this.startTime.getHours(), this.startTime.getMinutes(), this.startTime.getSeconds())

      // 结束时间
      query.endTime = new Date(this.queryDay.getFullYear(), this.queryDay.getMonth(), this.queryDay.getDate(),
        this.endTime.getHours(), this.endTime.getMinutes(), this.endTime.getSeconds())

      if (query.startTime.getTime() > query.endTime.getTime()) {
        Message({
          type: 'error',
          message: '请选择正确的时间'
        })
        return false
      }

      if (this.queryType === '地点') {
        query.event = '全部'
        query.address = this.queryAddress
      } else if (this.queryType === '事件') {
        query.address = '全部'
        query.event = this.queryEvent
      }
      // console.log(query)
      getVoice(query)
        .then(data => {
          console.log(data)
          const result = []
          const time = new Date(query.startTime.getFullYear(), query.startTime.getMonth(), query.startTime.getDate()).getTime() / 1000
          const table = `clas${time}s`
          // 去重复
          for (let i = 0; i < data.data.length; i++) {
            const item = data.data[i]
            const pre = result[result.length - 1]
            const pre2 = result[result.length - 2]
            if (pre && pre2) {
              const offsetTime = Math.abs(item.TIME - pre.TIME)
              const offsetTime2 = Math.abs(item.TIME - pre2.TIME)
              if ((item.DECIBEL !== pre.DECIBEL && offsetTime >= 600) && (item.DECIBEL !== pre2.DECIBEL && offsetTime2 >= 600)) {
                result.push(item)
              }
            } else {
              result.push(item)
            }
          }
          console.log(result.length)
          this.showList = []
          // 1603874280000
          // 1603881529784
          this.queryResult = result.splice(0, result.length - 1).map(item => {
            if (item.DEVICE_TYPE === 'fixed') {
              item.address = this.addressMap.get(item.IMEI).NAME
              if (item[table].length > 0) {
                // console.log('有数据', item[table].CLASS)
                item.EVENT_TYPE = item[table][0].CLASS
              }
            } else if (item.DEVICE_TYPE === 'mobile') {
              item.address = '移动端'
            }
            return item
          })
          console.log(this.queryResult)
          // 处理结果显示
          // this.showList.push(...tempArr)
          // this.$refs.scrollView.refresh()
          // this.isQuery = false
          // this.show = false
        })
        .catch(err => {
          console.log(err)
          this.isQuery = false
          this.show = false
        })
    },
    classifyArr (arr) {
      const temp = []
      const less10 = []
      const less20 = []
      const less30 = []
      const less40 = []
      const less50 = []
      const less60 = []
      const less70 = []
      const less80 = []
      const less90 = []
      const less100 = []
      const less110 = []
      const less120 = []
      const less130 = []
      const less140 = []
      const less150 = []
      arr.forEach(item => {
        const res = Math.floor(item.idx / 10)
        switch (res) {
          case 0:
            less10.push(item)
            break
          case 1:
            less20.push(item)
            break
          case 2:
            less30.push(item)
            break
          case 3:
            less40.push(item)
            break
          case 4:
            less50.push(item)
            break
          case 5:
            less60.push(item)
            break
          case 6:
            less70.push(item)
            break
          case 7:
            less80.push(item)
            break
          case 8:
            less90.push(item)
            break
          case 9:
            less100.push(item)
            break
          case 10:
            less110.push(item)
            break
          case 11:
            less120.push(item)
            break
          case 12:
            less130.push(item)
            break
          case 13:
            less140.push(item)
            break
          case 14:
            less150.push(item)
            break
        }
      })
      if (less10.length >= 2)temp.push(less10)
      if (less20.length >= 2)temp.push(less20)
      if (less30.length >= 2)temp.push(less30)
      if (less40.length >= 2)temp.push(less40)
      if (less50.length >= 2)temp.push(less50)
      if (less60.length >= 2)temp.push(less60)
      if (less70.length >= 2)temp.push(less70)
      if (less80.length >= 2)temp.push(less80)
      if (less90.length >= 2)temp.push(less90)
      if (less100.length >= 2)temp.push(less100)
      if (less110.length >= 2)temp.push(less110)
      if (less120.length >= 2)temp.push(less120)
      if (less130.length >= 2)temp.push(less130)
      if (less140.length >= 2)temp.push(less140)
      if (less150.length >= 2)temp.push(less150)
      return temp
    },
    computePoint (a, b) {
      // 计算两个点之间需要插入的点和坐标
      const list = []
      if (a && b) {
        // 1.经纬度转浮点
        // a.GPS[0] = parseFloat(a.GPS[0])
        // a.GPS[1] = parseFloat(a.GPS[1])
        // b.GPS[0] = parseFloat(b.GPS[0])
        // b.GPS[1] = parseFloat(b.GPS[1])
        // 2.计算
        // 2.1 通过平面左边的方式计算出坐标系上两点之间的距离
        const distance = this.AMap.GeometryUtil.distance(
          [a.lng, a.lat],
          [b.lng, b.lat]
        )
        // 2.2 将距离分隔成若干小段, 每2m一段,这里向下取整
        const number = parseInt(distance / 2)
        // 2.3 计算每段的噪音增长值
        const count = Math.abs((a.count - b.count) / number)
        // 2.4 计算每段的坐标增长值
        const x = Math.abs(a.lng - b.lng) / number // 坐标平均值
        const y = Math.abs(a.lat - b.lat) / number
        // 2.5 计算噪音的正/负增益   计算坐标的正负增益
        const operator = a.count > b.count ? -1 : 1 // 判断大小是加还是减
        const xOperator = a.lng > b.lng ? -1 : 1 // 判断坐标是加还是减
        const yOperator = a.lat > b.lat ? -1 : 1

        // 循环, 每2m是一个虚拟点
        for (let i = 1; i < number; i++) {
          list.push({
            lng: (a.lng + x * i * xOperator).toFixed(6),
            lat: (a.lat + y * i * yOperator).toFixed(6),
            count: parseInt(a.count + count * i * operator) === 0 ? 10 : parseInt(a.count + count * i * operator)
          })
        }
      }
      return list
    },
    query () {
      this.drawer = true
    },
    setFit () {
      this.map.setFitView(this.fixedDevice.map(item => {
        return item.Mark
      }))
    },
    getMoreData () {
      console.log('获取更多')
      const query = {
        time: this.eventList[this.eventList.length - 1].TIME,
        limit: 40 // 获取20条即可
      }
      getTodayVoice(query)
        .then((res) => {
          this.eventList.push(...res.data)
          this.$refs.scrollView.synchronizeRefresh((myScroll) => {
            console.log('加载成功2', myScroll.maxScrollY)
          })
        })
        .catch((err) => {
          console.log(err)
        })
    },
    gps2LngLat (lng, lat) {
      return new Promise((resolve, reject) => {
        this.AMap.convertFrom([lng, lat], 'gps', (status, result) => {
          if (result.info === 'ok') {
            const res = result.locations // Array.<LngLat>
            resolve([res[0].lng, res[0].lat])
          }
        })
      })
    },
    gps2AMapLngLat (lng, lat) {
      return new Promise((resolve, reject) => {
        this.AMap.convertFrom([lng, lat], 'gps', (status, result) => {
          if (result.info === 'ok') {
            resolve(...result.locations)
          }
        })
      })
    }
  },
  created () {
    this.debounceSetFit = debounce(this.setFit)
    this.debounceGetData = debounce(this.getMoreData, 200)
    this.fixedDeviceMap = new Map()
    AMapLoader.load(mapConfig)
      .then((AMap) => {
        this.AMap = AMap
        this.map = new AMap.Map('map', {
          zoom: 15,
          center: [110.338231, 25.283036], // 设置地图中心点坐标110.338231   , 25.283036
          viewMode: '2D' // 设置地图模式
        })
        // 信息窗体
        this.infoWindow = new AMap.InfoWindow({
          offset: new AMap.Pixel(0, -30)
        })
        // 热力图
        this.map.plugin('AMap.Heatmap', () => {
          this.heatmap = new AMap.Heatmap(this.map, {
            radius: 8, // 给定半径
            opacity: [0, 0.8],
            gradient: this.heatmapGradient
          })
        })
        // 红色点
        this.redIcon = new AMap.Icon({
          size: new AMap.Size(51, 70), // 图标尺寸
          image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png', // Icon的图像
          imageSize: new AMap.Size(25, 35) // 根据所设置的大小拉伸或压缩图片
        })
        // 获取事件数量
        return getTodayCount()
      })
      .then((data) => {
        this.eventNum = data.data
        return getFixedDevice()
      })
      // 获取固定设备,并为所有固定设备添加mark
      .then((device) => {
        this.addressMap = new Map()
        device.data.forEach(item => {
          this.addressMap.set(item.IMEI, item)
        })
        let arr = device.data.map(item => {
          return item.NAME
        })
        arr = [...new Set(arr)]
        // console.log(arr)
        this.Address = arr
        return new Promise((resolve, reject) => {
          this.fixedDevice.push(...device.data)
          // 创建点标记
          for (let i = 0; i < this.fixedDevice.length; i++) {
            const item = this.fixedDevice[i]
            item._gps = item.GPS.split('$')
            this.AMap.convertFrom(
              [...item._gps],
              'gps',
              (status, result) => {
                if (result.info === 'ok') {
                  const res = result.locations // Array.<LngLat>
                  item.LanLat = [res[0].lng, res[0].lat]
                  item.Mark = new this.AMap.Marker({
                    position: new this.AMap.LngLat(...item.LanLat)
                    // a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png
                    // icon: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
                    // offset: new this.AMap.Pixel(-13, -30)
                  })
                  this.fixedDeviceMap.set(item.IMEI, {
                    address: item.NAME,
                    mark: item.Mark,
                    LanLat: [res[0].lng, res[0].lat],
                    idx: item.CATEGORY,
                    decibel: 0
                  })
                  this.map.add(item.Mark)
                  item.Mark.content = '当日暂无噪音事件被检测到'
                  item.Mark.imei = item.IMEI
                  item.Mark.on('click', this.markerClick)
                  if (i === this.fixedDevice.length - 1) {
                    this.map.setFitView(this.fixedDevice.map(item => {
                      return item.Mark
                    }))
                    resolve(666)
                  }
                }
              }
            )
          }
        })
      })
      .then(() => {
        // 获取最新的数据
        const query = {
          imei: this.imei,
          time: Date.now(),
          limit: 40 // 获取40条即可
        }
        return getTodayVoice(query)
      })
      // 获取今天的噪音事件
      .then((res) => {
        // console.log(res)
        this.eventList.push(...res.data)
        // 添加定时器
        // 如果现在的列表为空, 就加载20条
        // 如果列表不为空, 获取到当前列表中最新的数据也就是arr[0]的时间t
        // 从数据库中获取到时间大于等于t的所有数据, 添加到列表最前面
        this.updateVoiceTimer = setInterval(() => {
          if (this.updateListFlag) return
          if (this.eventList.length === 0) {
            // 原有列表中没有数据,新加载20条
            // 做类似于下拉加载的操作
            const query = {
              imei: this.imei,
              time: Date.now(),
              limit: 20 // 获取20条即可
            }
            getTodayVoice(query).then((res) => {
              // 清空员数组
              this.list && this.eventList.splice(0, this.list.length)
              this.eventList.push(...res.data)
              this.$refs.scrollView.refresh()
            })
          } else {
            // 原有列表中已有数据, 加载最新的
            this.updateListFlag = true
            const time = this.eventList[0].TIME
            getTodayCount()
              .then((data) => {
                if (this.eventNum !== data.data) {
                  return data.data
                }
              })
              .then((num) => {
                if (num) {
                  this.eventNum = num
                  return getNewVoice(time, this.imei)
                }
              })
              .then((res) => {
                if (res) {
                  res.data.forEach((item) => {
                    // 为新事件添加对应的mark动画
                    this.fixedDeviceMap
                      .get(item.IMEI)
                      .mark.setAnimation('AMAP_ANIMATION_BOUNCE')
                    if (
                      this.fixedDeviceMap.get(item.IMEI).mark.timer !==
                      undefined &&
                      this.fixedDeviceMap.get(item.IMEI).mark.timer !== null
                    ) {
                      clearTimeout(
                        this.fixedDeviceMap.get(item.IMEI).mark.timer
                      )
                    }
                    this.fixedDeviceMap.get(
                      item.IMEI
                    ).mark.timer = setTimeout(() => {
                      this.fixedDeviceMap
                        .get(item.IMEI)
                        .mark.setAnimation('AMAP_ANIMATION_NONE')
                    }, 3000)
                  })
                  if (res.data.length > 0) {
                    this.eventList.unshift(...res.data)
                    this.$refs.scrollView.refresh()
                    // 判断新的数据中,有没有出现声音变化超过了20, 超过了, 接下来才需要更新热力图
                    let flag = false
                    for (let i = 0; i < res.data.length; i++) {
                      const abs = Math.abs(
                        this.fixedDeviceMap.get(res.data[i].IMEI).decibel -
                        res.data[i].DECIBEL
                      )
                      if (!flag && abs >= 20) flag = true
                      this.fixedDeviceMap.get(res.data[i].IMEI).decibel =
                        res.data[i].DECIBEL
                    }
                    if (flag) {
                      // 有数据就更新热力图
                      const arr = []
                      this.fixedDevice.forEach((item) => {
                        arr.push(item.IMEI)
                      })
                      getHeatmapData(arr)
                        .then((res) => {
                          // 更新热力图
                          // 生成符合高德地图热力图api要求的数据  --> [{lng: 116.405285, lat: 39.904989, count: 65},{}, …]
                          this.heartData = []
                          console.log(res)
                          Object.keys(res.data).forEach((key) => {
                            const obj = {}
                            const device = this.fixedDeviceMap.get(key)
                            obj.lng = device.LanLat[0]
                            obj.lat = device.LanLat[1]
                            obj.count = res.data[key] === null ? 0 : res.data[key].DECIBEL * 1
                            obj.idx = this.fixedDeviceMap.get(key).idx
                            this.heartData.push(obj)
                          })
                          this.heartData = this.heartData.sort((a, b) => {
                            return a.idx - b.idx
                          })
                          const arr2 = this.classifyArr(this.heartData)
                          // console.log(this.heartData)
                          let arr = []
                          arr2.forEach(group => {
                            group.reduce((prev, curr) => {
                              arr = arr.concat(this.computePoint(prev, curr))
                              return curr
                            })
                          })
                          this.fixDeviceHeartData = arr.concat(this.heartData)
                          this.heatmap.setDataSet({
                            data: this.fixDeviceHeartData.concat(this.mobileHeartData)
                          })
                        })
                        .catch((err) => {
                          console.log(err)
                        })
                    }
                  }
                }
                return getAllMobile()
              })
              .then((res) => {
                this.mobileHeartFlag = false
                // console.log(res.data)
                const arr = []
                this.mobileChange = []
                for (let i = 0; i < res.data.length; i++) {
                  const obj = this.mobileMap.get(res.data[i].IMEI)
                  if (obj.GPS !== res.data[i].GPS) {
                    obj.GPS = res.data[i].GPS
                    this.mobileChange.push(res.data[i])
                  }
                  if (obj.count !== res.data[i].DECIBEL * 1) {
                    this.mobileHeartFlag = true
                    obj.count = res.data[i].DECIBEL * 1
                  }
                }
                // 更新变化了的移动端的位置和热力图
                this.mobileChange.forEach(item => {
                  const [lng, lat] = item.GPS.split('$')
                  arr.push(this.gps2AMapLngLat(lng, lat))
                })
                return Promise.all(arr)
              })
              .then((res) => {
                this.mobileChange.forEach((item, idx) => {
                  // 更新位置 + 热力图
                  const obj = this.mobileMap.get(item.IMEI)
                  obj.lngLat = res[idx]
                  // 更新位置
                  obj.Mark.setPosition(res[idx])
                })
                // 更新热力图
                if (this.mobileHeartFlag) {
                  const mobileHeartData = []
                  this.mobileMap.forEach(item => {
                    mobileHeartData.push({ lng: item.lngLat.lng, lat: item.lngLat.lat, count: item.count })
                  })
                  this.mobileHeartData = mobileHeartData
                  this.heatmap.setDataSet({
                    data: this.fixDeviceHeartData.concat(this.mobileHeartData)
                  })
                }
                this.updateListFlag = false
              })
              .catch((err) => {
                console.log(err)
              })
          }
        }, 2700)
        // 这里还需插入所有的移动设备
        return getAllMobile()
      })
      // 获取移动端设备
      .then(mobiles => {
        // console.log(mobiles, 6666666666)
        // 将所有移动端设备存储到Map对象中
        this.mobileMap = new Map()
        mobiles.data.forEach(item => {
          this.mobileMap.set(item.IMEI, {
            gps: item.GPS,
            // lng: item.GPS.split('$')[0],
            // lat: item.GPS.split('$')[1],
            count: item.DECIBEL * 1,
            id: item.id
          })
        })
        // 将所有的移动端的经纬度进行转化
        const arr = []
        const keys = [...this.mobileMap.keys()]
        keys.forEach(item => {
          const [lng, lat] = this.mobileMap.get(item).gps.split('$')
          arr.push(this.gps2AMapLngLat(lng, lat))
        })
        return Promise.all(arr)
      })
      .then(res => {
        // console.log(res, 222)
        const keys = [...this.mobileMap.keys()]
        keys.forEach((key, idx) => {
          const lngLat = res[idx]
          // console.log(lngLat)
          const obj = this.mobileMap.get(key)
          obj.lngLat = lngLat
          // 处理点标记
          obj.Mark = new this.AMap.Marker({
            position: lngLat,
            // a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png
            // icon: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
            icon: this.redIcon
            // anchor: 'bottom-center'
          })
          this.map.add(obj.Mark)
        })
        const arr = []
        this.fixedDevice.forEach((item) => {
          arr.push(item.IMEI)
        })
        return getHeatmapData(arr)
      })
      // 首次进来需要处理热力图
      .then((res) => {
        // 更新热力图
        // 生成符合高德地图热力图api要求的数据  --> [{lng: 116.405285, lat: 39.904989, count: 65},{}, …]
        this.heartData = []
        Object.keys(res.data).forEach((key) => {
          const obj = {}
          const device = this.fixedDeviceMap.get(key)
          obj.lng = device.LanLat[0]
          obj.lat = device.LanLat[1]
          obj.count = res.data[key] === null ? 0 : res.data[key].DECIBEL * 1
          obj.idx = this.fixedDeviceMap.get(key).idx
          this.heartData.push(obj)
        })
        this.heartData = this.heartData.sort((a, b) => {
          return a.idx - b.idx
        })
        const arr2 = this.classifyArr(this.heartData)
        // console.log(this.heartData)

        let arr = []
        arr2.forEach(group => {
          group.reduce((prev, curr) => {
            arr = arr.concat(this.computePoint(prev, curr))
            return curr
          })
        })
        arr = arr.concat(this.heartData)
        this.fixDeviceHeartData = arr
        // 加入移动端的热力图
        const mobileHeartData = []
        this.mobileMap.forEach(item => {
          mobileHeartData.push({ lng: item.lngLat.lng, lat: item.lngLat.lat, count: item.count })
        })
        this.mobileHeartData = mobileHeartData
        this.heatmap.setDataSet({
          data: this.fixDeviceHeartData.concat(this.mobileHeartData)
        })
      })
      .catch((err) => {
        console.log(err)
      })
  },
  mounted () {
    window.addEventListener('resize', this.debounceSetFit)
    this.$refs.scrollView.scrolling((y, myScroll) => {
      if (y <= myScroll.maxScrollY) {
        this.debounceGetData()
      }
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.debounceSetFit)
  }
}
</script>
<style scoped lang="scss">
$lageFont: 30px;
$color: #03FBF9;
.home{
  width: 100%;
  height: 100%;
  background: url("../assets/images/bg.png");
  background-size: cover;
  >.el-container{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 25px;
    box-sizing: border-box;
    >.el-header{
      //background: #cccccc;
      user-select: none;
      display: flex;
      justify-content: space-between;
      >div{
        height: 80px;
        line-height: 80px;
      }
      .left{
        position: relative;
        img{
          width: 70px;
          height: 70px;
          vertical-align: top;
          margin-top: 5px;
          margin-left: 15px;
          border-radius: 50%;
        }
        .title{
          color: $color;
          font-size: $lageFont;
          font-weight: 500;
          display: inline-block;
          height: 80px;
          line-height: 80px;
          padding: 0 20px;
        }
        .today{
          font-size: 20px;
          color: #fff;
          font-weight: 500;
          .count{
            color: #998053;
            font-weight: bold;
          }
        }
        .el-button{
          font-size: 16px;
          margin-left: 15px;
        }
      }
      .right{
        height: 80px;
        line-height: 80px;
        text-align: center;
        >span{
          display: inline-block;
          height: 30px;
          line-height: 30px;
          font-size: 18px;
          margin-right: 10px;
          color: $color;
        }
        >.el-switch{
          height: 80px;
          line-height: 80px;
        }
      }
    }
    >.el-container{
      flex: 1;
      display: flex;
      >.el-aside{
        //background: #cccccc;
        margin-right: 20px;
        display: flex;
        flex-direction: column;
        border: 1px solid  #032B45;
        >.header{
          background: #08304A;
          height: 35px;
          color: $color;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          box-sizing: border-box;
          padding: 5px 10px;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
        }
        >.container{
          flex: 1;
          display: flex;
          flex-direction: column;
          .el-row{
            height: 35px;
            line-height: 35px;
            font-size: 18px;
            font-weight: bold;
            color: white;
            .el-col{
              text-align: center;
            }
          }
          .box{
            flex: 1;
            //background: #ccc;
            overflow: hidden;
            position: relative;
            .container{
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              overflow: hidden;
            }
          }
        }
      }
      >.el-container{
        flex: 1;
        display: flex;
        flex-direction: column;
        >.el-main{
          flex: 1;
          padding: 0;
        }
        >.el-footer{
          margin-top: 10px;
          border: 1px solid  #032B45;
          padding: 0;
        }
      }
    }
  }
  ::v-deep .el-drawer{
    outline: none;
    .el-drawer__header{
      margin-bottom: 0;
      padding-bottom: 22px;
      border-bottom: 1px solid #ccc;
      >span, button{
        outline: none;
        font-size: 22px;
        color: black;
      }
    }
    .el-drawer__body{
      .query{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .top{
          padding:  15px 30px;
          span{
            margin-right: 20px;
          }
          >div{
            margin-top: 15px;
          }
          .timeRange{
            .el-date-editor{
              &:nth-of-type(2){
                margin-left: 15px;
              }
            }
          }
          .details{
            display: flex;
            span{
              display: inline-block;
              height: 40px;
              line-height: 40px;
            }
            .right, .left{
              flex: 1;
            }
          }
          >.queryButton{
            text-align: center;
            .el-button{
              span{
                margin: 0;
              }
            }
          }
        }
        .bottom{
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          >.el-row{
            margin-top: 25px;
            padding-bottom: 15px;
            .el-col{
              text-align: center;
              font-size: 14px;
              color: rgba(0, 0, 0, 0.65);
              font-weight: bold;
            }
          }
          >.line{
            bottom: 0;
            height: 1px;
            padding: 0;
            margin: 0 30px;
            box-sizing: border-box;
            background: #7f7f7f;
          }
          >.data{
            flex: 1;
            //background: bisque;
            position: relative;
            >.container-list{
              position: absolute;
              top: 0;
              bottom: 0px;
              left: 0;
              right: 0;
              overflow: hidden;
              padding: 30px 0;
              box-sizing: border-box;
              //background: red;
              .el-row{
                height: 30px;
                line-height: 30px;
                &.odd{
                  background: #eee;
                }
              }
              .el-col{
                text-align: center;
              }
            }
          }
        }
      }
    }
  }
}
</style>
