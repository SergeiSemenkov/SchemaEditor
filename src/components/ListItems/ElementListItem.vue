<template>
  <div>
    <v-list-item @click.stop.prevent="openItem">
      <v-list-item-icon>
        <v-icon v-text="iconName"></v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title v-text="name"></v-list-item-title>
      </v-list-item-content>
      <v-list-item-icon @click.stop.prevent="opened=!opened">
        <v-icon
          v-if="hasArrays"
          v-text="'mdi-chevron-down'"
          :class="{
            'openIcon': true,
            'openIcon__opened': opened
          }"
        ></v-icon>
      </v-list-item-icon>
    </v-list-item>
    <div v-if="opened" class="element_tree_item">
      <element-child-object
        v-for="(item, idx) in childObjects" 
        :key="`${item.type}-${item.name}-${idx}`"
        :obj="item"
        :timestamp="timestamp"
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
    }
  },
  methods: {
    update() {
      this.$emit('update')
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
      const currentObjDesc = this.desc.objects.find((e) => e.type === obj.type)
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
          }
        }
      }

      if (!itemInserted) {
        const el = document.createElementNS(null, obj.type)
        this.element.insertAdjacentElement('afterbegin', el)
      }
      
      this.$root.$emit('modelChanged')
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
