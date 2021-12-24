<template>
  <div @click.stop.prevent="trySetValue">
    {{ name }}
  </div>
</template>

<script>
export default {
  props: {
    dimension: {
      type: Element,
      required: true
    },
    timestamp: {
      type: Number,
      required: true,
    }
  },
  computed: {
    name() {
      return this.dimension.attributes.name.value
    },
  },
  methods: {
    trySetValue() {
      this.dimension.setAttribute('name', this.name + 'test')
      this.update()
    },
    update() {
      this.$emit('update')
    },
  }
}
</script>

<style>

</style>