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
          <span>噪音开关</span>
          <el-switch
            v-model="noiseSwitch"
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
                          item | formatAddrest(fixedDeviceMap)
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
          <el-footer height="190px">
            <div class="top">区域噪声统计</div>
            <div class="bottom"></div>
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
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
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
        </div>
        <div class="bottom">
          <el-row>
            <el-col :span="6">位置</el-col>
            <el-col :span="6">分贝</el-col>
            <el-col :span="6">时间</el-col>
            <el-col :span="6">事件</el-col>
          </el-row>
          <p class="line"></p>
          <div class="data"></div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
import mapConfig from '../config/MapConfig'
import ScrollView from '../components/ScrollView'
// eslint-disable-next-line no-unused-vars
import { getFixedDevice, getHeatmapData, getNewVoice, getTodayCount, getTodayVoice } from '../../../noisemap/src/api'
import { formatTime, getTodayClassTable, debounce } from '../util/tool'
export default {
  name: 'Home',
  components: {
    ScrollView
  },
  data () {
    return {
      debounceSetFit: null,
      debounceGetData: null,
      drawer: false,
      noiseSwitch: true,
      infoWindow: null,
      queryDay: '',
      startTime: new Date(2021, 1, 1, 0, 0),
      endTime: new Date(2021, 1, 1, 0, 0),
      types: [{
        value: '地点',
        label: '地点'
      }, {
        value: '事件',
        label: '事件'
      }],
      queryType: '',
      Address: [],
      queryAddress: '',
      queryEvent: '',
      events: ['全部', '玻璃破碎声', '尖叫声', '汽车鸣笛声', '爆炸声', '背景噪声', '鞭炮声', '其他'],
      eventList: [],
      fixedDeviceMap: {},
      fixedDevice: [],
      updateListFlag: false,
      eventNum: 0
    }
  },
  filters: {
    formatAddrest: function (value, map) {
      if (value.DEVICE_TYPE === 'fixed') return map.get(value.IMEI).address
      return '移动设备地点'
    },
    formatTime: (value) => {
      return formatTime(value, 'MM-DD  hh:mm')
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
        // 获取事件数量
        return getTodayCount()
      })
      .then((data) => {
        this.eventNum = data.data
        return getFixedDevice()
      })
      // 获取固定设备,并为所有固定设备添加mark
      .then((device) => {
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
                    position: new this.AMap.LngLat(...item.LanLat),
                    title: 66
                    // offset: new this.AMap.Pixel(-10, -10)
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
        console.log(res)
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
              this.eventList.splice(0, this.list.length)
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
                    /* let flag = false
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
                      const arr = [this.imei]
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
                            if (
                              device === undefined &&
                              this.mobileDevice.IMEI === key
                            ) {
                              // 移动端
                              obj.lng = this.mobileDevice.LanLat[0]
                              obj.lat = this.mobileDevice.LanLat[1]
                              obj.count =
                                res.data[key] === null
                                  ? 0
                                  : res.data[key].DECIBEL * 1
                              this.mobileDevice.heartData = obj
                              // this.heartData.push(obj)
                            } else {
                              obj.lng = device.LanLat[0]
                              obj.lat = device.LanLat[1]
                              obj.count =
                                res.data[key] === null
                                  ? 0
                                  : res.data[key].DECIBEL * 1
                              obj.idx = this.fixedDeviceMap.get(key).idx
                              this.heartData.push(obj)
                            }
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
                          this.heatmap.setDataSet({
                            data: arr
                          })
                        })
                        .catch((err) => {
                          console.log(err)
                        })
                    } */
                  }
                }
                this.updateListFlag = false
              })
              .catch((err) => {
                console.log(err)
              })
          }
        }, 2700)
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
          display: flex;
          flex-direction: column;
          .top{
            background: #08304A;
            height: 35px;
            line-height: 35px;
            color: $color;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            box-sizing: border-box;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
          }
          .bottom{
            flex: 1;
            background: #7f7f7f;
          }
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
        }
        .bottom{
          height: 100%;
          display: flex;
          flex-direction: column;
          .el-row{
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
            background: bisque;
          }
        }
      }
    }
  }
}
</style>
