<template>
  <div style="margin-bottom: 2rem;">
    <v-row
      class="align-center py-1"
      :class="arrayItems.length ? 'black--text' : 'grey--text'"
    >
      <v-col cols=8 class="capitalize">
        {{ arrayDescription.name }}
      </v-col>
      <v-spacer />
      <v-col cols=1>
         <v-tooltip
            bottom
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                @click="pasteItem"
              >
                <v-icon>mdi-content-paste</v-icon>
              </v-btn>
            </template>
            <span>Paste</span>
          </v-tooltip>
      </v-col>
      <v-col cols=2>
        <v-tooltip
          bottom
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              @click="openNewItemModal"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>Add</span>
        </v-tooltip>
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
      return this.getElementsOfType(this.arrayDescription.type).filter(e => !e.abstract)
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
    async pasteItem() {
      const serializedItem = await navigator.clipboard.readText();
      const parser = new DOMParser()
      const item = parser.parseFromString(serializedItem, "text/xml")
      const elementToPaste = item.documentElement
      const possibleToPaste = this.possibleElements.find(e => e === elementToPaste.tagName)
      if (!possibleToPaste) {
        this.$errorModal.open(`<b class="text-h6">Item from your clipboard can't be pasted here</b>`)
        return
      }

      const desc = this.getDescriptionForElement(this.element.tagName)

      if (this.arrayItems.length) {
        this.arrayItems[this.arrayItems.length - 1].insertAdjacentElement('afterend', elementToPaste)

        const itemIndex = Array.from(elementToPaste.parentNode.children).indexOf(elementToPaste)
        const prevItem = elementToPaste.parentNode.children[itemIndex - 1]
        const prevItemNodeIndex = Array.from(elementToPaste.parentNode.childNodes).indexOf(prevItem)
        const prevItemSeparator = elementToPaste.parentNode.childNodes[prevItemNodeIndex - 1]
        let newtext = '\n'
        if (prevItemSeparator.nodeType === 3) {
          newtext = prevItemSeparator.textContent
        }

        elementToPaste.insertAdjacentHTML('beforebegin', newtext)
      } else {
        const arraysBefore = desc.arrays.filter(e => e.index < this.arrayDescription.index)
        let itemInserted = false
        for (let i = arraysBefore.length - 1; i >= 0; i--) {
          const tmpArray = arraysBefore[i]
          const possibleElements = this.getElementsOfType(tmpArray.type)
          const items = Array.from(this.element.querySelectorAll(`:scope > ${possibleElements.join(', :scope >')}`))
          if (items.length) {
            items[items.length - 1].insertAdjacentElement('afterend', elementToPaste)
            itemInserted = true

            const itemIndex = Array.from(elementToPaste.parentNode.children).indexOf(elementToPaste)
            const prevItem = elementToPaste.parentNode.children[itemIndex - 1]
            const prevItemNodeIndex = Array.from(elementToPaste.parentNode.childNodes).indexOf(prevItem)
            const prevItemSeparator = elementToPaste.parentNode.childNodes[prevItemNodeIndex - 1]
            let newtext = '\n'
            if (prevItemSeparator.nodeType === 3) {
              newtext = prevItemSeparator.textContent
            }

            elementToPaste.insertAdjacentHTML('beforebegin', newtext)
          }
          break
        }
        if (!itemInserted) {
          this.element.insertAdjacentElement('afterbegin', elementToPaste)

          const elIndex = Array.from(this.element.parentNode.childNodes).indexOf(this.element)
          const elSeparator = this.element.parentNode.childNodes[elIndex - 1]
            
          let newtext = '\n'
          if (elSeparator.nodeType === 3) {
            newtext = elSeparator.textContent + '  '
            newtext = newtext.replace(/\n+/, '\n')
          }

          elementToPaste.insertAdjacentHTML('beforebegin', newtext)
          elementToPaste.insertAdjacentHTML('afterend', newtext)
        }
      }
      
      this.$store.dispatch('SchemaEditor/updateModel')
      this.$emit('open-editor', { element: elementToPaste })
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

          const itemIndex = Array.from(createdElement.parentNode.children).indexOf(createdElement)
          const prevItem = createdElement.parentNode.children[itemIndex - 1]
          const prevItemNodeIndex = Array.from(createdElement.parentNode.childNodes).indexOf(prevItem)
          const prevItemSeparator = createdElement.parentNode.childNodes[prevItemNodeIndex - 1]
          let newtext = '\n'
          if (prevItemSeparator.nodeType === 3) {
              newtext = prevItemSeparator.textContent
          }

          createdElement.insertAdjacentHTML('beforebegin', newtext)
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

              const itemIndex = Array.from(createdElement.parentNode.children).indexOf(createdElement)
              const prevItem = createdElement.parentNode.children[itemIndex - 1]
              const prevItemNodeIndex = Array.from(createdElement.parentNode.childNodes).indexOf(prevItem)
              const prevItemSeparator = createdElement.parentNode.childNodes[prevItemNodeIndex - 1]
              let newtext = '\n'
              if (prevItemSeparator.nodeType === 3) {
                newtext = prevItemSeparator.textContent
              }

              createdElement.insertAdjacentHTML('beforebegin', newtext)
              break
            }
          }

          if (!itemInserted) {
            const objectsBefore = desc.objects
            let objBefore = null

            for (let i = objectsBefore.length - 1; i >= 0; i--) {
              const tmpObj = objectsBefore[i]

              const possibleElements = this.getElementsOfType(tmpObj.type)
              const objBeforeQueryResult = this.element.querySelector(`:scope > ${possibleElements.join(', :scope >')}`)
              if (objBeforeQueryResult) {
                objBefore = objBeforeQueryResult
                break
              }
            }

            if (objBefore) {
                objBefore.insertAdjacentElement('afterend', createdElement)
            } else {
              this.element.insertAdjacentElement('afterbegin', createdElement)
              
              const elIndex = Array.from(this.element.parentNode.childNodes).indexOf(this.element)
              const elSeparator = this.element.parentNode.childNodes[elIndex - 1]
              
              let newtext = '\n'
              if (elSeparator.nodeType === 3) {
                newtext = elSeparator.textContent + '  '
                newtext = newtext.replace(/\n+/, '\n')
              }

              createdElement.insertAdjacentHTML('beforebegin', newtext)
              createdElement.insertAdjacentHTML('afterend', newtext)
            }
          }
        }

        this.$store.dispatch('SchemaEditor/updateModel')

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
