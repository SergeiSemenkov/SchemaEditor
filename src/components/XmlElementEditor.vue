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
            <v-col cols=8>
              <h2>Element Type: {{ elementType }}</h2>
            </v-col>
            <v-spacer />
            <v-col>
              <v-btn
                v-if="!elementRequired"
                block
                color="error"
                @click="confirmationDialog = true"
              >
                Delete
              </v-btn>
            </v-col>
            <v-col>
              <v-btn
                block
                :disabled="!hasChanges"
                @click="saveChanges"
              >
                Save
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
      configuredElement,
      confirmationDialog: false
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
    }
  },
  methods: {
    saveChanges() {
      for (const confAttrs in this.configuredElement) {
        if (confAttrs === '_value') {
          this.element.innerHTML = this.configuredElement._value
          break;
        }
        if (this.configuredElement[confAttrs]) {
          this.element.setAttribute(confAttrs, this.configuredElement[confAttrs]);
        }
      }
      this.$root.$emit('modelChanged')
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