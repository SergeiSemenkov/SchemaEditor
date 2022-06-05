<template>
  <index-page
    v-if="openedEditor === null"
    @openEditor="openEditor"
  />
  <component v-else
    :is="openedEditorComponent"
    @close="openEditor(null)"
  />
</template>

<script>
import indexPage from './pages/Index.vue'
import catalogEditor from './pages/CatalogEditor.vue'
import schemaEditor from './pages/SchemaEditor.vue'

const AvailableEditors = {
  CatalogEditor: 'CatalogEditor',
  SchemaEditor: 'SchemaEditor',
};

export default {
  components: {
    indexPage,
  },
  data() {
    return {
      openedEditor: null,
      availableEditors: AvailableEditors,
    }
  },
  computed: {
    openedEditorComponent() {
      switch (this.openedEditor) {
        case AvailableEditors.CatalogEditor:
          return catalogEditor;
        case AvailableEditors.SchemaEditor:
          return schemaEditor;
        default:
          return null;
      }
    }
  },
  methods: {
    openEditor(editor) {
      this.openedEditor = editor;
    }
  }
}
</script>
