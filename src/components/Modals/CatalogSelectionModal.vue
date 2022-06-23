<template>
  <v-dialog
    v-model="opened"
    persistent
    width="500"
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Select catalog
      </v-card-title>
      <v-card-text class="pa-4 text-center">
        <v-progress-circular
          v-if="isLoading"
          :size="50"
          color="primary"
          indeterminate
        ></v-progress-circular>
        <v-list v-else>
          <v-list-item-group
            v-model="selectedCatalog"
            class="text-left"
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
          :disabled="!selectedCatalog || isLoading"
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
    serverAddress: {
      type: String,
      default: '',
    }
  },
  async mounted() {
    this.isLoading = true
    this.catalogs = await this.fetchCatalogs(this.serverAddress)
    this.isLoading = false
  },
  data() {
    return {
      catalogs: [],
      selectedCatalog: null,
      isLoading: false,
      opened: true,
    }
  },
  methods: {
    async fetchCatalogs(serverAddress) {
      try {
        const responce = await fetchCatalogList(serverAddress)

        const isErrorResponce = responce.querySelector('Fault')
        if (isErrorResponce) {
          const error = isErrorResponce.querySelector('detail > Error')
          const errorMessage = error.getAttribute('Description')
          const errorCode = error.getAttribute('ErrorCode')
          throw new Error(`<b class="text-h6">Server returned error responce</b><br><b>Error code:</b> ${errorCode}<br><b>Error message:</b> ${errorMessage}`)
        }

        const rows = responce.querySelectorAll('root > row')
        return Array.from(rows).map(e => {
          return {
            name: e.querySelector('CATALOG_NAME').innerHTML,
            node: e,
          }
        })
      } catch (e) {
        this.$emit('cancel')
        if (e.message) {
          this.$errorModal.open(e.message)
        } else {
          this.$errorModal.open('<b class="text-h6">Unable to load catalog list from the provided server</b>')
        }
      }
    },
    cancel() {
      this.selectedCatalog = null
      this.$emit('cancel')
    },
    selectCatalog() {
      this.$emit('selectCatalog', this.selectedCatalog)
      this.selectedCatalog = null
    },
    close() {
      this.opened = false
    },
  }
}
</script>
