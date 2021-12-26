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
            @click.stop.prevent="createObject"
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
      desc: this.getDescriptionForElement(this.obj.type)
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
    createObject() {
      this.$emit('create-object', this.obj)
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
