<template>
  <v-dialog
    v-model="opened"
    persistent
    width="500"
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Select catalog to load schema from
      </v-card-title>
      <v-card-text class="pa-4">
        <v-list>
          <v-list-item-group
            v-model="selectedCatalog"
            color="blue"
          >
            <v-list-item
              v-for="(catalog, idx) in catalogs"
              :key="idx"
              :value="catalog"
            >
              {{ catalog.name }}
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text
          @click="cancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          text
          :disabled="!selectedCatalog"
          @click="selectCatalog"
        >
          Select
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { fetchCatalogList } from '../../services/XmlaApi'

export default {
  props: {
    opened: {
      type: Boolean,
      default: false,
    },
    serverAddress: {
      type: String,
      default: '',
    }
  },
  watch: {
    async serverAddress(newVal) {
      if (newVal) {
        this.catalogs = await this.fetchCatalogs(newVal)
      }
    }
  },
  data() {
    return {
      catalogs: [],
      selectedCatalog: null,
    }
  },
  methods: {
    async fetchCatalogs(serverAddress) {
      const responce = await fetchCatalogList(serverAddress)
      const rows = responce.querySelectorAll('root > row')
      return Array.from(rows).map(e => {
        return {
          name: e.querySelector('CATALOG_NAME').innerHTML,
          node: e,
        }
      })
    },
    cancel() {
      this.selectedCatalog = null
      this.$emit('cancel')
    },
    selectCatalog() {
      this.$emit('selectCatalog', this.selectedCatalog)
      this.selectedCatalog = null
    }
  }
}
</script>

<style>

</style>