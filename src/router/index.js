import Vue from 'vue'
import VueRouter from 'vue-router'
// 实现Vue组件的按需加载
const Home = (resolve) => {
  import('../views/Home').then((module) => {
    resolve(module)
  })
}

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      keepAlive: true // 需要被缓存
    }
  }
]

const router = new VueRouter({
  routes
})

export default router
