<template>
  <div class="chart_container">
    <div class="top">
      <el-select v-model="query.deviceValue" placeholder="设备选择" style="width: 150px" @change="change">
        <el-option
          v-for="item in deviceList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
      <el-select v-model="query.eventType" placeholder="事件类型" style="width: 120px" @change="change">
        <el-option
          v-for="value in events"
          :key="value"
          :label="value"
          :value="value">
        </el-option>
      </el-select>
      <el-select v-model="query.showType" placeholder="展示方式" style="width: 120px" @change="change">
        <el-option
          v-for="value in types"
          :key="value"
          :label="value"
          :value="value">
        </el-option>
      </el-select>
      <h5>区域噪声统计</h5>
      <el-date-picker
        @blur="change"
        v-model="time"
        type="date"
        placeholder="选择日期">
      </el-date-picker>
    </div>
    <div class="bottom">
      <div id="chart"></div>
    </div>
  </div>
</template>

<script>
import { formatTime } from '../util/tool'
import { getTableData } from '../api/index'
import { Message } from 'element-ui'
export default {
  name: 'Chart',
  props: {
    mobileDevice: Array,
    fixedDevice: Array
  },
  computed: {
    deviceList: function () {
      const arr = [{ id: -1, type: 'all', name: '全部设备' }]
      this.fixedDevice.forEach(item => {
        arr.push({ id: item.IMEI, type: 'fix', name: item.NAME })
      })
      arr.push(...this.mobileDevice)
      return arr
    }
  },
  data () {
    return {
      chart: null,
      time: '',
      events: ['全部事件', '玻璃破碎声', '尖叫声', '汽车鸣笛声', '爆炸声', '背景噪声', '鞭炮声', '其他'],
      types: ['事件数量', '电平分布'],
      query: {
        deviceValue: -1,
        eventType: '全部事件',
        showType: '事件数量'
      },
      eventOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter: '{c0}' + '次'
        },
        xAxis: {
          type: 'category',
          data: ['0-1', '1-2', '2-3', '3-4', '5-6', '7-8', '8-9', '9-10', '10-11', '11-12', '12-13', '13-14', '14-15', '15-16', '16-17', '17-18', '18-19', '19-20', '20-21', '21-22', '22-23', '23-0']
        },
        yAxis: {
          type: 'value',
          max: 400,
          min: 0,
          splitNumber: 5
        },
        grid: {
          left: '60',
          right: '20',
          top: '10',
          bottom: '25'
        },
        series: [{
          // data: [10, 20, 30, 40, 50, 60, 0, 70, 60, 40, 50, 80, 10, 20, 30, 40, 50, 60, 0, 70, 60, 40, 50, 80],
          data: new Array(24).fill(0),
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        }]
      },
      valOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'line' // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter: '{c0}' + '分贝'
        },
        xAxis: {
          type: 'category',
          data: ['0-1', '1-2', '2-3', '3-4', '5-6', '7-8', '8-9', '9-10', '10-11', '11-12', '12-13', '13-14', '14-15', '15-16', '16-17', '17-18', '18-19', '19-20', '20-21', '21-22', '22-23', '23-0']
        },
        yAxis: {
          type: 'value',
          max: 100,
          min: 0,
          splitNumber: 5
        },
        grid: {
          left: '60',
          right: '20',
          top: '10',
          bottom: '25'
        },
        series: [{
          data: new Array(24).fill(0),
          type: 'line',
          smooth: true
        }]
      }
    }
  },
  created () {
    console.log(this.mobileMap)
    this.time = new Date(formatTime(Date.now(), 'YYYY/MM/DD'))
  },
  mounted () {
    console.log(this.mobileMap)
    const chartDom = document.getElementById('chart')
    const myChart = this.$echarts.init(chartDom)
    this.chart = myChart
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        },
        formatter: '{c0}' + '分贝'
      },
      xAxis: {
        type: 'category',
        data: ['0-1', '1-2', '2-3', '3-4', '5-6', '7-8', '8-9', '9-10', '10-11', '11-12', '12-13', '13-14', '14-15', '15-16', '16-17', '17-18', '18-19', '19-20', '20-21', '21-22', '22-23', '23-0']
      },
      yAxis: {
        type: 'value',
        max: 800,
        min: 0,
        splitNumber: 5
      },
      grid: {
        left: '60',
        right: '20',
        top: '10',
        bottom: '25'
      },
      series: [{
        // data: [10, 20, 30, 40, 50, 60, 0, 70, 60, 40, 50, 80, 10, 20, 30, 40, 50, 60, 0, 70, 60, 40, 50, 80],
        data: new Array(24).fill(0),
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      }]
    }
    const Today = formatTime(Date.now(), 'YYYY/MM/DD')
    const tableTime = new Date(Today).valueOf() / 1000
    option && myChart.setOption(this.eventOption)
    console.log(this.chart.getOption())
    // 设备 事件 展示类型(事件数量 or 噪音均值)
    // 设备分固定和移动,需要查出来
    // const device = this.deviceList.find((item) => {
    //   return item.id === this.query.deviceValue
    // })
    // this.query.deviceType = device.type
    this.query.tableTime = tableTime
    getTableData(this.query)
      .then(res => {
        console.log(res)
        const data = res.data.map(item => {
          return item || 0
        })
        const option = this.chart.getOption()
        option.series[0].data = data
        let max = Math.max(...data) / 100
        max = Math.ceil(max) * 100
        option.yAxis[0].max = max > 400 ? max : 400
        this.chart.setOption(option)
      })
      .catch(err => {
        Message({
          type: 'error',
          message: err.message
        })
      })
  },
  methods: {
    change () {
      const Today = formatTime(Date.now(), 'YYYY/MM/DD')
      const tableTime = new Date(Today).valueOf() / 1000
      if (this.time.getTime() / 1000 > tableTime) {
        Message({
          type: 'error',
          message: '请选择正确的时间'
        })
      } else {
        this.query.tableTime = this.time.getTime() / 1000
        let option = this.eventOption
        if (this.query.showType === '电平分布') {
          option = this.valOption
        }
        this.chart.setOption(option)
        getTableData(this.query)
          .then(res => {
            console.log(res)
            const data = res.data.map(item => {
              if (this.query.showType === '电平分布') item = item.toFixed(2)
              return item || 0
            })
            const option = this.chart.getOption()
            option.series[0].data = data
            let max = Math.max(...data) / 100
            max = Math.ceil(max) * 100
            option.yAxis[0].max = max > 400 ? max : 400
            if (this.query.showType === '电平分布') option.yAxis[0].max = 100
            this.chart.setOption(option)
          })
          .catch(err => {
            Message({
              type: 'error',
              message: err.message
            })
          })
      }
    }
  }
}
</script>

<style scoped lang="scss">
$color: #03FBF9;
.chart_container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .top{
    background: #08304A;
    height: 45px;
    line-height: 45px;
    box-sizing: border-box;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    position: relative;
    h5{
      padding: 0;
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      color: $color;
    }
    .el-date-editor{
      position: absolute;
      top: 0;
      right: 15px;
      opacity: 0.6;
    }
    .el-select{
      position: absolute;
      top: 0;
      left: 15px;
      opacity: .6;
      font-size: 14px;
      &:nth-of-type(2){
        left: 180px;
      }
      &:nth-of-type(3){
        left: 320px;
      }
    }
  }
  .bottom{
    flex: 1;
    #chart{
      width: 100%;
      height: 100%;
      background: #f8f8f5;
      flex: 1;
    }
    #lineChart{
      width: 100%;
      height: 100%;
      background: #f8f8f5;
      flex: 1;
    }
  }
}
</style>
