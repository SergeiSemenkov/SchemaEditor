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
        <v-col cols=12>
          <v-row>
            <v-col cols=6>
              <h2>Edit element</h2>
            </v-col>
            <v-spacer />
            <v-col cols=3>
              <v-btn
                v-if="!elementRequired"
                block
                color="error"
                @click="confirmationDialog = true"
              >
                Delete
              </v-btn>
            </v-col>
            <v-col cols=3>
              <v-btn
                block
                :disabled="!hasChanges"
                @click="saveChanges"
              >
                Save
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols=6>
              <h2>Type: {{ elementType }}</h2>
            </v-col>
            <v-spacer />
            <v-col cols=6>
              <v-btn
                v-if="possibleElements"
                block
                @click="openChangeTypeModal"
              >
                Change type
              </v-btn>
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
                    :is="getComponentForAttribute(attribute)"
                    v-model="configuredElement[attribute.name]"
                    :label="attribute.name"
                    :items="attribute.values"
                    :rules="rules.required"
                    dense
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
                    :is="getComponentForAttribute(attribute)"
                    v-model="configuredElement[attribute.name]"
                    :label="attribute.name"
                    :items="attribute.values"
                    dense
                  ></component>
                  <p class="mt-n2 text-caption" v-html="attribute.doc"></p>
                </v-col>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row class="flex-wrap ma-4" v-if="elementDesc.hasValue">
        <v-col cols=12>
          <v-card>
            <v-card-title>Element value</v-card-title>
            <div class="ma-4">
              <v-textarea
                v-model="configuredElement._value"
                label="Value of the element"
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
    <v-dialog
      v-model="changeTypeDialog"
      width="500"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Change element type
        </v-card-title>
         <v-card-text class="pa-4">
           <v-select
            v-model="newElementType"
            :items="possibleElements"
            label="Select element type"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="changeTypeDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            text
            @click="changeType"
          >
            Change
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
    elementRequired: {
      type: Boolean,
      default: false
    },
    parentDesctiption: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const desc = this.getDescriptionForElement(this.element.tagName)

    const configuredElement = {}
    desc.attributes.forEach((e) => {
      configuredElement[e.name] = this.element.getAttribute(e.name)
    });
    if (desc.hasValue) {
      configuredElement._value = this.element.innerHTML
    }

    initialValue = Object.assign({}, configuredElement);
    return {
      elementDesc: desc,
      elementInEditor: this.element.cloneNode(),
      configuredElement,
      confirmationDialog: false,
      changeTypeDialog: false,
      possibleElements: this.parentDesctiption ? this.getElementsOfType(this.parentDesctiption.type) : null,
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
      return this.elementInEditor.tagName
    }
  },
  methods: {
    openChangeTypeModal() {
      this.changeTypeDialog = true
    },
    changeType() {
      const newItem = document.createElementNS(null, this.newElementType)
      const desc = this.getDescriptionForElement(this.newElementType)

      for(var i = 0; i < this.element.attributes.length; i++){
        var nodeName  = this.element.attributes.item(i).nodeName;
        var nodeValue = this.element.attributes.item(i).nodeValue;
        if (desc.attributes.find(e => e.name === nodeName)) {
          newItem.setAttribute(nodeName, nodeValue);
        }
      }

      // Persist contents
      newItem.innerHTML = this.element.innerHTML;

      const configuredElement = {}
      desc.attributes.forEach((e) => {
        configuredElement[e.name] = newItem.getAttribute(e.name)
      });
      if (desc.hasValue) {
        configuredElement._value = newItem.innerHTML
      }

      this.configuredElement = configuredElement
      this.elementDesc = desc
      this.elementInEditor = newItem

      this.changeTypeDialog = false;
    },
    saveChanges() {
      for (const confAttrs in this.configuredElement) {
        if (confAttrs === '_value') {
          this.elementInEditor.innerHTML = this.configuredElement._value
          break;
        }
        if (this.configuredElement[confAttrs]) {
          this.elementInEditor.setAttribute(confAttrs, this.configuredElement[confAttrs])
        }
      }

      this.element.parentNode.replaceChild(this.elementInEditor, this.element)
      this.initialValue = this.configuredElement
      
      this.$root.$emit('modelChanged')
      this.$emit('open-editor',  { element: this.elementInEditor, required: this.elementRequired, parentDescription: this.parentDesctiption })
    },
    getComponentForAttribute(attr) {
      if (attr.values) {
        return VSelect
      }
      if (attr.type === 'String') {
        return VTextField
      } if (attr.type === 'Boolean') {
        return VSwitch
      }
      return VTextField
    },
    removeItem() {
      this.confirmationDialog = false
      this.element.parentNode.removeChild(this.element)
      this.$root.$emit('modelChanged')
      this.$emit('close')
    },
    getArrayItems() {

    }
  }
}
</script>

<style>

</style>