<template>
  <v-app>
    <v-app-bar
      app
      clipped-right
      fixed
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
        v-if="xmlDoc"
        class="px-2"
        @click="saveSchema"
      >
        Save
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer
      app
      permanent
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
        v-if="elementInEditor"
        :element="elementInEditor"
        :key="getElementKey(elementInEditor)"
        @close="elementInEditor = null"
        @open-editor="openEditor"
      />
      <OpenSchemaModal
        :opened="openSchemaDialog"
        @close="openSchemaDialog = false"
        @openFromServer="openFromServer"
        @openFromLocal="openFromLocal"
      />
      <SaveSchemaModal
        :opened="saveSchemaDialog"
        :loadedFromServer="editMode === 'server'"
        @close="saveSchemaDialog = false"
        @saveToLocal="saveSchemaToLocalFile"
        @saveToServer="saveSchemaToServer"
      />
      <HasChangesModal
        :opened="confirmationDialog"
        @cancel="cancelConfirmation"
        @continue="confirm"
      />
      <CatalogSelectionModal
        :opened="catalogSelectionDialog"
        :serverAddress="serverUrl"
        @cancel="discardCatalogSelection"
        @selectCatalog="selectCatalog"
      />
    </v-main>
  </v-app>
</template>

<script>
import ElementTree from './components/ElementTree.vue'
import XmlElementEditor from './components/XmlElementEditor.vue'
import xmlDescriptionMixin from './mixins/xmlDescriptionMixin'
import description from '../public/Mondrian.xml'
import { parseXmlModel } from './utils/xmlModelParser'
import { fetchSchemaForCatalog, saveSchemaToCatalog } from './services/XmlaApi'
import HasChangesModal from './components/Modals/HasChangesModal.vue'
import OpenSchemaModal from './components/Modals/OpenSchemaModal.vue'
import SaveSchemaModal from './components/Modals/SaveSchemaModal.vue'
import CatalogSelectionModal from './components/Modals/CatalogSelectionModal.vue'
import { createXPathFromElement } from './utils/xmlModelParser'

