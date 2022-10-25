<template>
  <div>
    <v-list-item
      @click.stop.prevent="openItem"
    >
      <v-list-item-icon>
        <v-icon v-text="'mdi-folder'"></v-icon>
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

        <!-- <v-tooltip bottom>
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
        </v-tooltip> -->

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
    </v-list-item>
  </div>
</template>

<script>

export default {
  props: {
    element: {
      type: Element,
      required: true
    },
    timestamp: {
      type: Number,
      required: true,
    },
    keyProp: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      opened: false,
    }
  },
  computed: {
    name() {
      this.timestamp
      return this.element.getAttribute('name')
    },
    // iconName() {
    //   this.timestamp
    //   if (this.element.tagName === 'Cube') {
    //     return 'mdi-cube';
    //   }
    //   return 'mdi-xml';
    // },
  },
  methods: {
    openItem() {
      this.$emit('openItem',  { element: this.element, key: this.keyProp })
    },
    deleteItem() {
      this.$emit('removeItem', this.element)
    },
    copyItem() {
      const serializer = new XMLSerializer();
      const serializedItem = serializer.serializeToString(this.element);
      const tmpText = document.createElement('textarea')
      tmpText.value = serializedItem
      document.querySelector('body').appendChild(tmpText);
      tmpText.select();
      document.execCommand('copy');
      tmpText.parentNode.removeChild(tmpText);
    },
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
