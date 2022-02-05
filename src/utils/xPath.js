export function getElementByXpath(path, doc) {
  return doc.evaluate(path, doc, null, XPathResult.ANY_TYPE, null);
}

export function getElementByXpathRelative(path, doc, element) {
  const xPathBase = createXPathFromElement(element, doc)

  const XPathRes = doc.evaluate(`${xPathBase}${path}`, doc, null, XPathResult.ANY_TYPE, null);
  const result = []

  let node = XPathRes.iterateNext();
  while (node) {
    result.push(node)
    node = XPathRes.iterateNext();
  }

  return result
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
        segs.unshift(elm.localName + '[@id="' + elm.getAttribute('id') + '"]'); 
      } 
    } else if (elm.hasAttribute('class')) { 
      segs.unshift(elm.localName + '[@class="' + elm.getAttribute('class') + '"]'); 
    } else { 
      let i = 1
      for (let sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
        if (sib.localName == elm.localName)  i++; 
      } 
      segs.unshift(elm.localName + '[' + i + ']'); 
    }
  }
  return segs.length ? '/' + segs.join('/') : null; 
}