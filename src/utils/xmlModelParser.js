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

export function createXPathFromElement(elm, doc) { 
  var allNodes = doc.getElementsByTagName('*'); 
  for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
  { 
    if (elm.hasAttribute('id')) { 
      var uniqueIdCount = 0; 
      for (var n=0;n < allNodes.length;n++) { 
        if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
        if (uniqueIdCount > 1) break; 
      } 
      if ( uniqueIdCount == 1) { 
        segs.unshift('id("' + elm.getAttribute('id') + '")'); 
        return segs.join('/'); 
      } else { 
        segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
      } 
    } else if (elm.hasAttribute('class')) { 
      segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
    } else { 
      let i = 1
      for (let sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
        if (sib.localName == elm.localName)  i++; 
      } 
      segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
    }
  }
  return segs.length ? '/' + segs.join('/') : null; 
}