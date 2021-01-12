<template>
  <div class="home">
    <el-container>
      <el-header height="80px">
        <div class="left">
          <img src="../assets/images/logo.jpg" alt="">
          <img src="../assets/images/logo2.jpg" alt="">
          <span class="title">噪音实时监控平台</span>
          <span class="today">今日事件数： <span class="count">31828</span></span>
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
            <div class="box"></div>
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
export default {
  name: 'Home',
  components: {
  },
  data () {
    return {
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
      events: ['全部', '玻璃破碎声', '尖叫声', '汽车鸣笛声', '爆炸声', '背景噪声', '鞭炮声', '其他']
    }
  },
  methods: {
    query () {
      this.drawer = true
    }
  },
  created () {
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
      })
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
            background: #ccc;
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
