import DiscoverCatalogs from './XmlRequests/DiscoverCatalogs.xml'
import DiscoverMetadata from './XmlRequests/DiscoverSchema.xml'
import SaveMetadata from './XmlRequests/SaveSchema.xml'
import DiscoverDatabases from './XmlRequests/DiscoverDatabases.xml'
import SaveDatabase from './XmlRequests/SaveDatabase.xml'
import DiscoverSourceTables from './XmlRequests/DiscoverSourceTables.xml'

export function fetchCatalogList(url) {
  let resFn, rejFn
  const resultPromise = new Promise((res, rej) => {
    resFn = res;
    rejFn = rej;
  })

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  xhr.setRequestHeader("Content-type", "text/xml");

  xhr.onload = function () {
    const response = xhr.responseXML
    resFn(response)
  };

  xhr.onerror = function (e) {
    rejFn({ progressEvent: e, request: xhr })
  }
  xhr.send(DiscoverCatalogs);

  return resultPromise
}

export function fetchSchemaForCatalog(url, catalog) {
  let resFn, rejFn
  const resultPromise = new Promise((res, rej) => {
    resFn = res;
    rejFn = rej;
  })

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  xhr.setRequestHeader("Content-type", "text/xml");

  xhr.onload = function () {
    const response = xhr.responseXML
    resFn(response)
  };

  xhr.onerror = function (e) {
    rejFn(e)
  }

  const data = DiscoverMetadata.replace(/{{ DatabaseID }}/gm, catalog)
  xhr.send(data);

  return resultPromise
}

export function saveSchemaToCatalog(url, catalog, schema) {
  let resFn, rejFn
  const resultPromise = new Promise((res, rej) => {
    resFn = res;
    rejFn = rej;
  })

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  xhr.setRequestHeader("Content-type", "text/xml");

  xhr.onload = function () {
    const response = xhr.responseXML
    resFn(response)
  };

  xhr.onerror = function (e) {
    rejFn(e)
  }

  const data = SaveMetadata.replace(/{{ DatabaseID }}/gm, catalog).replace(/{{ Schema }}/gm, schema)
  xhr.send(data);

  return resultPromise
}

export function fetchTableList(url) {
  let resFn, rejFn
  const resultPromise = new Promise((res, rej) => {
    resFn = res;
    rejFn = rej;
  })

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  xhr.setRequestHeader("Content-type", "text/xml");

  xhr.onload = function () {
    const response = xhr.responseXML
    resFn(response)
  };

  xhr.onerror = function (e) {
    rejFn({ progressEvent: e, request: xhr })
  }
  xhr.send(DiscoverSourceTables);

  return resultPromise
}


export function fetchDatabasesList(url) {
  let resFn, rejFn
  const resultPromise = new Promise((res, rej) => {
    resFn = res;
    rejFn = rej;
  })

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  xhr.setRequestHeader("Content-type", "text/xml");

  xhr.onload = function () {
    const response = xhr.responseXML
    resFn(response)
  };

  xhr.onerror = function (e) {
    rejFn({ progressEvent: e, request: xhr })
  }
  xhr.send(DiscoverDatabases);

  return resultPromise
}

export function saveDatabase(url, database) {
  let resFn, rejFn
  const resultPromise = new Promise((res, rej) => {
    resFn = res;
    rejFn = rej;
  })

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  xhr.setRequestHeader("Content-type", "text/xml");

  xhr.onload = function () {
    const response = xhr.responseXML
    resFn(response)
  };

  xhr.onerror = function (e) {
    rejFn(e)
  }

  const data = SaveDatabase.replace(/{{ Database }}/gm, database)
  xhr.send(data);

  return resultPromise
}
