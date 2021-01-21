<template>
  <div id="wrapper" ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import IScroll from 'iscroll/build/iscroll-probe'
// import IScroll from '../util/iscroll-probe'
export default {
  name: 'ScrollView',
  mounted () {
    this.iscroll = new IScroll(this.$refs.wrapper, {
      mouseWheel: true,
      scrollbars: true,
      probeType: 3,
      // 解决拖拽卡顿问题
      scrollX: false,
      scrollY: true,
      disablePointer: false,
      disableTouch: false,
      disableMouse: true,
      // preventDefault: false,
      // preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/ },
      click: true
    })
    // 创建观察者对象
    /*
      MutationObserver的构造函数只要监听到了指定结点的内容发生变化,就会执行传入的回调函数
      mutationList: 发生变化的数组
      observer: 观察者对象
       */
    const observer = new MutationObserver((mutationList, observer) => {
      // console.log(mutationList)
      // console.log(this.iscroll.maxScrollY)
      this.iscroll.refresh()
      // console.log(this.iscroll.maxScrollY)
    })
    // 告诉观察者对象需要观察什么
    const config = {
      childList: true, // 观察目标子节点的变化，是否有添加或者删除
      attributes: true, // 观察属性变动
      subtree: true, // 观察后代节点，默认为 false
      attributeFilter: ['height', 'offsetHeight'] // 观察特点属性
    }
    // 告诉观察者对象需要观察谁,需要观察什么内容
    /*
      第一个参数:观察者对象需要观察谁
      第二个参数:观察者对象需要观察什么内容
       */
    observer.observe(this.$refs.wrapper, config)
  },
  methods: {
    // 提供一个滚动监听的函数给外界使用
    scrolling (fn) {
      this.iscroll.on('scroll', function () {
        fn(this.y, this)
      })
    },
    refresh () {
      setTimeout(() => {
        this.iscroll.refresh()
        console.log('刷新Iscroll', this.iscroll.maxScrollY)
      }, 100)
    },
    scrollTo (x, y, time) {
      this.iscroll.scrollTo(x, y, time)
    },
    release (fn) {
      this.iscroll.on('scrollEnd', function () {
        fn(this)
      })
    },
    getScroll (fn) {
      fn(this.iscroll)
    },
    synchronizeRefresh (fn) {
      this.iscroll.refresh()
      setTimeout(() => {
        fn(this.iscroll)
      }, 1)
    }
  }
}

</script>

<style scoped>
#wrapper{
  width: 100%;
  height: 100%;
}
</style>
