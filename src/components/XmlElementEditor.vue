<template>
  <v-row>
    <v-col
      cols=12
      md=10
      lg=8
      offset-md=1
      offset-lg=2
      offset=0
    >
      <v-row class="flex-wrap ma-4">
        <v-form ref="form">
          <v-col cols=12>
            <v-row>
              <v-col cols=6>
                <h2>Edit element</h2>
              </v-col>
              <v-spacer />
              <v-col cols=3 v-if="elementType === 'Cube' || elementType === 'VirtualCube'">
                <v-btn block @click="openDiagram">Open diagram</v-btn>
              </v-col>
              <v-col cols=3>
                <v-btn block @click="openXmlContent">Open XML Content</v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols=6>
                <h2>Type: {{ elementType }}</h2>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols=12>
            <span v-html="this.elementDesc.doc"></span>
          </v-col>
          <v-col cols=12 v-if="requiredAttributes.length">
            <v-card>
              <v-card-title>Required attributes</v-card-title>
              <v-card-text>
                <template
                  v-for="attribute in requiredAttributes"
                >
                  <v-col
                    :key="attribute.name"
                    cols="12"
                  >
                    <template v-if="attribute.linkedToSourceTable && serverAvailable">
                      <v-row>
                        <v-col align-self="center" cols="11">
                          <v-text-field
                            :label="attribute.name"
                            :value="configuredElement[attribute.name]"
                            @change="onTableManuallyChanged(attribute, $event)"
                          ></v-text-field>
                        </v-col>
                        <v-col align-self="center" cols="1">
                          <v-btn
                            icon
                            small
                            @click="openSourceTableSelection(attribute)"
                          >
                            <v-icon
                              v-text="'mdi-table'"
                            ></v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </template>
                    <component
                      v-else
                      :ref="`editorField-${attribute.name}`"
                      :is="getComponentForAttribute(attribute)"
                      :value="configuredElement[attribute.name]"
                      :label="attribute.name"
                      :items="getSelectionItems(attribute)"
                      :rules="rules.required"
                      dense
                      clearable
                      @change="updateXmlAttribute(attribute.name, $event)"
                    ></component>
                    <p class="mt-n2 text-caption" v-html="attribute.doc"></p>
                  </v-col>
                </template>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols=12 v-if="optionalAttributes.length">
            <v-card>
              <v-card-title>Optional attributes</v-card-title>
              <v-card-text>
                <template
                  v-for="attribute in optionalAttributes"
                >
                  <v-col
                    :key="attribute.name"
                    cols="12"
                  >
                    <component
                      :ref="`editorField-${attribute.name}`"
                      :is="getComponentForAttribute(attribute)"
                      :value="configuredElement[attribute.name]"
                      :label="attribute.name"
                      :items="getSelectionItems(attribute)"
                      dense
                      clearable
                      @change="updateXmlAttribute(attribute.name, $event)"
                    ></component>
                    <p class="mt-n2 text-caption" v-html="attribute.doc"></p>
                  </v-col>
                </template>
              </v-card-text>
            </v-card>
          </v-col>
        </v-form>
      </v-row>
      <v-row class="flex-wrap ma-4" v-if="elementDesc.hasValue">
        <v-col cols=12>
          <v-card>
            <v-card-title>Element value</v-card-title>
            <div class="ma-4">
              <v-textarea
                ref="textArea"
                v-model="configuredElement._value"
                label="Value of the element"
                @change="updateXmlValue"
                @focus="expandTextArea"
                @input="expandTextArea"
                @blur="shrinkTextArea"
              ></v-textarea>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
    <SourceTableSelectionModal 
      :opened="sourceTableDialogOpened"
      :selected-attribute-value="attributeForSourceTableSelection ? configuredElement[attributeForSourceTableSelection.name] : ''"
      @close="sourceTableDialogOpened = false"
      @selectItem="selectItem"
    />
  </v-row>
</template>

<script>
import _ from "lodash"
import xmlDescriptionMixin from '../mixins/xmlDescriptionMixin'
import { VTextField, VCombobox } from 'vuetify/lib'
import { getElementByXpathRelative } from '../utils/xPath'
import RadioGroupEditor from "./Editors/RadioGroupEditor.vue"
import OptionalBooleanEditor from "./Editors/OptionalBooleanEditor.vue"
import DiagramModal from './Modals/DiagramModal.vue'
import SourceTableSelectionModal from './Modals/SourceTableSelectionModal.vue'

let initialValue = null;

