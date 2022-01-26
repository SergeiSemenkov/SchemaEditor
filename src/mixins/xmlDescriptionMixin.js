let descriptions = new Map();
export default {
  methods: {
    loadDescription(jsObjectModel) {
      descriptions = new Map()
      Object.entries(jsObjectModel).forEach((pair) => {
        descriptions.set(pair[0], pair[1])
      })
    },
    getDescriptionForElement(type) {
      const desc = descriptions.get(type)
      return this.getMergedDescription(desc)
    },
    getMergedDescription(desc) {
      const mergedDesc = {
        attributes: [],
        arrays: [],
        objects: [],
        doc: desc.doc,
        hasValue: desc.hasValue
      }

      mergedDesc.attributes.push(...desc.attributes)
      mergedDesc.arrays.push(...desc.arrays)
      mergedDesc.objects.push(...desc.objects)


      if (desc.parent) {
        mergedDesc.parentClassName = desc.parentClassName

        const parentDesc = this.getMergedDescription(desc.parent)

        // Merge attributes
        parentDesc.attributes.forEach((e) => {
          const alreadyExist = mergedDesc.attributes.find((attribute) => {
            return attribute.name  === e.name 
          })
          
          if (!alreadyExist) {
            mergedDesc.attributes.push(e)
          }
        })
        
        // Merge arrays
        parentDesc.arrays.forEach((e) => {
          const alreadyExist = mergedDesc.arrays.find((array) => {
            return array.name  === e.name 
          })
          
          if (!alreadyExist) {
            mergedDesc.arrays.push(e)
          }
        })

        // Merge objects
        parentDesc.objects.forEach((e) => {
          const alreadyExist = mergedDesc.objects.find((object) => {
            return object.name  === e.name 
          })
          
          if (!alreadyExist) {
            mergedDesc.objects.push(e)
          }
        })
      }

      return mergedDesc
    },
    getElementsOfType(type) {
      const result = []
      descriptions.forEach((val, key) => {
        if (val.isInstanceOf(type) && !val.abstract) {
          result.push(key)
        }
      })
      return result
    }
  }
}
