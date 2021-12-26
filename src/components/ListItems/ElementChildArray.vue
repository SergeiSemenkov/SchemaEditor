<template>
  <div style="margin-bottom: 2rem;">
    <v-row class="align-center black--text py-1">
      <v-col cols=10 class="capitalize">
        {{ arrayDescription.name }}
      </v-col>
      <v-spacer />
      <v-col cols=2>
        <v-btn
          icon
          @click="openNewItemModal"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <element-list-item
      v-for="(item, idx) in arrayItems" 
      class="child_item"
      :key="`${arrayDescription.type}-${getElementName(item)}-${idx}`"
      :element="item"
      :timestamp="timestamp"
      @open-editor="openChildElement"
    />
    <v-dialog
      v-model="dialogOpened"
      width="500"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Add new element
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="newItemType"
            :items="possibleElements"
            label="Select element type"
          ></v-select>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="addNewItem"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import xmlDescriptionMixin from '../../mixins/xmlDescriptionMixin'

export default {
  components: { 
    ElementListItem: () => import('./ElementListItem.vue')
  },
  name: 'ElementChildArray',
  mixins: [
    xmlDescriptionMixin
  ],
  data() {
    return {
      dialogOpened: false,
      newItemType: null
    }
  },
  props: {
    arrayDescription: {
      type: Object,
      required: true
    },
    timestamp: {
      type: Number,
      required: true,
    },
    element: {
      type: Element,
      required: true
    },
  },
  computed: {
    arrayItems() {
      this.timestamp
      
      const items = Array.from(this.element.querySelectorAll(`:scope > ${this.possibleElements.join(', :scope >')}`))
      return items
    },
    possibleElements() {
      this.timestamp
      return this.getElementsOfType(this.arrayDescription.type)
    }
  },
  methods: {
    getElementName(element) {
      return element.getAttribute('name')
    },
    openChildElement(payload) {
      if (!payload.parentDescription) {
        payload.parentDescription = this.arrayDescription
      }
      this.$emit('open-editor', payload)
    },
    openNewItemModal() {
      if (this.possibleElements.length > 1) {
        this.dialogOpened = true
      } else {
        this.newItemType = this.possibleElements[0];
        this.addNewItem();
      }
    },
    addNewItem() {
      if (this.newItemType) {
        this.dialogOpened = false
        const type = this.newItemType
        this.newItemType = null

        const createdElement = document.createElementNS(null, type)

        const desc = this.getDescriptionForElement(this.element.tagName)

        if (this.arrayItems.length) {
          this.arrayItems[this.arrayItems.length - 1].insertAdjacentElement('afterend', createdElement)
        } else {
          const arraysBefore = desc.arrays.filter(e => e.index < this.arrayDescription.index)
          let itemInserted = false

          for (let i = arraysBefore.length - 1; i >= 0; i--) {
            const tmpArray = arraysBefore[i]
            const possibleElements = this.getElementsOfType(tmpArray.type)
            const items = Array.from(this.element.querySelectorAll(`:scope > ${possibleElements.join(', :scope >')}`))

            if (items.length) {
              items[items.length - 1].insertAdjacentElement('afterend', createdElement)
              itemInserted = true
            }
            break
          }

          if (!itemInserted) {
            this.element.insertAdjacentElement('afterbegin', createdElement)
          }
        }

        this.$root.$emit('modelChanged')

        this.$emit('open-editor', { element: createdElement })
      }
    }
  }
}
</script>

<style scoped>
.openIcon {
  transition: transform 0.5 ease-in-out;
}

.openIcon__opened {
  transform: rotate(-180deg);
}

.capitalize {
  text-transform: capitalize;
}

.child_item {
  border-left: 1px solid rgba(0, 0, 0, 0.12);;
}
</style>>
