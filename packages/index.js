// 总的 index， 全局注册，使用时 可以全局引入，和element-ui的两种方式一样
import uTable from './u-table';
const components = [
  uTable
]
const install = function(Vue) {
  components.forEach(component => {
    Vue.component(component.name, component);
  });
}
if (typeof window !== 'undefined' &&  window.Vue) {
  install(window.Vue);
}
export default {
  install,
  uTable
}