export default {
  name: 'App',
  title: 'Schema Editor',

  components: {
    ElementTree,
    XmlElementEditor,
    HasChangesModal,
    OpenSchemaModal,
    CatalogSelectionModal,
    SaveSchemaModal,
  },

  mixins: [
    xmlDescriptionMixin
  ],

  data: () => ({
    // Xml documend props
    xmlDoc: null,
    updateTimestamp: Date.now(),
    // Element editor props
    elementInEditor: null,
    // Edit mode tmp vars
    selectedCatalog: null,
    serverUrl: null,
    editMode: null,
    // Confirmation logic
    lastSaveSchema: null,
    confirmationDialog: false,
    pendingConfirmationResolveFunction: null,
    // Open schema dialog
    openSchemaDialog: false,
    // Catalog selection logic
    catalogSelectionDialog: false,
    pendingCatalogSelectionResolveFunction: null,
    // Save schema dialog
    saveSchemaDialog: false,
  }),

  mounted() {
    console.log('Server for demo purposes:')
    console.log('https://ssemenkoff.dev/emondrian/xmla')

    this.$root.$on('modelChanged', () => {
      this.updateTimestamp = Date.now()
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
      if (!this.xmlDoc) return false;
      
      const serializer = new XMLSerializer
      const schema = serializer.serializeToString(this.xmlDoc)

      if (schema !== this.lastSaveSchema) {
        return true
      }
      return false
    },
  },

  methods: {
    // General methods
    getElementKey(el) {
      const xPath = createXPathFromElement(el, this.xmlDoc)
      return xPath
    },
    async openEditor(payload) {
      const { element } = payload

      this.elementInEditor = element
      await this.$nextTick();
      this.$refs.elementTree.updateEditorState(element)
    },
    // Confirmation dialog
    confirm() {
      this.pendingConfirmationResolveFunction({ confirmed: true })
      this.pendingConfirmationResolveFunction = null
    },
    cancelConfirmation() {
      this.pendingConfirmationResolveFunction({ confirmed: false })
      this.pendingConfirmationResolveFunction = null
    },
    async checkChanges() {
      if (this.schemaChanged) {
        const confirmationPromise = new Promise((res) => {
          this.pendingConfirmationResolveFunction = res
        })

        this.confirmationDialog = true
        const result = await confirmationPromise
        this.confirmationDialog = false

        return result
      }
      return  {
        confirmed: true
      }
    },
    // Catalog selection dialog
    discardCatalogSelection() {
      this.pendingCatalogSelectionResolveFunction({ status: 'cancelled', catalog: null })
    },
    selectCatalog(catalog) {
      this.pendingCatalogSelectionResolveFunction({ status: 'success', catalog: catalog })
    },
    async getCatalog(serverAddress) {
      this.serverUrl = serverAddress
      this.catalogSelectionDialog = true

      const catalogSelectionPromise = new Promise((res) => {
        this.pendingCatalogSelectionResolveFunction = res
      })
      
      const result = await catalogSelectionPromise
      this.catalogSelectionDialog = false
      return result
    },
    // New schema functionality
    async createNewSchema() {
      const { confirmed } = await this.checkChanges()
      if (!confirmed) return

      const xmlDoc = document.implementation.createDocument(null, "Schema")
      this.xmlDoc = xmlDoc
  
      this.editMode = 'new'

      this.elementInEditor = null
      await this.$nextTick();
      this.$refs.elementTree.updateEditorState(null)
    },
    // Open schema functionality
    async openSchema() {
      const { confirmed } = await this.checkChanges()
      if (!confirmed) return

      this.openSchemaDialog = true
    },
    async openFromLocal(schemaFile) {
      const xmlContent = await schemaFile.text()
      const parser = new DOMParser()

      this.xmlDoc = parser.parseFromString(xmlContent, "text/xml")
      this.editMode = 'local'

      this.lastSaveSchema = xmlContent
    },
    async openFromServer(serverAddress) {
      const { status, catalog } = await this.getCatalog(serverAddress)
      if (status === 'success') {        
        this.editMode = 'server'
        this.selectedCatalog = catalog
        const metadata = await fetchSchemaForCatalog(serverAddress, catalog.name)
        const schema = metadata.querySelector('row > METADATA').childNodes[0]
        const parser = new DOMParser()
        this.xmlDoc = parser.parseFromString(schema.wholeText, "text/xml")
        this.catalogSelectionDialog = false

        this.lastSaveSchema = schema.wholeText
      }
    },
    // Save schema functionality
    async saveSchema() {
      this.saveSchemaDialog = true
    },
    async saveSchemaToServer(serverAddress) {
      let serverUrl = this.serverUrl
      let catalogName = this.selectedCatalog.name
      if (serverAddress) {
        serverUrl = serverAddress
        const { status, catalog } = await this.getCatalog(serverAddress)

        if (status === 'success') {
          catalogName = catalog.name
        } else {
          return
        }
      }

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

      await saveSchemaToCatalog(serverUrl, catalogName, schemaEncoded)
      this.lastSaveSchema = schema
    },
    async saveSchemaToLocalFile() {
      const serializer = new XMLSerializer
      const text = serializer.serializeToString(this.xmlDoc)

      var blob = new Blob([text], { type: 'text/xml' });

      const tempLink = document.createElement('a');
      tempLink.download = 'schema';
      tempLink.href = URL.createObjectURL(blob);
      tempLink.dataset.downloadurl = ['text/xml', tempLink.download, tempLink.href].join(':');
      tempLink.style.display = "none";
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      setTimeout(function() { URL.revokeObjectURL(tempLink.href); }, 1500);

      this.lastSaveSchema = text
    }
  }
};
</script>
