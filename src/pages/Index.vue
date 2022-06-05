<template>
  <v-app>
    <v-app-bar
      app
      clipped-left
      color="primary"
      dark>
      <v-toolbar-title>eMondrian Editors</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container fill-height>
        <v-row justify="center">
          <v-spacer />
          <v-col>
            <v-btn
              flex justify="center" align="center" style="height: auto;" class="py-10 px-5"
              @click="$emit('openEditor', availableEditors.CatalogEditor)"
            >
              <div>
                <v-icon x-large v-text="'mdi-folder-edit'"></v-icon>
                <div class="mt-3 text-h6">Catalog Editor</div>
              </div>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              flex justify="center" align="center" style="height: auto;" class="py-10 px-5"
              @click="$emit('openEditor', availableEditors.SchemaEditor)"
            >
              <div>
                <v-icon x-large v-text="'mdi-file-document-outline'"></v-icon>
                <div class="mt-3 text-h6">Schema Editor</div>
              </div>
            </v-btn>
          </v-col>
          <v-spacer />
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
const AvailableEditors = {
  CatalogEditor: 'CatalogEditor',
  SchemaEditor: 'SchemaEditor',
};

export default {
  data() {
    return {
      availableEditors: AvailableEditors
    }
  }
}
</script>
