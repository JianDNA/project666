// 这个js文件用于专门管理请求各种地址接口的
import Network from './netWork'

// 默认获取20条最新的数据
export const getTodayVoice = (query) => Network.get('todayVoice', query)
