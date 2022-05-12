<template>
  <div>
    <v-list-item
      @click.stop.prevent="openItem"
      :class="hasErrors"
    >
      <v-list-item-icon>
        <v-icon v-text="iconName"></v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title v-text="name"></v-list-item-title>
      </v-list-item-content>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              @click.stop.prevent="copyItem"
            >
              <v-icon
                v-text="'mdi-content-copy'"
              ></v-icon>
            </v-btn>
          </template>
          <span>Copy</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              @click.stop.prevent="duplicateItem"
            >
              <v-icon
                v-text="'mdi-content-duplicate'"
              ></v-icon>
            </v-btn>
          </template>
          <span>Duplicate</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              @click.stop.prevent="deleteItem"
            >
              <v-icon
                class="red--text text--lighten-2"
                v-text="'mdi-delete'"
              ></v-icon>
            </v-btn>
          </template>
          <span>Delete</span>
        </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
            @click.stop.prevent="opened=!opened"
          >
            <v-icon
              v-text="'mdi-chevron-down'"
              :class="{
                'openIcon': true,
                'openIcon__opened': opened
              }"
            ></v-icon>
          </v-btn>
        </template>
        <span>{{ opened ? 'Collapse' : 'Expand' }}</span>
      </v-tooltip>
    </v-list-item>
    <div v-if="opened" class="element_tree_item">
      <element-child-object
        v-for="(item, idx) in childObjects" 
        :key="getObjectKey(item, idx)"
        :obj="item"
        :timestamp="timestamp"
        :class="getObjectClasses(item)"
        @open-editor="openChildElement"
        @create-object="createObject"
      />
      <element-child-array
        v-for="childArray in childArrays"
        :key="`${childArray.name}`"
        :element="element"
        :arrayDescription="childArray"
        :timestamp="timestamp"
        @open-editor="openChildElement"
      />
      <!-- <v-divider /> -->
    </div>
  </div>
</template>

<script>
import xmlDescriptionMixin from '../../mixins/xmlDescriptionMixin'

export default {
  name: 'ElementListItem',
  components: {
    ElementChildArray: () => import('./ElementChildArray.vue'),
    ElementChildObject: () => import('./ElementChildObject.vue')
  },
  mixins: [
    xmlDescriptionMixin
  ],
  props: {
    element: {
      type: Element,
      required: true
    },
    timestamp: {
      type: Number,
      required: true,
    }
  },
  data() {
    return {
      opened: false,
      desc: this.getDescriptionForElement(this.element.tagName)
    }
  },
  computed: {
    name() {
      this.timestamp
      return this.element.getAttribute('name')
    },
    hasArrays() {
      this.timestamp
      return this.desc.arrays.length
    },
    childArrays() {
      this.timestamp
      const arrays = this.desc.arrays
      return arrays
    },
    childObjects() {
      this.timestamp
      const arrays = this.desc.objects.map(obj => {
        const possibleElements = this.getPossibleElements(obj.type)
        const element = this.element.querySelector(`:scope > ${possibleElements.join(', :scope >')}`)

        return {
          ...obj,
          element
        }
      });
      return arrays
    },
    iconName() {
      this.timestamp
      if (this.element.tagName === 'Cube') {
        return 'mdi-cube';
      }
      return 'mdi-xml';
    },
    hasErrors() {
      const elementsWithErrors = this.$root.$children[0].invalidElementSet
      if (elementsWithErrors.has(this.element)) {
        return 'element_has_errors element_has_errors_in_child'
      }

      let childHasError = false
      const elementsWithErrorsArr = Array.from(elementsWithErrors)
      elementsWithErrorsArr.forEach(e => {
        if (this.element.contains(e)) {
          childHasError = true
        }
      })
      return childHasError ? 'element_has_errors_in_child' : ''
    }
  },
  methods: {
    update() {
      this.$emit('update')
    },
    copyItem() {
      this.$root.$children[0].bufferElement = this.element
    },
    duplicateItem() {
      const createdElement = this.element.cloneNode(true)
      this.element.insertAdjacentElement('afterend', createdElement)
      this.$root.$emit('modelChanged')
    },
    openItem() {
      this.$emit('open-editor',  { element: this.element })
    },
    openChildElement(item) {
      this.$emit('open-editor', item)
    },
    getPossibleElements(type) {
      return this.getElementsOfType(type)
    },
    createObject(obj) {
      const currentObjDesc = this.desc.objects.find((e) => {
        if (e.type === obj.type) return true;
        let parentClassName = obj.parentClassName
        while (parentClassName) {
          if (e.type === parentClassName) return true;
          else {
            let desc = this.getDescriptionForElement(parentClassName);
            parentClassName = desc.parentClassName;
          }
        }
        return false;
      });
      console.log(this.desc.objects, obj);
      const objectsBefore = this.desc.objects.filter((e) => e.index < currentObjDesc.index)
      let itemInserted = false
      if (objectsBefore.length) {
        const el = document.createElementNS(null, obj.type)

        for (let i = objectsBefore.length - 1; i >= 0; i--) {
          const tmpObj = objectsBefore[i]

          const possibleElements = this.getPossibleElements(tmpObj.type)
          const objElement = this.element.querySelector(`:scope > ${possibleElements.join(', :scope >')}`)
          if (objElement) {
            objElement.insertAdjacentElement('afterend', el)
            itemInserted = true

            const itemIndex = Array.from(el.parentNode.children).indexOf(el)
            const prevItem = el.parentNode.children[itemIndex - 1]
            const prevItemNodeIndex = Array.from(el.parentNode.childNodes).indexOf(prevItem)
            const prevItemSeparator = el.parentNode.childNodes[prevItemNodeIndex - 1]
            let newtext = '\n'
            if (prevItemSeparator.nodeType === 3) {
              newtext = prevItemSeparator.textContent
            }

            el.insertAdjacentHTML('beforebegin', newtext)
          }
        }
      }

      if (!itemInserted) {
        const el = document.createElementNS(null, obj.type)
        this.element.insertAdjacentElement('afterbegin', el)

        const elIndex = Array.from(this.element.parentNode.childNodes).indexOf(this.element)
        const elSeparator = this.element.parentNode.childNodes[elIndex - 1]

        let newtext = '\n'
        if (elSeparator.nodeType === 3) {
          newtext = elSeparator.textContent + '  '
          newtext = newtext.replace(/\n+/, '\n')
        }

        el.insertAdjacentHTML('beforebegin', newtext)
        el.insertAdjacentHTML('afterend', newtext)
      }
      
      this.$root.$emit('modelChanged')
    },
    getObjectKey(item, idx) {
      return `${item?.element?.tagName || item.type}-${item.name}-${idx}`
    },
    getObjectClasses(obj) {
      const elementsWithErrors = this.$root.$children[0].invalidElementSet
      if (elementsWithErrors.has(this.element)) {
        if (obj.required && !obj.element) {
          return 'object_has_errors'
        }
      }

      return ''
    },
    deleteItem() {
      this.$root.$emit('removeItem', this.element)
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

.empty-object {
  color: #BDBDBD;
}

.element_tree_item {
  padding-left: 1.5rem;
}

.element_has_errors {
  color: red !important;
}


.element_has_errors_in_child {
  border-left: 3px solid red;
  border-radius: 0 !important;
}
</style>

<style>
.object_has_errors .empty-object {
  color: rgba(255, 0, 0, 0.4) !important;
}

.object_has_errors {
  border-left: 3px solid red;
  border-radius: 0 !important;
}
</style>
