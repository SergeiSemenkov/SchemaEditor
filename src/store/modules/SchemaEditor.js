const state = () => ({
  // Application state
  serverUrl: null,
  database: null,
  lastSavedSchema: null,
  filename: null,
  // Schema state
  timestamp: Date.now(),
  xmlDoc: null,
  validationErrors: [],
  // Editor state
  openedElement: null,
  openedElementFocusedAttribute: null,
  modelCursor: 0,
  initialSchemaState: {
    serverUrl: null,
    catalogName: null,
    schema: null,
  },
})

let modelHistory = [];
import { createXPathFromElement, getElementByXpath } from '../../utils/xPath'

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
  fileName(state) {
    return state.filename
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
  canRedo(state) {
    state.timestamp
    return modelHistory.length && state.modelCursor < modelHistory.length - 1;
  },
  canUndo(state) {
    state.timestamp
    return modelHistory.length && state.modelCursor > 0;
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
  },
  initialSchemaState(state) {
    return state.initialSchemaState
  }
}

// actions
const actions = {
  createNewSchema({ commit }) {
    commit('setSchema', {
      xmlDoc: document.implementation.createDocument(null, "Schema")
    });
  },
  openSchema({ commit, dispatch }, { xmlDoc }) {
    commit('setSchema', { xmlDoc });

    const serializer = new XMLSerializer
    const text = serializer.serializeToString(xmlDoc)
    commit('setLastSavedSchema', { serializedSchema: text })
    dispatch('updateModel', { element: null, action: 'openSchema' })
  },
  setValidationState({ commit }, { errorList }) {
    commit('setValidationErrors', { errorList });
  },
  setServerUrl({ commit }, { serverUrl }) {
    commit('setFilename', { fileName: null });
    commit('setServerUrl', { serverUrl });
  },
  setDatabase({ commit }, { databaseName }) {
    commit('setFilename', { fileName: null });
    commit('setDatabase', { databaseName });
  },
  openEditor({ commit }, { element, attribute }) {
    commit('setOpenedElement', { element, attribute })
  },
  closeEditor({ commit }) {
    commit('setOpenedElement', { element: null, attribute: null })
  },
  updateModel({ commit, state }, { element, action }) {
    let xPath = null
    if (element) {
      xPath = createXPathFromElement(element, state.xmlDoc)
    }

    modelHistory = modelHistory.slice(0, state.modelCursor + 1);

    const timestamp = Date.now();
    const currentModelId = modelHistory[modelHistory.length - 1] ? modelHistory[modelHistory.length - 1].id : -1;
    commit('setSchemaHistoryCursor', { position: currentModelId + 1 })
    
    
    const serializer = new XMLSerializer
    const xmlDocState = serializer.serializeToString(state.xmlDoc)
    
    modelHistory.push({
      id: currentModelId + 1,
      timestamp,
      xmlDocState: xmlDocState,
      action,
      xPath
    })
    
    commit('setTimestamp', { timestamp })
  },
  setLastSavedSchema({ commit }, { serializedSchema }) {
    commit('setLastSavedSchema', { serializedSchema })
  },
  undo({ commit, state, dispatch }) {
    const timestamp = Date.now();
    const currentState = modelHistory[state.modelCursor]
    
    commit('setSchemaHistoryCursor', { position: state.modelCursor - 1 })
    const id = modelHistory[state.modelCursor].id
    
    commit('setSchemaFromHistory', { id })
    if (currentState.action === 'editItem') {
      const newElement = getElementByXpath(currentState.xPath, state.xmlDoc).iterateNext();
      dispatch('openEditor', { element: newElement })
    } else {
      dispatch('closeEditor')
    }

    commit('setTimestamp', { timestamp })
  },
  redo({ commit, state, dispatch }) {
    const timestamp = Date.now()
    
    commit('setSchemaHistoryCursor', { position: state.modelCursor + 1 })
    const id = modelHistory[state.modelCursor].id
    
    commit('setSchemaFromHistory', { id })
    
    const currentState = modelHistory[state.modelCursor]
    if (currentState.action === 'editItem') {
      const newElement = getElementByXpath(currentState.xPath, state.xmlDoc).iterateNext();
      dispatch('openEditor', { element: newElement })
    } else {
      dispatch('closeEditor')
    }

    commit('setTimestamp', { timestamp })
  },
  setInitialSchemaState({ commit }, { schema, serverUrl, catalogName}) {
    commit('setInitialSchema', { 
      schema,
      serverUrl,
      catalogName
    })
  },
  setFilename({ commit }, { fileName }) {
    commit('setServerUrl', { serverUrl: null });
    commit('setDatabase', { databaseName: null });

    commit('setFilename', { fileName });
  }
}

// mutations
const mutations = {
  setSchema(state, { xmlDoc }) {
    state.xmlDoc = xmlDoc
    state.timestamp = Date.now()
  },
  setInitialSchema(state, { schema, serverUrl, catalogName }) {
    state.initialSchemaState.schema = schema
    state.initialSchemaState.serverUrl = serverUrl
    state.initialSchemaState.catalogName = catalogName
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
  setFilename(state, { fileName }) {
    state.filename = fileName
  },
  setOpenedElement(state, { element, attribute }) {
    state.openedElement = element
    state.openedElementFocusedAttribute = attribute
  },
  setTimestamp(state, { timestamp}) {
    state.timestamp = timestamp
  },
  setSchemaFromHistory(state, { id }) {
    const modelToRestore = modelHistory.find((entry) => entry.id === id);

    const parser = new DOMParser()
    const modelDoc = parser.parseFromString(modelToRestore.xmlDocState, "text/xml")

    state.xmlDoc = modelDoc
  },
  setSchemaHistoryCursor(state, { position }) {
    state.modelCursor = position
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}