<template>
  <v-row class="flex-wrap ma-4">
    <v-col 
      cols=12
      md=10
      lg=8
      offset-md=1
      offset-lg=2
      offset=0
    >
      <h2>Edit Catalog</h2>
    </v-col>
    <v-col 
      cols=12
      md=10
      lg=8
      offset-md=1
      offset-lg=2
      offset=0
    >
      <v-card>
        <v-card-text>
          <v-col
            cols="12"
          >
            <v-text-field
              :value="name"
              label="Name"
              :rules="rules.required"
              dense
              clearable
              @change="setName"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <v-text-field
              :value="definition"
              label="Definition file"
              :rules="rules.required"
              dense
              clearable
              @change="setDefinition"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <v-text-field
              :value="dataSourceInfo"
              label="Data source info"
              dense
              clearable
              @change="setDataSourceInfo"
            />
          </v-col>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    element: {
      type: Element,
      required: true
    },
  },
  data() {
    const definitionEl = this.element.querySelector('Definition');
    const definition = definitionEl ? definitionEl.innerHTML : '';

    const name = this.element.getAttributeNS(null, 'name') || '';

    const dataSourceInfoEl = this.element.querySelector('DataSourceInfo');
    const dataSourceInfo = dataSourceInfoEl ? dataSourceInfoEl.innerHTML : '';

    return {
      definition,
      name,
      dataSourceInfo,
      rules: {
        required: [
          value => !!value || 'Required.',
        ],
      },

    }
  },
  methods: {
    setDefinition(value) {
      if (value) {
        let definitionEl = this.element.querySelector('Definition');
        if (!definitionEl) {
          definitionEl = document.createElementNS(null, 'Definition')
          this.element.appendChild(definitionEl)
        }
        definitionEl.innerHTML = value;
      } else {
        let definitionEl = this.element.querySelector('Definition');
        if (definitionEl) this.element.removeChild(definitionEl)
      }
      this.$emit('updateModel');
    },
    setName(value) {
      if (value) {
        this.element.setAttributeNS(null, 'name', value)
      } else {
        this.element.removeAttributeNS(null, 'name')
      }
      this.$emit('updateModel');
    },
    setDataSourceInfo(value) {
      if (value) {
        let dataSourceInfoEl = this.element.querySelector('DataSourceInfo');
        if (!dataSourceInfoEl) {
          dataSourceInfoEl = document.createElementNS(null, 'DataSourceInfo')
          this.element.appendChild(dataSourceInfoEl)
        }
        dataSourceInfoEl.innerHTML = value;
      } else {
        let dataSourceInfoEl = this.element.querySelector('DataSourceInfo');
        if (dataSourceInfoEl) this.element.removeChild(dataSourceInfoEl)
      }
      this.$emit('updateModel');
    }
  }
}
</script>
