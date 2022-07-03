<template>
  <v-dialog
    v-model="opened"
    persistent
    fullscreen
  >
    <v-card class="d-flex flex-column" style="top: 64px; z-index: 100;">
      <v-toolbar
        dark
        color="primary"
        class="flex-grow-0 fixed-toolbar"
      >
        <v-toolbar-title>XML Editor</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          class="mr-2"
          @click="save"
        >
          Save
        </v-btn>
        <v-btn
          icon
          dark
          @click="callCloseAction"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="pt-5 flex-grow-1 h-full" ref="cardContent">
        <v-textarea
          v-model="xmlContent"
          ref="textArea"
        >
        </v-textarea>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  mounted() {
    const serializer = new XMLSerializer
    const xmlContent = serializer.serializeToString(this.element)
    this.xmlContent = xmlContent
    this.lastSavedElement = xmlContent
    this.expandTextArea();
    document.querySelector('html').style="overflow: hidden";
  },
  destroyed() {
    document.querySelector('html').style="";
  },
  data() {
    return {
      opened: true,
      xmlContent: '',
      lastSavedElement: '',
    }
  },
  props: {
    element: {
      type: Element,
      required: true,
    }
  },
  methods: {
    close() {
      this.opened = false
    },
    async expandTextArea() {
      await this.$nextTick();
      const textArea = this.$refs.textArea.$el.querySelector('textarea');
      textArea.style.height = textArea.scrollHeight + "px";
    },
    async save() {
      this.lastSavedElement = this.xmlContent
      this.$emit('saveElement', this.xmlContent);
    },
    async callCloseAction() {
      const { confirmed } = await this.checkChanges()
      if (confirmed) {
        this.$emit('close')
      }
    },
    async checkChanges() {
      return this.lastSavedElement !== this.xmlContent
        ? this.$confirmationModal.open()
        : { confirmed: true }
    },
  }
}
</script>
<style scoped>
.fixed-toolbar {
  position: fixed;
  top: 0;
  width: 100%;
}
</style>