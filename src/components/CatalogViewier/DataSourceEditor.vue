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
      <h2>Edit DataSource</h2>
    </v-col>
    <v-col 
      cols=12
      md=10
      lg=8
      offset-md=1
      offset-lg=2
      offset=0
    >
      <v-card width="100%">
        <v-card-text>
          <v-col
            cols="12"
          >
            <v-text-field
              :value="dataSourceName"
              label="DataSource name"
              :rules="rules.required"
              dense
              clearable
              @change="setDataSourceName"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <v-text-field
              :value="dataSourceDescription"
              label="DataSource description"
              :rules="rules.required"
              dense
              clearable
              @change="setDataSourceDescription"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <v-text-field
              :value="url"
              label="Url"
              :rules="rules.required"
              dense
              clearable
              @change="setUrl"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <v-text-field
              :value="dataSourceInfo"
              label="DataSource info"
              :rules="rules.required"
              dense
              clearable
              @change="setDataSourceInfo"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <v-text-field
              :value="providerName"
              label="Provider name"
              :rules="rules.required"
              dense
              clearable
              @change="setProviderName"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <v-text-field
              :value="providerType"
              label="Provider type"
              :rules="rules.required"
              dense
              clearable
              @change="setProviderType"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <v-text-field
              :value="authenticationMode"
              label="Authentication mode"
              :rules="rules.required"
              dense
              clearable
              @change="setAuthenticationMode"
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
    const dataSourceName = this.element.querySelector('DataSourceName') ? this.element.querySelector('DataSourceName').innerHTML : '';
    const dataSourceDescription = this.element.querySelector('DataSourceDescription') ? this.element.querySelector('DataSourceDescription').innerHTML : '';
    const url = this.element.querySelector('URL') ? this.element.querySelector('URL').innerHTML : '';
    const dataSourceInfo = this.element.querySelector('DataSourceInfo') ? this.element.querySelector('DataSourceInfo').innerHTML : '';
    const providerName = this.element.querySelector('ProviderName') ? this.element.querySelector('ProviderName').innerHTML : '';
    const providerType = this.element.querySelector('ProviderType') ? this.element.querySelector('ProviderType').innerHTML : '';
    const authenticationMode = this.element.querySelector('AuthenticationMode') ? this.element.querySelector('AuthenticationMode').innerHTML : '';

    return {
      dataSourceName,
      dataSourceDescription,
      url,
      dataSourceInfo,
      providerName,
      providerType,
      authenticationMode,
      rules: {
        required: [
          value => !!value || 'Required.',
        ],
      },
    }
  },
  methods: {
    setDataSourceName(value) {
      if (value) {
        let dataSourceName = this.element.querySelector('DataSourceName');
        if (!dataSourceName) {
          dataSourceName = document.createElementNS(null, 'DataSourceName')
          this.element.appendChild(dataSourceName)
        }
        dataSourceName.innerHTML = value;
      } else {
        let dataSourceName = this.element.querySelector('DataSourceName');
        if (dataSourceName) this.element.removeChild(dataSourceName)
      }
      this.$emit('updateModel');
    },
    setDataSourceDescription(value) {
      if (value) {
        let dataSourceDescription = this.element.querySelector('DataSourceDescription');
        if (!dataSourceDescription) {
          dataSourceDescription = document.createElementNS(null, 'DataSourceDescription')
          this.element.appendChild(dataSourceDescription)
        }
        dataSourceDescription.innerHTML = value;
      } else {
        let dataSourceDescription = this.element.querySelector('DataSourceDescription');
        if (dataSourceDescription) this.element.removeChild(dataSourceDescription)
      }
      this.$emit('updateModel');
    },
    setUrl(value) {
      if (value) {
        let url = this.element.querySelector('URL');
        if (!url) {
          url = document.createElementNS(null, 'URL')
          this.element.appendChild(url)
        }
        url.innerHTML = value;
      } else {
        let url = this.element.querySelector('URL');
        if (url) this.element.removeChild(url)
      }
      this.$emit('updateModel');
    },
    setDataSourceInfo(value) {
      let dataSourceInfo = this.element.querySelector('DataSourceInfo');
      if (!dataSourceInfo) {
        dataSourceInfo = document.createElementNS(null, 'DataSourceInfo')
        this.element.appendChild(dataSourceInfo)
      }
      dataSourceInfo.innerHTML = value || '';
      this.$emit('updateModel');
    },
    setProviderName(value) {
      if (value) {
        let providerName = this.element.querySelector('ProviderName');
        if (!providerName) {
          providerName = document.createElementNS(null, 'ProviderName')
          this.element.appendChild(providerName)
        }
        providerName.innerHTML = value;
      } else {
        let providerName = this.element.querySelector('ProviderName');
        if (providerName) this.element.removeChild(providerName)
      }
      this.$emit('updateModel');
    },
    setProviderType(value) {
      if (value) {
        let providerType = this.element.querySelector('ProviderType');
        if (!providerType) {
          providerType = document.createElementNS(null, 'ProviderType')
          this.element.appendChild(providerType)
        }
        providerType.innerHTML = value;
      } else {
        let providerType = this.element.querySelector('ProviderType');
        if (providerType) this.element.removeChild(providerType)
      }
      this.$emit('updateModel');
    },
    setAuthenticationMode(value) {
      if (value) {
        let authenticationMode = this.element.querySelector('AuthenticationMode');
        if (!authenticationMode) {
          authenticationMode = document.createElementNS(null, 'AuthenticationMode')
          this.element.appendChild(authenticationMode)
        }
        authenticationMode.innerHTML = value;
      } else {
        let authenticationMode = this.element.querySelector('AuthenticationMode');
        if (authenticationMode) this.element.removeChild(authenticationMode)
      }
      this.$emit('updateModel');
    },
  }
}
</script>
