import XmlViewerModal from './XmlViewerModal.vue'

export function xmlViewerModal (Vue, vuetify) {
  return {
    open(element, saveCallback) {
      var ComponentClass = Vue.extend(XmlViewerModal)
      var instance = new ComponentClass({
        vuetify,
        propsData: {
          element,
        }
      });
      instance.$mount()

      instance.$on('close', () => {
        instance.close()
        setTimeout(() => {
          instance.$destroy()
        }, 500);
      });

      instance.$on('saveElement', (el) => {
        saveCallback(el)
      });
      document.body.appendChild(instance.$el)
    },
  }
}

