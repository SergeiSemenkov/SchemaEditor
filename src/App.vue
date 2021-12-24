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
      <v-btn @click="downloadSchema">Download schema file</v-btn>
    </v-app-bar>
    <v-navigation-drawer
      app
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
            <v-stepper
              v-model="stepperValue"
              vertical
            >
              <v-stepper-step
                :complete="stepperValue > 1"
                step="1"
              >
                Upload a schema description
              </v-stepper-step>

              <v-stepper-content step="1">
                  <v-file-input
                    v-model="descriptionFile"
                    accept=".xml"
                    label="Select schema description"
                  ></v-file-input>
                  <v-btn
                    color="primary"
                    @click="loadDescriptionFile"
                  >
                    Continue
                  </v-btn>
              </v-stepper-content>

              <v-stepper-step
                step="2"
                :complete="stepperValue > 2"
              >
                Upload a schema
              </v-stepper-step>

              <v-stepper-content step="2">
                <v-file-input
                  v-model="schemaFile"
                  accept=".xml"
                  label="Select schema"
                ></v-file-input>
                <v-btn
                  color="primary"
                  @click="loadSchemaFile"
                >
                  Continue
                </v-btn>
              </v-stepper-content>
            </v-stepper>
          </v-col>
        </v-row>
      </template>
      <xml-element-editor
        v-else-if="elementInEditor"
        :element="elementInEditor"
        :key="elementInEditor.tagName + elementInEditor.getAttribute('name')"
        :elementRequired="elementInEditorRequired"
        @close="elementInEditor = null"
      />
    </v-main>
  </v-app>
</template>

<script>
import ElementTree from './components/ElementTree.vue';
import XmlElementEditor from './components/XmlElementEditor.vue';
import xmlDescriptionMixin from './mixins/xmlDescriptionMixin'
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
  },

  methods: {
    async loadSchemaFile() {
      if (!this.schemaFile) return;
      const xmlContent = await this.schemaFile.text()
      const parser = new DOMParser()

      this.xmlDoc = parser.parseFromString(xmlContent, "text/xml")
    },
    async loadDescriptionFile() {
      if (!this.descriptionFile) return;
      const xmlModelContent = await this.descriptionFile.text()
      const parser = new DOMParser()
    
      const modelDoc = parser.parseFromString(xmlModelContent, "text/xml")
      const jsModel = parseXmlModel(modelDoc)
      this.loadDescription(jsModel)

      this.stepperValue++;
    },
    openEditor(payload) {
      const { element, required } = payload
      this.elementInEditor = element
      this.elementInEditorRequired = required
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
