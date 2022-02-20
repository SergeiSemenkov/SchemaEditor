<template>
  <v-dialog
    v-model="opened"
    width="500"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Remove element
      </v-card-title>
       <v-card-text class="pa-4">
        Are you sure you want to remove the element?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="$emit('close')"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          text
          @click="$emit('confirm')"
        >
          Remove
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    opened: {
      type: Boolean,
      default: false,
    }
  }
}
</script>
