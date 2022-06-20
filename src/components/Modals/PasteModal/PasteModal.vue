<template>
  <v-dialog
    v-model="opened"
    persistent
    width="500"
  >
    <v-card>
      <v-card-title class="text-h5">
        Paste Item
      </v-card-title>
      <v-card-text>
        <v-textarea v-model="xml"></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          :disabled="!xml"
          @click="$emit('paste', xml)"
        >
          Paste
        </v-btn>
        <v-btn
          color="error"
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
export default {
  data() {
    return {
      opened: true,
      xml: '',
    }
  },
  methods: {
    close() {
      this.opened = false
    },
  }
}
</script>
