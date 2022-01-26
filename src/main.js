import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import titleMixin from './mixins/titleMixin'

Vue.config.productionTip = false
Vue.mixin(titleMixin)

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
