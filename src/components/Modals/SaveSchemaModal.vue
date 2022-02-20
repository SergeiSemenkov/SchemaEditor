<template>
  <v-dialog
    v-model="opened"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Save schema
      </v-card-title>
      <v-card-text class="pa-4">
        <v-tabs
          v-model="tab"
        >
          <v-tab href="#server">Save to server</v-tab>
          <v-tab href="#local">Save to local file</v-tab>
        </v-tabs>
        <v-row>
          <v-col>
            <v-tabs-items v-model="tab">
              <v-tab-item :value="'server'">
                <v-card-title>
                  Save schema to server
                </v-card-title>
                <!-- <template v-if="loadedFromServer">
                  <p class="ml-4">
                    This schema was loaded from server
                  </p>
                  <v-checkbox
                    class="ml-4"
                    v-model="saveToSamePlace"
                    label="Save to the same place it's been loaded from"
                  />
                </template> -->
                <v-text-field
                  class="mx-4"
                  v-model="serverAddress"
                  label="XMLA server address"
                ></v-text-field>
                <v-divider></v-divider>
              </v-tab-item>
              <v-tab-item :value="'local'">
                <v-card-title>
                  Download schema as xml file to your filesystem
                </v-card-title>
                <v-divider></v-divider>
              </v-tab-item>
            </v-tabs-items>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text
          @click="close"
        >
          Cancel
        </v-btn>
        <v-btn
          text
          color="primary"
          :disabled="!canContinue"
          @click="saveSchema"
        >
          Continue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      serverAddress: this.serverUrl || process.env.NODE_ENV === "production" ? "../xmla" : 'https://ssemenkoff.dev/emondrian/xmla',
      schemaFile: null,
      tab: null,
      saveToSamePlace: true,
    }
  },
  props: {
    opened: {
      type: Boolean,
      default: false,
    },
    loadedFromServer: {
      type: Boolean,
      default: false,
    },
    serverUrl: {
      type: String,
    }
  },
  watch: {
    serverUrl() {
      this.serverAddress = this.serverUrl || (process.env.NODE_ENV === "production" ? "../xmla" : 'https://ssemenkoff.dev/emondrian/xmla')
    }
  },
  computed: {
    canContinue() {
      if (this.tab === 'local') {
        return true
      } else if (this.tab === 'server') {
        if (this.loadedFromServer && this.saveToSamePlace) {
          return true
        } else {
          return !!this.serverAddress
        }
      }
      return false
    },

  },
  methods: {
    close() {
      this.$emit('close')
      this.saveToSamePlace = false
      this.serverAddress = this.serverUrl || (process.env.NODE_ENV === "production" ? "../xmla" : 'https://ssemenkoff.dev/emondrian/xmla'),
      this.schemaFile = null
      this.tab = null
    },
    saveSchema() {
      if (this.tab === 'server') {
        if (this.loadedFromServer && this.saveToSamePlace) {
          this.$emit('saveToServer', null)
        } else {
          this.$emit('saveToServer', this.serverAddress)
        }
        this.close()
      } else if (this.tab === 'local') {
        this.$emit('saveToLocal', this.schemaFile)
        this.close()
      }
    }
  }
}
</script>
