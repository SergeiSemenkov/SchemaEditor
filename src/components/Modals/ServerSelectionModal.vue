<template>
  <v-dialog
    v-model="opened"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Select server address
      </v-card-title>
      <v-card-text class="pa-4">
        <v-text-field
          class="mx-4"
          v-model="serverAddress"
          label="XMLA server address"
        ></v-text-field>
        <v-divider></v-divider>
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
          :disabled="!serverAddress"
          @click="$emit('saveToServer', serverAddress)"
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
      serverAddress: process.env.NODE_ENV === "production" ? "../xmla" : 'https://ssemenkoff.dev/emondrian/xmla',
      opened: true,
    }
  },
  methods: {
    close() {
      this.opened = false
    }
  }
}
</script>
