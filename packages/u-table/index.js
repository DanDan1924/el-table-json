// 注册单独的组件，方便使用时可以单独引用
import uTable from './src/u-table.vue';
uTable.install = function (Vue) {
  Vue.component(uTable.name, uTable)
}
export default uTable