<template>
  <v-dialog
    v-model="opened"
    fullscreen
    hide-overlay
    :retain-focus="false"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar
        dark
        color="primary"
      >
        <v-btn
          icon
          dark
          @click="closeValidation"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Validation</v-toolbar-title>
      </v-toolbar>
      <v-container>
        <v-row class="mt-2">
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn
              @click="validate"
            >
              Validate schema
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols=12>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      Element
                    </th>
                    <th class="text-left">
                      Problem
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(error, i) in errorList"
                    :key="i"
                  >
                    <td>{{ getElementName(error.element, error.attribute) }}</td>
                    <td>{{ error.error }}</td>
                    <td>
                      <v-btn
                        text
                        @click="closeValidation(error)"
                      >
                        Open element
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import xmlDescriptionMixin from '../../mixins/xmlDescriptionMixin'
import { validateAttibutes, validateObjects } from '../../utils/validationService'

export default {
  mixins: [
    xmlDescriptionMixin
  ],
  data() {
    return {
      opened: true,
      errorList: this.errorListProvided,
      successDialogOpened: false,
      errorDialogOpened: false,
    }
  },
  props: {
    xmlDoc: {
      type: XMLDocument,
      required: true,
    },
    errorListProvided: {
      type: Array,
      default: () => [],
    }
  },
  methods: {
    validate() {
      let errorList = []
      const schema = this.xmlDoc

      const elements = schema.querySelectorAll('*')

      elements.forEach(element => {
        const desc = this.getDescriptionForElement(element.tagName)

        errorList = [
          ...errorList,
          ...validateAttibutes(element, desc),
          ...validateObjects(element, desc, this.getElementsOfType)
        ]
      });

      if (errorList.length === 0) this.$successModal.open(`<b class="text-h6">Validation successfull</b>`)
      else this.$errorModal.open('<b class="text-h6">Errors were found during validation</b>')
      this.errorList = errorList
    },
    getElementName(element) {
      const name = element.getAttribute('name')
      if (name) {
        return `${element.tagName} - ${name}`
      } else {
        return `${element.tagName} (name not specified)`
      }
    },
    closeValidation(error) {
      const { element, attribute } = error
      this.$emit('close', { errorList: this.errorList, element, attribute})
    },
    close() {
      this.opened = false;
    },
  }
}
</script>
