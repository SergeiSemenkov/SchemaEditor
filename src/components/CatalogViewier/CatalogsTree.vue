<template>
  <v-list dense nav v-if="datasourceList">
    <v-list-item-group
      ref="listItems"
      color="primary"
    >
      <v-row class="align-center black--text py-1">
        <v-col cols=10 class="capitalize">
          DataSources
        </v-col>
         <!-- <v-col cols=2>
            <v-tooltip
              bottom
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="addNewItem"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
              <span>Add</span>
            </v-tooltip>
          </v-col> -->
      </v-row>
      <v-divider />
      <data-source-tree-item
        v-for="(i, idx) in datasourceList"
        :key="idx"
        :element="i"
        :timestamp="timestamp"
        :key-prop="`Datasource_${idx}`"
        @openItem="openItem"
        @updateModel="$emit('updateModel')"
        @removeItem="$emit('removeItem', $event)"
      />
    </v-list-item-group>
  </v-list>
</template>

<script>
import DataSourceTreeItem from './DataSourceTreeItem.vue'
export default {
  components: { DataSourceTreeItem },
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
    datasourceList () {
      this.timestamp
      return this.xmlDoc?.querySelectorAll("DataSources > DataSource")
    },
  },
  methods: {
    openItem(payload) {
      this.$emit('openItem', payload)
      this.updateEditorState(payload.element)
    },
    addNewItem() {
      const newEl = document.createElementNS(null, "DataSource");

      const catalogs = document.createElementNS(null, 'Catalogs');
      newEl.appendChild(catalogs);

      const datasourcesArray = this.xmlDoc.querySelector('DataSources');
      datasourcesArray.appendChild(newEl);

      this.$emit('updateModel');
    },
    async updateEditorState(currentItem) {
      if (currentItem !== null) {
        const listItems = this.$refs.listItems.items.map(i => i.$parent.element)
        const index = listItems.indexOf(currentItem)
        await this.$nextTick();
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
