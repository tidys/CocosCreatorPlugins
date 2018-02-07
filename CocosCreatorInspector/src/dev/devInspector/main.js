import Vue from 'vue';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue';

import ui_prop from './ui/ui-prop.vue'
import NodeBaseProperty from './ccType/NodeBaseProperty.vue'
import SceneProperty from './ccType/SceneProperty.vue'
import ComponentsProperty from './ccType/ComponentsProperty'
import ColorPicker from './ui/colorPicker'


Vue.component('ui-prop', ui_prop);
Vue.component('NodeBaseProperty', NodeBaseProperty);
Vue.component('SceneProperty', SceneProperty);
Vue.component('ComponentsProperty', ComponentsProperty);
Vue.component('ColorPicker', ColorPicker);

Vue.use(ElementUI);
new Vue({
  el: '#app',
  render: h => h(App)
});
