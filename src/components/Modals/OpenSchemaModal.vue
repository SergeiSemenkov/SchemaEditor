<template>
  <v-dialog
    v-model="opened"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Open schema
      </v-card-title>
      <v-card-text class="pa-4">
        <v-tabs
          v-model="tab"
        >
          <v-tab href="#server">Open from server</v-tab>
          <v-tab href="#local">Open from local file</v-tab>
        </v-tabs>
        <v-row>
          <v-col>
            <v-tabs-items v-model="tab">
              <v-tab-item :value="'server'">
                <v-card-title>
                  Load schema from server
                </v-card-title>
                <v-text-field
                  class="mx-4"
                  v-model="serverAddress"
                  label="Enter server address"
                ></v-text-field>
                <v-divider></v-divider>
              </v-tab-item>
              <v-tab-item :value="'local'">
                <v-card-title>
                  Upload a schema file
                </v-card-title>
                <v-file-input
                  v-model="schemaFile"
                  class="mx-4"
                  accept=".xml"
                  label="Select schema"
                ></v-file-input>
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
          @click="$emit('close')"
        >
          Cancel
        </v-btn>
        <v-btn
          text
          color="primary"
          :disabled="!canContinue"
          @click="openSchema"
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
      serverAddress: null || 'https://ssemenkoff.dev/emondrian/xmla',
      schemaFile: null,
      tab: null,
    }
  },
  props: {
    opened: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    canContinue() {
      return (this.tab === 'server' && !!this.serverAddress) || (this.tab === 'local' && !!this.schemaFile)
    }
  },
  methods: {
    openSchema() {
      if (this.tab === 'server') {
        this.$emit('openFromServer', this.serverAddress)
        this.$emit('close')
      } else if (this.tab === 'local') {
        this.$emit('openFromLocal', this.schemaFile)
        this.$emit('close')
      }
    }
  }
}
</script>
