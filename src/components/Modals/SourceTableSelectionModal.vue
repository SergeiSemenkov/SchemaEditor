<template>
  <v-dialog
    v-model="opened"
    persistent
    width="1000"
  >
    <v-card>
      <v-card-title class="text-h5 primary lighten-1 white--text">
        Select source table
      </v-card-title>
      <v-card-text class="pt-5">
        <v-data-table
          :headers="headers"
          :items="rows"
          :items-per-page="10"
          :search="search"
          :item-class="getItemClass"
          :loading="rowsLoading"
          class="elevation-1"
          dense
        >
          <template v-slot:top>
            <v-text-field
              v-model="search"
              label="Search"
              class="mx-4"
            ></v-text-field>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn
              class="ma-2"
              @click="selectItem(item)"
            >
              Select
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="$emit('close')"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { fetchTableList } from '../../services/XmlaApi'

export default {
  props: {
    opened: {
      type: Boolean,
      default: false,
    },
    selectedAttributeValue: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      rowsLoading: false,
      search: '',
      headers: [
        {
          text: 'Catalog',
          align: 'start',
          value: 'tableCatalog',
          width: '15%',
        },
        {
          text: 'Schema',
          value: 'tableSchema',
          width: '15%',
        },
        {
          text: 'Name',
          value: 'tableName',
          width: '40%',
        },
        {
          text: 'Type',
          value: 'tableType',
          width: '20%'
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          width: '20%',
          align: 'start',
        },
      ],
      rows: [],
    }
  },
  watch: {
    async opened() {
      this.rowsLoading = true
      try {
        const serverAddress = this.$root.$children[0].serverUrl;
        const responce = await fetchTableList(serverAddress)

        const isErrorResponce = responce.querySelector('Fault')
        if (isErrorResponce) {
          const error = isErrorResponce.querySelector('detail > Error')
          const errorMessage = error.getAttribute('Description')
          const errorCode = error.getAttribute('ErrorCode')
          throw new Error(`<b class="text-h6">Server returned error responce</b><br><b>Error code:</b> ${errorCode}<br><b>Error message:</b> ${errorMessage}`)
        }

        const rows = Array.from(responce.querySelectorAll('row'))
        const parsedRows = rows.map((e) => {
          return {
            tableCatalog: e.querySelector('TABLE_CATALOG').innerHTML,
            tableSchema: e.querySelector('TABLE_SCHEMA').innerHTML,
            tableName: e.querySelector('TABLE_NAME').innerHTML,
            tableType: e.querySelector('TABLE_TYPE').innerHTML,
          }
        })
        this.rows = parsedRows
        this.rowsLoading = false
      } catch (e) {
        this.$emit('close')
        if (e.message) {
          this.$root.$emit('errorMessage', e.message)
        } else {
          this.$root.$emit('errorMessage', '<b class="text-h6">Unable to load table list from the provided server</b>')
        }
      }
    },
  },
  methods: {
    selectItem(item) {
      this.$emit('selectItem', item)
      this.$emit('close')
    },
    getItemClass(item) {
      if (item.tableName === this.selectedAttributeValue) {
        return 'green lighten-4'
      }
      return ''
    }
  }
}
</script>
