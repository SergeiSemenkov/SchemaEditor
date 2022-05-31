<template>
  <v-dialog
    v-model="opened"
    persistent
    fullscreen
  >
    <v-card v-if="opened">
      <v-toolbar
        dark
        color="primary"
      >
        <v-toolbar-title>Diagram</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            text
            class="mx-2"
            @click="saveDatasources"
          >
            Save
          </v-btn>
          <v-btn
            icon
            dark
            @click="$emit('close')"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-navigation-drawer
        app
        permanent
        clipped
        width="400"
      >
        <catalogs-tree
          ref="elementTree"
          v-if="xmlDoc"
          :xmlDoc="xmlDoc"
          :timestamp="updateTimestamp"
          @openItem="openItem"
          @updateModel="updateModel"
          @removeItem="removeElement"
        />
      </v-navigation-drawer>
      <v-row style="margin-left: 400px;">
        <v-col>
          <catalogs-editor
            v-if="activeItemType === 'Catalog'"
            :element="openedItem"
            :key="openedItemKey"
            @updateModel="updateModel"
          />
          <data-source-editor
            v-if="activeItemType === 'DataSource'"
            :element="openedItem"
            :key="openedItemKey"
            @updateModel="updateModel"
          />
        </v-col>
      </v-row>
    </v-card>
    <SuccessModal
      :message="successMessage"
      :opened="successDialogOpened"
      @close="successDialogOpened = false"
    />
  </v-dialog>
</template>

<script>
import { fetchDatabasesList, saveDatabase } from '../../services/XmlaApi'
import CatalogsTree from '../CatalogViewier/CatalogsTree.vue'
import CatalogsEditor from '../CatalogViewier/CatalogsEditor.vue'
import DataSourceEditor from '../CatalogViewier/DataSourceEditor.vue'
import SuccessModal from '../Modals/SuccessModal.vue'

export default {
  props: {
    opened: {
      type: Boolean,
      default: false,
    }
  },
  components: {
    CatalogsTree,
    CatalogsEditor,
    DataSourceEditor,
    SuccessModal,
  },
  data() {
    return {
      xmlDoc: null,
      updateTimestamp: Date.now(),
      openedItem: null,
      openedItemKey: null,
      serverUrl: 'https://ssemenkoff.dev/emondrian/xmla',
      successDialogOpened: false,
      successMessage: '',
    };
  },
  async mounted() {
    try {
      const metadata = await fetchDatabasesList(this.serverUrl);

      const isErrorResponce = metadata.querySelector('Fault')
      if (isErrorResponce) {
        const error = isErrorResponce.querySelector('detail > Error')
        const errorMessage = error.getAttribute('Description')
        const errorCode = error.getAttribute('ErrorCode')
        throw new Error(`<b class="text-h6">Server returned error responce</b><br><b>Error code:</b> ${errorCode}<br><b>Error message:</b> ${errorMessage}`)
      }

      const databasesSchema = metadata.querySelector('row > METADATA').childNodes[0]
      const parser = new DOMParser()
      this.xmlDoc = parser.parseFromString(databasesSchema.wholeText, "text/xml")
    } catch (e) {
      if (e.message) {
        this.$root.$emit('errorMessage', e.message)
      } else {
        this.$root.$emit('errorMessage', '<b class="text-h6">Unable to load schema from the provided server</b>')
      }
    }
  },
  methods: {
    openItem(item) {
      this.openedItem = item.element;
      this.openedItemKey = item.key;
    },
    updateModel() {
      console.log('Update model')
      this.updateTimestamp = Date.now();
    },
    removeElement(element) {
      if (this.openedItem === element) {
        this.openedItem = null;
        this.openedItemKey = null;
      }
      element.parentNode.removeChild(element);
      this.updateModel();
    },
    async saveDatasources() {
      const validationResult = this.validateDatabaseXml(this.xmlDoc);
      if (!validationResult) {
        this.$root.$emit('errorMessage', 'Could not save DataSource. Configured data is not valid.');
        return;
      }

      const serializer = new XMLSerializer
      const database = serializer.serializeToString(this.xmlDoc)

      const databaseEncoded = database
        .replaceAll('&', '&#38;')
        .replaceAll('<', '&#60;')
        .replaceAll('>', '&#62;')
        .replaceAll('"', '&#34;')
        .replaceAll('\'', '&#39;')
        .replaceAll('\t', '&#9;')
        .replaceAll('\n', '&#10;')
        .replaceAll('\r', '&#13;')
      try {
        const saveResponce = await saveDatabase(this.serverUrl, databaseEncoded)

        const isErrorResponce = saveResponce.querySelector('Fault')
        if (isErrorResponce) {
          const error = isErrorResponce.querySelector('detail > Error')
          const errorMessage = error.getAttribute('Description')
          const errorCode = error.getAttribute('ErrorCode')
          throw new Error(`<b class="text-h6">Server returned error responce</b><br><b>Error code:</b> ${errorCode}<br><b>Error message:</b> ${errorMessage}`)
        }

        const successResponce = saveResponce.querySelector('ExecuteResponse')
        if (successResponce) {
          this.successMessage = `<b class="text-h6">Database was succesfully saved</b>`
          this.successDialogOpened = true
        } else {
          throw new Error('<b class="text-h6">Something went wrong while saving database to the server</b>')
        }
      } catch (e) {
        if (e.message) {
          this.$root.$emit('errorMessage', e.message)
        } else {
          this.$root.$emit('errorMessage', '<b class="text-h6">Unable to save database to the provided server</b>')
        }
      }
    },
    validateDatabaseXml(xml) {
      let valid = true;

      xml.querySelectorAll('Catalog').forEach((e) => {
        if (!e.querySelector('Definition')) valid = false;
        if (!e.getAttributeNS(null, 'name')) valid = false;
      })

      xml.querySelectorAll('DataSource').forEach((e) => {
        if (!e.querySelector('DataSourceName')) valid = false;
        if (!e.querySelector('DataSourceDescription')) valid = false;
        if (!e.querySelector('URL')) valid = false;
        if (!e.querySelector('DataSourceInfo')) valid = false;
        if (!e.querySelector('ProviderName')) valid = false;
        if (!e.querySelector('ProviderType')) valid = false;
        if (!e.querySelector('AuthenticationMode')) valid = false;
      })

      return valid;
    }
  },
  computed: {
    activeItemType() {
      return this.openedItem?.tagName;
    }
  },
}
</script>
