<template>
  <v-app>
    <v-app-bar
      app
      clipped-right
      absolute
      color="primary"
      dark
    >
      <v-toolbar-title>eMondrian schema editor</v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="xmlDoc"
        @click="downloadSchema"
      >
        Download schema file
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer
      app
      permanent
      width="500"
      v-if="xmlDoc"
    >
      <element-tree
        :xmlDoc="xmlDoc"
        :timestamp="updateTimestamp"
        @open-editor="openEditor"
      />
    </v-navigation-drawer>
    <v-main>
      <template v-if="!xmlDoc">
        <v-row>
          <v-col cols=6 offset=3 class="mt-6">
            <v-card>
              <v-card-title>
                Upload a schema file
              </v-card-title>
              <v-file-input
                v-model="schemaFile"
                class="mx-4"
                accept=".xml"
                label="Select schema"
              ></v-file-input>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn
                  text
                  color="primary"
                  class="ml-2"
                  @click="loadSchemaFile"
                >
                  Continue
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col> 
        </v-row>
      </template>
      <xml-element-editor
        v-else-if="elementInEditor"
        :element="elementInEditor"
        :key="elementInEditor.tagName + elementInEditor.getAttribute('name')"
        :elementRequired="elementInEditorRequired"
        :parentDesctiption="elementInEditorParentDescription"
        @close="elementInEditor = null"
        @open-editor="openEditor"
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

export default {
  name: 'App',

  components: {
    ElementTree,
    XmlElementEditor,
  },

  mixins: [
    xmlDescriptionMixin
  ],

  data: () => ({
    xmlDoc: null,
    updateTimestamp: Date.now(),
    elementInEditor: null,
    elementInEditorRequired: null,
    stepperValue: 1,
    descriptionFile: null,
    schemaFile: null,
  }),

  mounted() {
    this.$root.$on('modelChanged', () => {
      this.updateTimestamp = Date.now()
    })

    const xmlModelContent = description
    const parser = new DOMParser()
  
    const modelDoc = parser.parseFromString(xmlModelContent, "text/xml")
    const jsModel = parseXmlModel(modelDoc)
    this.loadDescription(jsModel)
  },

  methods: {
    async loadSchemaFile() {
      if (!this.schemaFile) return;
      const xmlContent = await this.schemaFile.text()
      const parser = new DOMParser()

      this.xmlDoc = parser.parseFromString(xmlContent, "text/xml")
    },
    openEditor(payload) {
      const { element, required, parentDescription } = payload
      this.elementInEditor = element
      this.elementInEditorRequired = required
      this.elementInEditorParentDescription = parentDescription
    },
    downloadSchema() {
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
    }
  }
};
</script>
