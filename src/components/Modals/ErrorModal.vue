<template>
  <v-dialog
    v-model="opened"
    persistent
    width="500"
  >
    <v-card>
      <v-card-title class="text-h5 red lighten-1 white--text">
        Error occured
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
  data() {
    return {
      opened: true,
    }
  },
  props: {
    message: {
      type: String,
      default: 'Something went wrong'
    },
  },
  methods: {
    close() {
      this.opened = false
    },
  }
}
</script>
