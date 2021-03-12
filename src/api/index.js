// 这个js文件用于专门管理请求各种地址接口的
import Network from './netWork'

// 默认获取20条最新的
export const getTodayVoice = (query) => Network.get('todayVoice', query)

export const getMobile = (imei) => Network.get('mobile', imei)

export const getFixedDevice = () => Network.get('fixedDevice')

export const getTodayCount = () => Network.get('todayCount')

export const getVoice = (query) => Network.get('queryVoice', query)

export const getNewVoice = (time, imei) => Network.get('getNewVoice', { time: time, imei: imei })

export const getNewVoiceByImei = (imei) => Network.get('getNewVoiceByImei', { imei: imei })

export const getHeatmapData = (imei) => Network.post('getHeatmapData', { imei: imei })

export const getAllMobile = () => Network.get('allMobile')

export const getTableData = (query) => Network.get('tableData', query)
