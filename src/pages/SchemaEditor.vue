<template>
  <v-app>
    <v-app-bar
      app
      clipped-left
      color="primary"
      dark
    >
      <v-toolbar-title>eMondrian schema editor</v-toolbar-title>
      <v-spacer />
      <v-btn
        @click="createNewSchema"
        class="mx-2"
      >
        New
      </v-btn>
      <v-btn
        class="mx-2"
        @click="openSchema"
      >
        Open
      </v-btn>
      <v-btn
        v-show="xmlDoc"
        class="mx-2"
        id="save-menu-activator"
      >
        Save
      </v-btn>
      <v-menu
        activator="#save-menu-activator"
        :offset-y="true"
      >
        <v-list>
          <v-list-item @click="saveToSamePlace" :disabled="!canSave">
            <v-list-item-title>Save</v-list-item-title>
          </v-list-item>
          <v-list-item @click="saveToAnotherServer">
            <v-list-item-title>Save to another server</v-list-item-title>
          </v-list-item>
          <v-list-item @click="exportToXml">
            <v-list-item-title>Export to xml</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        v-if="xmlDoc"
        class="mx-2"
        @click="openSchemaValidationModal"
      >
        Validate
      </v-btn>
      <v-btn
        v-if="xmlDoc"
        :disabled="!canUndo"
        @click="undo"
        class="mx-2"
      >
        Undo
      </v-btn>
      <v-btn
        v-if="xmlDoc"
        :disabled="!canRedo"
        @click="redo"
        class="mx-2"
      >
        Redo
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer
      app
      permanent
      clipped
      width="500"
      v-if="xmlDoc"
    >
      <element-tree
        ref="elementTree"
        :xmlDoc="xmlDoc"
        :timestamp="updateTimestamp"
        @open-editor="openEditor"
      />
    </v-navigation-drawer>
    <v-main>
      <xml-element-editor
        ref="editor"
        v-if="elementInEditor"
        :xmlDoc="xmlDoc"
        :element="elementInEditor"
        :key="`${getElementKey(elementInEditor)}_${updateTimestamp}`"
        @close="elementInEditor = null"
        @open-editor="openEditor"
      />
    </v-main>
  </v-app>
</template>

<script>
import ElementTree from '../components/ElementTree.vue'
import XmlElementEditor from '../components/XmlElementEditor.vue'
import xmlDescriptionMixin from '../mixins/xmlDescriptionMixin'
import description from '../../public/Mondrian.xml'
import { parseXmlModel } from '../utils/xmlModelParser'
import { fetchSchemaForCatalog, saveSchemaToCatalog } from '../services/XmlaApi'
import { createXPathFromElement } from '../utils/xPath'
import { saveToXmlFile } from '../utils'

