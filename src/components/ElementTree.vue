<template>
  <v-list dense nav v-if="schema">
    <v-list-item-group
      ref="listItems"
      color="primary"
    >
      <v-row class="align-center black--text py-1">
        <v-col cols=10 class="capitalize">
          Schema
        </v-col>
      </v-row>
      <v-divider />
      <element-list-item
        :element="schema"
        :timestamp="timestamp"
        @open-editor="openEditor"
      />
    </v-list-item-group>
  </v-list>
</template>

<script>
import ElementListItem from './ListItems/ElementListItem.vue'
export default {
  components: { ElementListItem },
  props: {
    xmlDoc: {
      type: XMLDocument,
      required: true
    },
    timestamp: {
      type: Number,
      required: true,
    }
  },
  computed: {
    schema() {
      this.timestamp
      return this.xmlDoc?.querySelector("Schema")
    },
    openedElement() {
      return this.$store.getters['SchemaEditor/openedElement']
    },
  },
  watch: {
    async openedElement(newVal) {
      await this.$nextTick()
      await this.$nextTick()
      this.updateEditorState(newVal)
    }
  },
  methods: {
    openEditor(payload) {
      this.$emit('open-editor', payload)
    },
    updateEditorState(currentItem) {
      if (currentItem !== null) {
        const listItems = this.$refs.listItems.items.map(i => {
          if (i.$parent.obj) return i.$parent.obj.element
          return i.$parent.element
        })
        const index = listItems.indexOf(currentItem)
        this.$refs.listItems.internalLazyValue = index

        const listItemElement = this.$refs.listItems.items[index].$el;
        listItemElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      }
      else {
        this.$refs.listItems.internalLazyValue = null
      }
    }
  }
}
</script>
