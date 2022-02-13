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
              <v-col cols=9>
                <h2>Edit element</h2>
              </v-col>
              <v-spacer />
              <v-col cols=3>
                <v-btn
                  block
                  color="error"
                  @click="confirmationDialog = true"
                >
                  Delete
                </v-btn>
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
                    <component
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
    <v-dialog
      v-model="confirmationDialog"
      width="500"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Remove element
        </v-card-title>
         <v-card-text class="pa-4">
          Are you sure you want to remove the element?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            text
            @click="removeItem"
          >
            Remove
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import _ from "lodash"
import xmlDescriptionMixin from '../mixins/xmlDescriptionMixin'
import { VTextField, VSwitch, VSelect } from 'vuetify/lib'
import { getElementByXpathRelative } from '../utils/xPath'

let initialValue = null;

export default {
  mixins: [
    xmlDescriptionMixin
  ],
  props: {
    element: {
      type: Element,
      required: true
    }
  },
  mounted() {
    this.$refs.form.validate();
  },
  data() {
    const desc = this.getDescriptionForElement(this.element.tagName)  

    const configuredElement = {}
    desc.attributes.forEach((e) => {
      configuredElement[e.name] = e.type === 'Boolean' ? this.element.getAttribute(e.name) === 'true' : this.element.getAttribute(e.name)
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
  },
  methods: {
    // sortAttributes() {
    //   const reqAttrsStorage = this.requiredAttributes.map()
    //   const optAttrsStorage = this.optionalAttributes.map()


    //   this.a
    // },
    updateXmlAttribute(attributeName, attributeValue) {
      this.element.setAttribute(attributeName, attributeValue === null ? '' : attributeValue)

      this.$root.$emit('modelChanged')
      this.$emit('open-editor',  { element: this.element })
    },
    updateXmlValue(value) {
      const wrappedValue = `\n<![CDATA[ \n ${value} \n ]]>\n`
      this.element.innerHTML = wrappedValue

      this.$root.$emit('modelChanged')
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
        return VSelect
      }
      if (attr.references) {
        return VSelect
      }
      if (attr.type === 'String') {
        return VTextField
      } if (attr.type === 'Boolean') {
        return VSwitch
      }
      return VTextField
    },
    getSelectionItems(attr) {
      if (attr.values) {
        return attr.values
      }
      if (attr.references) {
        const doc = this.$root.$children[0].xmlDoc
        const refs = attr.references
        let xPathResult = []
        refs.forEach(r => {
          const t = getElementByXpathRelative(r.xPath, doc, this.element).map(e => e ? e.getAttribute(r.attribute) : '')
          xPathResult = xPathResult.concat(...t)
        })
        return xPathResult
      }
    },
    removeItem() {
      this.confirmationDialog = false
      this.element.parentNode.removeChild(this.element)
      this.$root.$emit('modelChanged')
      this.$emit('close')
    },
    focusOnAttribute(attributeName) {
      if (!attributeName) return
      const field = this.$refs[`editorField-${attributeName}`][0]
      field.focus()
    }
  }
}
</script>
