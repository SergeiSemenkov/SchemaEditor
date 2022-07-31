<template>
  <v-dialog
    v-model="opened"
    persistent
    width="500"
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Loading
      </v-card-title>
      <v-card-text class="pa-4 text-center">
        <v-progress-circular
          :size="50"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      opened: true,
    }
  },
  methods: {
    close() {
      this.opened = false
    },
  }
}
</script>