export default {
  mixins: [
    xmlDescriptionMixin
  ],
  props: {
    element: {
      type: Element,
      required: true
    },
    xmlDoc: {
      type: XMLDocument,
      required: true
    }
  },
  components: {
    RadioGroupEditor,
    DiagramModal,
    SourceTableSelectionModal,
    OptionalBooleanEditor,
  },
  mounted() {
    this.$refs.form.validate()
    if (this.focusedAttribute) {
      this.focusOnAttribute(this.focusedAttribute)
    }
  },
  watch: {
    focusedAttribute(newVal) {
      if (newVal) {
        this.focusOnAttribute(newVal)
      }
    }
  },
  data() {
    const desc = this.getDescriptionForElement(this.element.tagName)  

    const configuredElement = {}
    desc.attributes.forEach((e) => {
      configuredElement[e.name] = e.type === 'Boolean' ? this.element.getAttribute(e.name) || 'none' : this.element.getAttribute(e.name)
    });
    if (desc.hasValue) {
      configuredElement._value = this.element.innerHTML.replace('<![CDATA[', '').replace(']]>', '').trim();
    }

    initialValue = Object.assign({}, configuredElement);
    return {
      elementDesc: desc,
      configuredElement,
      confirmationDialog: false,
      newElementType: this.element.tagName,
      rules: {
        required: [
          value => !!value || 'Required.',
          // value => (value && value.length >= 3) || 'Min 3 characters',
        ],
      },
      sourceTableDialogOpened: false,
      attributeForSourceTableSelection: null,
    }
  },
  computed: {
    requiredAttributes() {
      return this.elementDesc.attributes.filter(e => e.required === 'true').sort((a, b) => { 
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      })
    },
    optionalAttributes() {
      return this.elementDesc.attributes.filter(e => !e.required || e.required === 'false').sort((a, b) => { 
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      })
    },
    hasChanges() {
      return !_.isEqual(initialValue, this.configuredElement);
    },
    elementType() {
      return this.element.tagName
    },
    serverAvailable() {
      return this.$store.getters['SchemaEditor/serverUrl']
    },
    focusedAttribute() {
      return this.$store.getters['SchemaEditor/openedElementFocusedAttribute']
    },
  },
  methods: {
    updateXmlAttribute(attributeName, attributeValue) {
      const attr = this.elementDesc.attributes.find(e => e.name === attributeName)
      if (attr.type === 'Boolean' && attributeValue === 'none') {
        this.element.removeAttribute(attributeName)
      } else {
        this.element.setAttribute(attributeName, attributeValue === null ? '' : attributeValue)
      }

      this.$store.dispatch('SchemaEditor/updateModel')
      this.$emit('open-editor',  { element: this.element })
    },
    updateXmlValue(value) {
      const wrappedValue = `\n<![CDATA[ \n ${value} \n ]]>\n`
      this.element.innerHTML = wrappedValue

      this.$store.dispatch('SchemaEditor/updateModel')
      this.$emit('open-editor',  { element: this.element })
    },
    expandTextArea() {
      const textArea = this.$refs.textArea.$el.querySelector('textarea');
      if (!textArea['data-prevHeight']) {
        textArea['data-prevHeight'] = textArea.style.height;
      }
      textArea.style.height = textArea.scrollHeight + "px";
    },
    shrinkTextArea() {
      const textArea = this.$refs.textArea.$el.querySelector('textarea');
      textArea['data-prevHeight'] = null
      textArea.style.height = textArea['data-prevHeight'];
    },
    getComponentForAttribute(attr) {
      if (attr.values) {
        return VCombobox
      }
      if (attr.references) {
        return VCombobox
      }
      if (attr.type === 'String') {
        return VTextField
      } if (attr.type === 'Boolean') {
        return OptionalBooleanEditor
      }
      return VTextField
    },
    getSelectionItems(attr) {
      if (attr.values) {
        return attr.values
      }
      if (attr.references) {
        const doc = this.xmlDoc
        const refs = attr.references
        let xPathResult = []
        refs.forEach(r => {
          const t = getElementByXpathRelative(r.xPath, doc, this.element).map(e => e ? e.getAttribute(r.attribute) : '')
          xPathResult = xPathResult.concat(...t)
        })
        return xPathResult
      }
    },
    focusOnAttribute(attributeName) {
      if (!attributeName) return
      const field = this.$refs[`editorField-${attributeName}`][0]
      field.focus()
    },
    async selectItem(item) {
      if (!this.attributeForSourceTableSelection) return

      const attributeName = this.attributeForSourceTableSelection.name
      const attributeValue = item.tableName

      this.configuredElement[attributeName] = attributeValue
      this.element.setAttribute(attributeName, attributeValue === null ? '' : attributeValue)
      
      this.$store.dispatch('SchemaEditor/updateModel')
      this.$emit('open-editor', { element: this.element })
    },
    onTableManuallyChanged(attribute, table) {
      const attributeName = attribute.name
      const attributeValue = table

      this.configuredElement[attributeName] = attributeValue
      this.element.setAttribute(attributeName, attributeValue === null ? '' : attributeValue)
      
      this.$store.dispatch('SchemaEditor/updateModel')
      this.$emit('open-editor', { element: this.element })
    },
    openSourceTableSelection(attr) {
      this.attributeForSourceTableSelection = attr
      this.sourceTableDialogOpened = true
    },
    openDiagram() {
      this.$diagramModal.open(this.element)
    },
    openXmlContent() {
      this.$xmlViewerModal.open(this.element, async (newElement) => {
        try {
          const parser = new DOMParser()
          const updatedElement = parser.parseFromString(newElement, "text/xml").documentElement
          console.log(updatedElement)
          const errors = updatedElement.querySelectorAll('parsererror')
          if (errors.length) throw new Error(errors[0].querySelector('div').innerHTML)

          if (updatedElement.tagName !== this.element.tagName) throw new Error(`Type of Element from modified XML doesn't match original element`)
          this.element.parentNode.replaceChild(updatedElement, this.element);
          this.$store.dispatch('SchemaEditor/updateModel')
          this.$store.dispatch('SchemaEditor/closeEditor')
          await this.$nextTick()
          this.$store.dispatch('SchemaEditor/openEditor', { element: updatedElement })
          this.$successModal.open(`<b class="text-h6">Schema was succesfully saved</b>`)
        } catch (e) {
          if (e.message) {
            this.$errorModal.open(`<b class="text-h6">Unable to save xml element: </b><br/><p>'${e.message}'</p>`)
          } else {
            this.$errorModal.open(`<b class="text-h6">Unable to save xml element.</b>`)
          }
        }
      });
    }
}
  }
</script>
