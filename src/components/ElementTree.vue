<template>
  <v-list dense nav>
    <v-list-item-group
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
      return this.xmlDoc.querySelector("Schema")
    },
  },
  methods: {
    openEditor(payload) {
      this.$emit('open-editor', payload)
    },
  }
}
</script>

<style>

</style>