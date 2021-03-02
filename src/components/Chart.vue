<template>
  <div class="chart_container">
    <div class="top">
      <h5>区域噪声统计</h5>
      <el-date-picker
        @blur="change"
        v-model="time"
        type="date"
        placeholder="选择日期">
      </el-date-picker>
    </div>
    <div class="bottom">
      <div id="bottomChart"></div>
    </div>
  </div>
</template>

<script>
import { formatTime } from '../util/tool'
import { getTableData } from '../api/index'
import { Message } from 'element-ui'
export default {
  name: 'Chart',
  data () {
    return {
      chart: null,
      time: ''
    }
  },
  mounted () {
    const chartDom = document.getElementById('bottomChart')
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
        max: 120,
        min: 0,
        splitNumber: 5
      },
      grid: {
        left: '60',
        right: '20',
        top: '10',
        bottom: '20'
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
    option && myChart.setOption(option)
    getTableData(tableTime)
      .then(res => {
        console.log(res)
        const data = res.data.map(item => {
          return item || 0
        })
        const option = this.chart.getOption()
        option.series[0].data = data
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
        getTableData(this.time.getTime() / 1000)
          .then(res => {
            console.log(res)
            const data = res.data.map(item => {
              return item || 0
            })
            const option = this.chart.getOption()
            option.series[0].data = data
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
    height: 40px;
    line-height: 40px;
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
  }
  .bottom{
    flex: 1;
    #bottomChart{
      width: 100%;
      height: 100%;
      background: #f8f8f5;
      flex: 1;
    }
  }
}
</style>
