<template>
  <div>
    <div class="text-subtitle-1">{{ label }}</div>
    <v-radio-group
      v-model="model"
      @change="$emit('change', $event)"
      row
    >
      <v-radio
        v-for="(item, i) in items"
        :key="i"
        :label="item"
        :value="item"
      ></v-radio>
    </v-radio-group>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: 'none'
    },
    label: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
    },
  },
  data() {
    return {
      model: this.value
    }
  }
}
</script>
