export default function validate(schema, doc) {
  const errorList = []

  validateAttibutes(schema, doc)

  return errorList 
}

export function validateAttibutes (element, description) {
  const errorList = []

  description.attributes.forEach(attribute => {
    const attrValue = element.getAttribute(attribute.name)
    const required = attribute.required === 'true'
    if (required && !attrValue) {
      errorList.push({
        error: `Required attribute (${attribute.name}) is missing`,
        element: element,
        attribute: attribute.name
      })
    }
  });
  return errorList
}

export function validateObjects (element, description, getPossibleElementsFn) {
  const errorList = []

  description.objects.forEach(object => {
    const possibleElements = getPossibleElementsFn(object.type)
    const objectEl = element.querySelector(`:scope > ${possibleElements.join(', :scope >')}`)
    const required = object.required === 'true'

    if (required && !objectEl) {
      errorList.push({
        error: `Required child object (${object.name}) is missing`,
        element: element
      })
    }
  });
  return errorList
}
 