import Vue from 'vue'
import App from './AppRefactored.vue'
import vuetify from './plugins/vuetify'
import titleMixin from './mixins/titleMixin'
import store from './store'
import Modals from './plugins/modals'

Vue.config.productionTip = false
Vue.mixin(titleMixin)
Vue.use(Modals)

new Vue({
  vuetify,
  render: h => h(App),
  store,
}).$mount('#app')
