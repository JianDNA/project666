const formatTime = (date, format = 'YYYY-MM-DD hh:mm:ss') => {
  date = new Date(parseInt(date))
  const year = date.getFullYear()
  const month = formatNumber(date.getMonth() + 1)
  const day = formatNumber(date.getDate())
  const hour = formatNumber(date.getHours())
  const minute = formatNumber(date.getMinutes())
  const second = formatNumber(date.getSeconds())
  return format.replace('YYYY', year).replace('MM', month).replace('DD', day).replace('hh', hour).replace('mm', minute).replace('ss', second)
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getTodayClassTable = () => {
  const Today = formatTime(Date.now(), 'YYYY/MM/DD')
  const tableTime = new Date(Today).valueOf() / 1000
  const className = `clas${tableTime}s`
  return className
}
const debounce = (fn, delay) => {
  let timerId = null
  return function () {
    const self = this
    const args = arguments
    timerId && clearTimeout(timerId)
    timerId = setTimeout(function () {
      fn.apply(self, args)
    }, delay || 1000)
  }
}
module.exports = {
  formatTime,
  getTodayClassTable,
  debounce
}
