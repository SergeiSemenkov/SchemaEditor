export function parseXmlModel(model) {
  const jsObjectModel = {}
  const elementsArray = model.querySelectorAll('Model > Element')
  // const classesArray = model.querySelectorAll('Model > Class')

  elementsArray.forEach(element => {
    const key = element.getAttribute('type')
    jsObjectModel[key] = {
      attributes: getAttributesForElement(element),
      arrays: getArraysForElements(element),
      objects: getObjectsForElements(element),
      doc: element.querySelector('Doc')?.innerHTML,
      hasValue: !!element.querySelector('CData'),
      abstract: element.getAttribute('abstract') === 'true'
    }
  });

  elementsArray.forEach(element => {
    const key = element.getAttribute('type')
    const parentClass = element.getAttribute('class')

    if (parentClass) {
      jsObjectModel[key].parent = jsObjectModel[parentClass]
      jsObjectModel[key].parentClassName = parentClass
    }

    jsObjectModel[key].isInstanceOf = (type) => {
      if (type === key) {
        return true
      }
      if (jsObjectModel[key].parent) {
        return jsObjectModel[key].parent.isInstanceOf(type)
      }
      return false
    }
  })

  window.model = jsObjectModel
  return jsObjectModel
}

function getAttributesForElement (element) {
  const parsedAttrs = []
  const elAttributes = element.querySelectorAll("Attribute")

  elAttributes.forEach(attr => {
    const attrs = attr.getAttributeNames()
    
    const parsed = {}
    attrs.forEach((a) => {
      parsed[a] = attr.getAttribute(a)
      parsed.doc = attr.querySelector('Doc')?.innerHTML

      if (attr.querySelector('Value')) {
        const values = Array.from(attr.querySelectorAll('Value')).map((e) => e.innerHTML)
        parsed.values = values
      }

      if (attr.querySelector('Reference')) {
        const refs = Array.from(attr.querySelectorAll('Reference')).map((e) => {
          return {
            xPath: e.getAttribute('xPath'),
            attribute: e.getAttribute('attribute')
          }
        })
        parsed.references = refs
      }
    })
    
    parsedAttrs.push(parsed)
  })

  return parsedAttrs
}

function getArraysForElements (element) {
  const parsedArrays = []
  const elArrays = element.querySelectorAll("Array")

  elArrays.forEach((array, i) => {
    const attrs = array.getAttributeNames()
    const parsed = {}
    attrs.forEach((a) => {
      parsed[a] = array.getAttribute(a)
    })

    parsed.index = i
    parsedArrays.push(parsed)
  })

  return parsedArrays
}

function getObjectsForElements (element) {
  const parsedObjs = []
  const elObjs = element.querySelectorAll("Object")

  elObjs.forEach((obj, i) => {
    const attrs = obj.getAttributeNames()
    const parsed = {}
    attrs.forEach((a) => {
      parsed[a] = obj.getAttribute(a)
    })

    parsed.index = i
    parsedObjs.push(parsed)
  })

  return parsedObjs
}
