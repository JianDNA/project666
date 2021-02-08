export default {
  key: 'caa2acefc0d3e54f94aaa0de7c37c31a', // 申请好的Web端开发者Key，首次调用 load 时必填
  version: '1.4.15', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
  // version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
  plugins: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor', 'AMap.MoveAnimation',
    'AMap.Geolocation', 'AMap.HeatMap'], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  AMapUI: { // 是否加载 AMapUI，缺省不加载
    version: '1.1', // AMapUI 缺省 1.1
    plugins: [] // 需要加载的 AMapUI ui插件
  }
}
