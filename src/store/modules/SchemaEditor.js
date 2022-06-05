const state = () => ({
  // Application state
  serverUrl: null,
  database: null,
  lastSavedSchema: null,
  // Schema state
  timestamp: Date.now(),
  xmlDoc: null,
  validationErrors: [],
  // Editor state
  openedElement: null,
  openedElementFocusedAttribute: null,
})

// getters
const getters = {
  xmlDoc(state) {
    state.timestamp
    return state.xmlDoc
  },
  invalidElements(state) {
    const invalidElementsSet = new Set(state.validationErrors.map(e => e.element));
    return invalidElementsSet
  },
  serverUrl(state) {
    return state.serverUrl
  },
  loadedFrom (state) {
    return {
      serverUrl: state.serverUrl,
      catalogName: state.database
    }
  },
  updateTimestamp(state) {
    return state.timestamp
  },
  openedElement(state) {
    return state.openedElement
  },
  openedElementFocusedAttribute(state) {
    return state.openedElementFocusedAttribute
  },
  canSave(state) {
    return !!state.serverUrl && !!state.database
  },
  validationState(state) {
    return state.validationErrors
  },
  hasChanges(state) {
    state.timestamp
    if (!state.xmlDoc) return false

    const serializer = new XMLSerializer
    const schema = serializer.serializeToString(state.xmlDoc)

    if (schema !== state.lastSavedSchema) {
      return true
    }
    return false
  }
}

// actions
const actions = {
  createNewSchema({ commit }) {
    commit('setSchema', {
      xmlDoc: document.implementation.createDocument(null, "Schema")
    });
  },
  openSchema({ commit }, { xmlDoc }) {
    commit('setSchema', { xmlDoc });

    const serializer = new XMLSerializer
    const text = serializer.serializeToString(xmlDoc)
    commit('setLastSavedSchema', { serializedSchema: text })
  },
  setValidationState({ commit }, { errorList }) {
    commit('setValidationErrors', { errorList });
  },
  setServerUrl({ commit }, { serverUrl }) {
    commit('setServerUrl', { serverUrl });
  },
  setDatabase({ commit }, { databaseName }) {
    commit('setDatabase', { databaseName });
  },
  openEditor({ commit }, { element, attribute }) {
    commit('setOpenedElement', { element, attribute })
  },
  closeEditor({ commit }) {
    commit('setOpenedElement', { element: null, attribute: null })
  },
  updateModel({ commit }) {
    commit('setTimestamp', { timestamp: Date.now() })
  },
  setLastSavedSchema({ commit }, { serializedSchema }) {
    commit('setLastSavedSchema', { serializedSchema })
  }
}

// mutations
const mutations = {
  setSchema(state, { xmlDoc }) {
    state.xmlDoc = xmlDoc
    state.timestamp = Date.now()
  },
  setLastSavedSchema(state, { serializedSchema }) {
    state.lastSavedSchema = serializedSchema
  },
  setValidationErrors(state, { errorList }) {
    state.validationErrors = errorList
  },
  setServerUrl(state, { serverUrl }) {
    state.serverUrl = serverUrl
  },
  setDatabase(state, { databaseName }) {
    state.database = databaseName
  },
  setOpenedElement(state, { element, attribute }) {
    state.openedElement = element
    state.openedElementFocusedAttribute = attribute
  },
  setTimestamp(state, { timestamp}) {
    state.timestamp = timestamp
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}