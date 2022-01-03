<template>
  <div>
    <v-list-item @click.stop.prevent="openObject(obj)">
      <v-list-item-icon>
        <v-icon v-text="'mdi-code-braces'"></v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title
          :class="{
            'empty-object': !obj.element
          }"
          class="capitalize"
          v-text="obj.name">
        </v-list-item-title>
      </v-list-item-content>
      <v-list-item-icon>
        <div class="flex">
          <v-btn
            icon
            small
            v-if="!obj.element"
            @click.stop.prevent="dialogOpened = true"
          >
            <v-icon
              v-text="'mdi-plus'"
            ></v-icon>
          </v-btn>
          <v-btn
            icon
            small
            v-else-if="hasArrays"
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
        </div>
      </v-list-item-icon>
    </v-list-item>
    <div v-if="opened" class="element_tree_item">
      <element-child-object
        v-for="(item, idx) in childObjects" 
        :key="`${item.type}-${item.name}-${idx}`"
        :obj="item"
        :timestamp="timestamp"
        @open-editor="openChildElement"
        @create-object="createChildObject"
      />
      <element-child-array
        v-for="childArray in childArrays"
        :key="`${childArray.name}`"
        :element="obj.element"
        :arrayDescription="childArray"
        :timestamp="timestamp"
        @open-editor="openChildElement"
      />
      <!-- <v-divider /> -->
    </div>
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
  name: 'ElementChildObject',
  components: {
    ElementChildArray: () => import('./ElementChildArray.vue')
  },
  mixins: [
    xmlDescriptionMixin
  ],
  props: {
    obj: {
      type: Object,
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
      desc: this.getDescriptionForElement(this.obj?.element?.tagName || this.obj.type),
      dialogOpened: false,
      newItemType: null,
    }
  },
  computed: {
    type() {
      return this.obj?.element?.tagName || this.obj.type
    },
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
        const element = this.obj.element.querySelector(`:scope > ${possibleElements.join(', :scope >')}`)
        return {
          ...obj,
         element
        }
      });
      return arrays
    },
    iconName() {
      this.timestamp
      if (this.obj.element.tagName === 'Cube') {
        return 'mdi-cube';
      }
      return 'mdi-xml';
    },
    possibleElements() {
      this.timestamp
      return this.getElementsOfType(this.obj.type)
    }
  },
  methods: {
    update() {
      this.$emit('update')
    },
    openItem() {
      this.$emit('open-editor',  { element: this.obj.element })
    },
    openChildElement(item) {
      this.$emit('open-editor', item)
    },
    getPossibleElements(type) {
      return this.getElementsOfType(type)
    },
    createChildObject(obj) {
      const currentObjDesc = this.desc.objects.find((e) => e.type === obj.type || e.type === obj.parentClassName)
      const objectsBefore = this.desc.objects.filter((e) => e.index < currentObjDesc.index)
      let itemInserted = false
      if (objectsBefore.length) {
        const el = document.createElementNS(null, obj.type)

        for (let i = objectsBefore.length - 1; i >= 0; i--) {
          const tmpObj = objectsBefore[i]

          const possibleElements = this.getPossibleElements(tmpObj.type)
          const objElement = this.obj.element.querySelector(`:scope > ${possibleElements.join(', :scope >')}`)
          if (objElement) {
            objElement.insertAdjacentElement('afterend', el)
            itemInserted = true
          }
        }
      }

      if (!itemInserted) {
        const el = document.createElementNS(null, obj.type)
        this.obj.element.insertAdjacentElement('afterbegin', el)
      }
      
      this.$root.$emit('modelChanged')
    },
    addNewItem() {
      if (this.newItemType) {
        this.dialogOpened = false
        const type = this.newItemType
        this.newItemType = null
        const { parentClassName } = this.getDescriptionForElement(type)

        this.$emit('create-object', {
          type,
          parentClassName
        })
      }
    },
    openObject(obj) {
      let el = obj.element

      if (!el) {
        return
      }

      this.$emit('open-editor', { element: el, required: obj.required === 'true', parentDescription: obj })
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
</style>>
