import PasteModal from './PasteModal.vue'

export function pasteModal (Vue, vuetify) {
  return {
    open() {
      let resolveFunction = null;
      const confirmationPromise = new Promise((res) => {
        resolveFunction = res
      })

      var ComponentClass = Vue.extend(PasteModal)
      var instance = new ComponentClass({
        vuetify,
      });
      instance.$mount()

      instance.$on('close', () => {
        resolveFunction({ status: 'cancelled' })
        instance.close()
        setTimeout(() => {
          instance.$destroy()
        }, 500);
      });

      instance.$on('paste', (xml) => {
        resolveFunction({ status: 'success', xml })
        instance.close()
        setTimeout(() => {
          instance.$destroy()
        }, 500);
      });
      document.body.appendChild(instance.$el)
      
      return confirmationPromise
    },
  }
}
