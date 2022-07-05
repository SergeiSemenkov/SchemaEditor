<template>
  <v-dialog
    v-model="opened"
    persistent
    width="500"
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Confirm
      </v-card-title>
      <v-card-text>
        <p class="pt-6">
          {{ text }}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text
          @click="$emit('cancel')"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          text
          @click="$emit('continue')"
        >
          Continue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: 'Schema has unsaved changes. Are you sure you want to continue?',
    },
  },
  data() {
    return {
      opened: true
    }
  },
  methods: {
    close() {
      this.opened = false
    },
  }
}
</script>
