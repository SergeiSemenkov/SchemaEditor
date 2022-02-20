<template>
  <v-dialog
    v-model="opened"
    persistent
    width="500"
  >
    <v-card>
      <v-card-title class="text-h5 green lighten-1 white--text">
        Success
      </v-card-title>
      <v-card-text>
        <p class="pt-6" v-html="message">
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="$emit('close')"
        >
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: 'Schema was successfully savedd'
    },
    opened: {
      type: Boolean,
      default: false,
    }
  }
}
</script>
