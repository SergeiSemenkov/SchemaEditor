import vuetify from './vuetify'
import ConfirmationModal from '../components/Modals/ConfirmationModal.vue'
import ErrorModal from '../components/Modals/ErrorModal.vue'
import SuccessModal from '../components/Modals/SuccessModal.vue'
import CatalogSelectionModal from '../components/Modals/CatalogSelectionModal.vue'
import OpenSchemaModal from '../components/Modals/OpenSchemaModal.vue'
import DeleteConfirmationModal from '../components/Modals/DeleteConfirmationModal.vue'
import ServerSelectionModal from '../components/Modals/ServerSelectionModal.vue'
import SchemaValidationModal from '../components/Modals/SchemaValidationModal.vue'
import DiagramModal from '../components/Modals/DiagramModal.vue'
import { xmlViewerModal } from '../components/Modals/XmlViewerModal'
import { pasteModal } from '../components/Modals/PasteModal'
import LoadingModal from '../components/Modals/LoadingModal'

const Modals = {
  install(Vue) {
    Vue.prototype.$confirmationModal = {
      open(text) {
        let resolveFunction = null;
        const confirmationPromise = new Promise((res) => {
          resolveFunction = res
        })
        
        var ComponentClass = Vue.extend(ConfirmationModal)
        var instance = new ComponentClass({
          vuetify,
          propsData: {
            text,
          }
        });
        instance.$mount()

        instance.$on('cancel', () => {
          resolveFunction({ confirmed: false })
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        instance.$on('continue', () => {
          resolveFunction({ confirmed: true })
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        document.body.appendChild(instance.$el)

        return confirmationPromise
      },
    }

    Vue.prototype.$successModal = {
      open(message) {
        var ComponentClass = Vue.extend(SuccessModal)
        var instance = new ComponentClass({
          vuetify,
          propsData: {
            message,
          }
        });
        instance.$mount()

        instance.$on('close', () => {
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        document.body.appendChild(instance.$el)
      },
    }

    Vue.prototype.$errorModal = {
      open(message) {
        var ComponentClass = Vue.extend(ErrorModal)
        var instance = new ComponentClass({
          vuetify,
          propsData: {
            message,
          }
        });
        instance.$mount()

        instance.$on('close', () => {
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        document.body.appendChild(instance.$el)
      },
    }

    Vue.prototype.$catalogSelectionModal = {
      open(serverAddress) {
        let resolveFunction = null;
        const confirmationPromise = new Promise((res) => {
          resolveFunction = res
        })
        
        var ComponentClass = Vue.extend(CatalogSelectionModal)
        var instance = new ComponentClass({
          vuetify,
          propsData: {
            serverAddress,
          }
        });
        instance.$mount()

        instance.$on('cancel', () => {
          resolveFunction({ status: 'cancelled', catalog: null })
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        instance.$on('selectCatalog', (catalog) => {
          resolveFunction({ status: 'success', catalog })
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        })
        document.body.appendChild(instance.$el)
        return confirmationPromise
      },
    }

    Vue.prototype.$openSchemaModal = {
      open() {
        let resolveFunction = null;
        const confirmationPromise = new Promise((res) => {
          resolveFunction = res
        })
        
        var ComponentClass = Vue.extend(OpenSchemaModal)
        var instance = new ComponentClass({
          vuetify
        });
        instance.$mount()

        instance.$on('close', () => {
          resolveFunction({ status: 'cancelled', mode: null })
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        instance.$on('openFromServer', (serverAddress) => {
          resolveFunction({ status: 'success', mode: 'server', serverAddress })
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        })
        instance.$on('openFromLocal', (schemaFile) => {
          resolveFunction({ status: 'success', mode: 'local', schemaFile})
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        })
        
        document.body.appendChild(instance.$el)
        return confirmationPromise
      },
    }

    Vue.prototype.$deleteConfirmationModal = {
      open() {
        let resolveFunction = null;
        const confirmationPromise = new Promise((res) => {
          resolveFunction = res
        })
        
        var ComponentClass = Vue.extend(DeleteConfirmationModal)
        var instance = new ComponentClass({
          vuetify,
        });
        instance.$mount()

        instance.$on('close', () => {
          resolveFunction({ confirmed: false })
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        instance.$on('confirm', () => {
          resolveFunction({ confirmed: true })
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        document.body.appendChild(instance.$el)

        return confirmationPromise
      },
    }

    Vue.prototype.$serverSelectionModal = {
      open() {
        let resolveFunction = null;
        const confirmationPromise = new Promise((res) => {
          resolveFunction = res
        })
        
        var ComponentClass = Vue.extend(ServerSelectionModal)
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
        instance.$on('saveToServer', (serverUrl) => {
          resolveFunction({ status: 'success', serverUrl })
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        document.body.appendChild(instance.$el)

        return confirmationPromise
      },
    }

    Vue.prototype.$schemaValidationModal = {
      open(xmlDoc, errorList) {
        let resolveFunction = null;
        const confirmationPromise = new Promise((res) => {
          resolveFunction = res
        })
        
        var ComponentClass = Vue.extend(SchemaValidationModal)
        var instance = new ComponentClass({
          vuetify,
          propsData: {
            xmlDoc,
            errorListProvided: errorList, 
          }
        });
        instance.$mount()

        instance.$on('close', (state) => {
          resolveFunction(state)
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        document.body.appendChild(instance.$el)

        return confirmationPromise
      },
    }

    Vue.prototype.$diagramModal = {
      open(cube) {
        var ComponentClass = Vue.extend(DiagramModal)
        var instance = new ComponentClass({
          vuetify,
          propsData: {
            cube,
          }
        });
        instance.$mount()

        instance.$on('close', () => {
          instance.close()
          setTimeout(() => {
            instance.$destroy()
          }, 500);
        });
        document.body.appendChild(instance.$el)
      },
    }

    Vue.prototype.$loadingModal = {
      open() {
        var ComponentClass = Vue.extend(LoadingModal)
        var instance = new ComponentClass({
          vuetify,
        });
        instance.$mount()

        document.body.appendChild(instance.$el)
        return instance
      },
    }

    Vue.prototype.$xmlViewerModal = xmlViewerModal(Vue, vuetify);
    Vue.prototype.$pasteModal = pasteModal(Vue, vuetify);
  }
}

export default Modals