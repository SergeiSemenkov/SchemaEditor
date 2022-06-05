import Vue from 'vue'
import Vuex from 'vuex'
import SchemaEditor from './modules/SchemaEditor'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    SchemaEditor,
  },
})