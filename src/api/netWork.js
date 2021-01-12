import axios from 'axios'
// 进行全局配置
// axios.defaults.baseURL = 'http://192.168.6.64:7001'
axios.defaults.baseURL = 'http://127.0.0.1:7001'
// 设置超时时间
axios.defaults.timeout = 30000
// 设置发送请求允许携带cookie
axios.defaults.withCredentials = true

axios.defaults.headers.post['Content-Type'] = 'application/json'

// 封装自己的get/post请求方法

export default {
  get: function (path = '', data = {}) {
    return new Promise(function (resolve, reject) {
      axios.get(path, {
        params: data
      })
        .then(function (response) {
          // console.log(response);
          resolve(response.data)
        })
        .catch(function (error) {
          // console.log(error);
          reject(error)
        })
    })
  },
  post: function (path = '', data = {}) {
    return new Promise(function (resolve, reject) {
      axios.post(path, data, { withCredentials: true })
        .then(function (response) {
          // console.log(response);
          resolve(response.data)
        })
        .catch(function (error) {
          // console.log(error);
          reject(error)
        })
    })
  },
  all: function (list) {
    return new Promise(function (resolve, reject) {
      axios.all(list)
        .then(axios.spread(function (...res) {
          // 两个请求现在都执行完成
          resolve(res)
        }))
        .catch(function (err) {
          reject(err)
        })
    })
  }
}