export default {
  name: 'App',
  title: 'Schema Editor',

  components: {
    ElementTree,
    XmlElementEditor,
  },

  mixins: [
    xmlDescriptionMixin
  ],

  data: () => ({
    // Edit mode tmp vars
    selectedCatalog: null,
    editMode: null,
    // Schema verification modal
    schemaValidationDialog: false,
  }),

  mounted() {
    console.warn('Server for demo purposes:')
    console.warn('https://ssemenkoff.dev/emondrian/xmla')

    this.$root.$on('errorMessage', (e) => {
      this.$errorModal.open(e)
    })

    this.$root.$on('removeItem', async (e) => {
      const { confirmed } = await this.$deleteConfirmationModal.open()

      if (confirmed) {
        this.removeElement(e)
      }
    })

    const xmlModelContent = description
    const parser = new DOMParser()
  
    const modelDoc = parser.parseFromString(xmlModelContent, "text/xml")
    const jsModel = parseXmlModel(modelDoc)
    this.loadDescription(jsModel)

    window.onbeforeunload = () => {
      return this.schemaChanged || null;
    };
  },

  computed: {
    schemaChanged() {
      return this.$store.getters['SchemaEditor/hasChanges']
    },
    xmlDoc() {
      return this.$store.getters['SchemaEditor/xmlDoc']
    },
    serverUrl() {
      return this.$store.getters['SchemaEditor/serverUrl']
    },
    updateTimestamp() {
      return this.$store.getters['SchemaEditor/updateTimestamp']
    },
    elementInEditor() {
      return this.$store.getters['SchemaEditor/openedElement']
    },
    canSave() {
      return this.$store.getters['SchemaEditor/canSave']
    },
    canUndo() {
      return this.$store.getters['SchemaEditor/canUndo']
    },
    canRedo() {
      return this.$store.getters['SchemaEditor/canRedo']
    }
  },

  methods: {
    // General methods
    getElementKey(el) {
      const xPath = createXPathFromElement(el, this.xmlDoc)
      return xPath
    },
    async openEditor({ element, attribute }) {
      this.$store.dispatch('SchemaEditor/openEditor', { element, attribute });  
    },
    async checkChanges() {
      return this.schemaChanged
        ? this.$confirmationModal.open()
        : { confirmed: true }
    },
    // New schema functionality
    async createNewSchema() {
      const { confirmed } = await this.checkChanges()
      if (!confirmed) return

      this.$store.dispatch('SchemaEditor/createNewSchema');  
      this.$store.dispatch('SchemaEditor/closeEditor');
    },
    // Open schema functionality
    async openSchema() {
      const { confirmed } = await this.checkChanges()
      if (!confirmed) return

      const result = await this.$openSchemaModal.open()

      if (result.status !== 'success') return
      if (result.mode === 'local') this.openFromLocal(result.schemaFile)
      if (result.mode === 'server') this.openFromServer(result.serverAddress)
    },
    async openFromLocal(schemaFile) {
      const xmlContent = await schemaFile.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml")

      this.$store.dispatch('SchemaEditor/openSchema', { xmlDoc });
      this.$store.dispatch('SchemaEditor/closeEditor'); 
    },
    async openFromServer(serverUrl) {
      this.$store.dispatch('SchemaEditor/setServerUrl', { serverUrl })
      const { status, catalog } = await this.$catalogSelectionModal.open(serverUrl)

      if (status === 'success') {     
        this.$store.dispatch('SchemaEditor/setDatabase', { databaseName: catalog.name})
        try {
          const metadata = await fetchSchemaForCatalog(serverUrl, catalog.name)

          const isErrorResponce = metadata.querySelector('Fault')
          if (isErrorResponce) {
            const error = isErrorResponce.querySelector('detail > Error')
            const errorMessage = error.getAttribute('Description')
            const errorCode = error.getAttribute('ErrorCode')
            throw new Error(`<b class="text-h6">Server returned error responce</b><br><b>Error code:</b> ${errorCode}<br><b>Error message:</b> ${errorMessage}`)
          }

          const schema = metadata.querySelector('row > METADATA').childNodes[0].wholeText
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(schema, "text/xml")
          this.$store.dispatch('SchemaEditor/setInitialSchemaState', { schema, serverUrl, catalogName: catalog.name })
          this.$store.dispatch('SchemaEditor/openSchema', { xmlDoc })
          this.$store.dispatch('SchemaEditor/closeEditor'); 
        } catch (e) {
          if (e.message) {
            this.$errorModal.open(e.message)
          } else {
            this.$errorModal.open('<b class="text-h6">Unable to load schema from the provided server</b>')
          }
        }
      }
    },
    // Save schema functionality
    async exportToXml() {
      const serializer = new XMLSerializer
      const text = serializer.serializeToString(this.xmlDoc)
      saveToXmlFile(text)

      this.$store.dispatch('SchemaEditor/setLastSavedSchema', { serializedSchema: text })
    },
    async saveToSamePlace() {
      const { serverUrl, catalogName } = this.$store.getters['SchemaEditor/loadedFrom']
      await this.saveSchemaToServer(serverUrl, catalogName);
    },
    async saveToAnotherServer() {
      const serverSelectionResponce = await this.$serverSelectionModal.open()
      if (serverSelectionResponce.status !== 'success') return
      const { serverUrl } = serverSelectionResponce
      
      let { status, catalog } = await this.$catalogSelectionModal.open(serverUrl)
      if (status !== 'success') return

      await this.saveSchemaToServer(serverUrl, catalog.name)
    },
    async saveSchemaToServer(serverUrl, catalogName) {
      const serializer = new XMLSerializer
      const schema = serializer.serializeToString(this.xmlDoc)

      const schemaEncoded = schema
        .replaceAll('&', '&#38;')
        .replaceAll('<', '&#60;')
        .replaceAll('>', '&#62;')
        .replaceAll('"', '&#34;')
        .replaceAll('\'', '&#39;')
        .replaceAll('\t', '&#9;')
        .replaceAll('\n', '&#10;')
        .replaceAll('\r', '&#13;')
      try {
        const initialSchemaState = this.$store.getters['SchemaEditor/initialSchemaState']
        const metadata = await fetchSchemaForCatalog(serverUrl, catalogName)

        let isErrorResponce = metadata.querySelector('Fault')
        if (isErrorResponce) {
          const error = isErrorResponce.querySelector('detail > Error')
          const errorMessage = error.getAttribute('Description')
          const errorCode = error.getAttribute('ErrorCode')
          throw new Error(`<b class="text-h6">Error while saving schema occured</b><br><b>Error code:</b> ${errorCode}<br><b>Error message:</b> ${errorMessage}`)
        }
        const schemaOnServer = metadata.querySelector('row > METADATA').childNodes[0].wholeText

        if (initialSchemaState.serverUrl === serverUrl
         && initialSchemaState.catalogName === catalogName
         && initialSchemaState.schema !== schemaOnServer
        ) {
          const { confirmed } = await this.$confirmationModal.open('Schema was modified while you were working on it. Do you want to override currently saved one with your changes?')
          if (!confirmed) return;
        }
        
        const saveResponce = await saveSchemaToCatalog(serverUrl, catalogName, schemaEncoded)

        isErrorResponce = saveResponce.querySelector('Fault')
        if (isErrorResponce) {
          const error = isErrorResponce.querySelector('detail > Error')
          const errorMessage = error.getAttribute('Description')
          const errorCode = error.getAttribute('ErrorCode')
          throw new Error(`<b class="text-h6">Server returned error responce</b><br><b>Error code:</b> ${errorCode}<br><b>Error message:</b> ${errorMessage}`)
        }

        const successResponce = saveResponce.querySelector('ExecuteResponse')
        if (successResponce) {
          if (initialSchemaState.serverUrl === serverUrl
            && initialSchemaState.catalogName === catalogName
            && initialSchemaState.schema !== schemaOnServer
          ) {
            const updatedMetadata = await fetchSchemaForCatalog(serverUrl, catalogName)
            isErrorResponce = saveResponce.querySelector('Fault')
            if (isErrorResponce) {
              const error = isErrorResponce.querySelector('detail > Error')
              const errorMessage = error.getAttribute('Description')
              const errorCode = error.getAttribute('ErrorCode')
              throw new Error(`<b class="text-h6">Error while saving schema occured</b><br><b>Error code:</b> ${errorCode}<br><b>Error message:</b> ${errorMessage}`)
            }
            const updatedSchema = updatedMetadata.querySelector('row > METADATA').childNodes[0].wholeText
            this.$store.dispatch('SchemaEditor/setInitialSchemaState', { schema: updatedSchema, serverUrl, catalogName })
          }

          this.$successModal.open(`<b class="text-h6">Schema was succesfully saved</b>`)
        } else {
          throw new Error('<b class="text-h6">Something went wrong while saving schema to the server</b>')
        }
      } catch (e) {
        if (e.message) {
          this.$errorModal.open(e.message)
        } else {
          this.$errorModal.open('<b class="text-h6">Unable to save schema to the provided server</b>')
        }
      }
      
      this.$store.dispatch('SchemaEditor/setLastSavedSchema', { serializedSchema: schema })
    },
    // Remove item functionality
    removeElement(el) {
      el.parentNode.removeChild(el)
      this.$store.dispatch('SchemaEditor/updateModel', { element: this.element, action: 'delete' })

      if (el === this.elementInEditor) {
        this.$store.dispatch('SchemaEditor/closeEditor');
      }
    },
    async openSchemaValidationModal() {
      const validationState = this.$store.getters['SchemaEditor/validationState']
      const { errorList, element, attribute } = await this.$schemaValidationModal.open(this.xmlDoc, validationState)

      this.$store.dispatch('SchemaEditor/setValidationState', { errorList })
      if (element) {
        this.$store.dispatch('SchemaEditor/openEditor', { element, attribute })
      }
    },
    undo() {
      this.$store.dispatch('SchemaEditor/undo')
    },
    redo() {
      this.$store.dispatch('SchemaEditor/redo')
    }
  }
};
</script>
