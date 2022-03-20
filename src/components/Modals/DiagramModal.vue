<template>
  <v-dialog
    v-model="opened"
    persistent
    fullscreen
    width="500"
  >
    <v-card>
      <v-toolbar
        dark
        color="primary"
      >
        <v-toolbar-title>Diagram</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            icon
            dark
            @click="$emit('close')"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <VueDiagramEditor
        ref="diagram"
        v-if="showDiagram"
        :node-color="nodeColor"
        :node-deletable="() => false"
      >
        <pre slot="node" slot-scope="{ node }">
          <template v-if="node.id !== 'cube'">
            <svg style="position: absolute; left: 10%; width: 80%; top: 0">
              <template v-for="(hier, i) in  getHierarchyList(node.data)">
                <rect width=10000 height="30" :y="10 + i * 35" fill="green" :key="i">
                </rect>
                <text x=5 :y="20 + i * 35" font-size="7" :key="i" fill="#fff">
                  Hierarchy {{  hier.getAttribute('name') || 'with no name' }}
                </text>
                <text x=5 :y="35 + i * 35" font-size="7" :key="i" fill="#fff" font-weight="bold">
                  {{  hier.getAttribute('primaryKey') }}
                </text>
              </template>
            </svg>
          </template>
        </pre>
      </VueDiagramEditor>
    </v-card>
  </v-dialog>
</template>

<script>
import xmlDescriptionMixin from '../../mixins/xmlDescriptionMixin'
import VueDiagramEditor from 'vue-diagram-editor';
import 'vue-diagram-editor/dist/vue-diagram-editor.css';

export default {
  components: {
    VueDiagramEditor
  },
  props: {
    opened: {
      type: Boolean,
      default: false,
    },
    cube: {
      type: Element,
      required: true,
    },
  },
  mixins: [
    xmlDescriptionMixin
  ],
  data: () => ({
    showDiagram: false,
    nodes: {
    },
    links: {
    }
  }),
  watch: {
    async opened(newVal) {
      if (newVal) {
        this.parseSchema();
        await this.$nextTick();
        this.showDiagram = true;
        await this.$nextTick();
        this.init();
      }
    }
  },
  methods: {
    parseSchema() {
      const possibleElements = this.getElementsOfType("CubeDimension").filter(e => !e.abstract)
      const items = Array.from(this.cube.querySelectorAll(`:scope > ${possibleElements.join(', :scope >')}`))
      
      const foreignKeys = items.reduce((acc, e) => {
        const key = e.getAttribute('foreignKey')
        const storedVal = acc.find(e => e.key === key);
        if (storedVal) {
          storedVal.count = storedVal.count + 1;
        } else {
          acc.push({
            key,
            count: 1
          })
        }
        return acc
      }, []).sort((a, b) => b.count - a.count)

      this.nodes = []
      this.nodes.push({
        id: 'cube',
        title: `Cube: ${ this.cube.getAttribute('name') }`,
        size: {
          width: 200,
          height: 40 + 10 * foreignKeys.length
        },
        coordinates: {
          x: 200,
          y: 150
        },
        portsOut: {
        },
        portsIn: {
        }
      })
      

      let leftSide = 0;
      let rightSide = 0;
      let onLeftSide = true;
      for (let i = 0; i < foreignKeys.length; i++) {
        const el = foreignKeys[i];
        if (onLeftSide) {
          this.nodes[0].portsIn[`${el.key}`] = el.key
          leftSide += el.count

          if (leftSide > rightSide) onLeftSide = !onLeftSide;
        } else {
          this.nodes[0].portsOut[`${el.key}`] = el.key
          rightSide += el.count

          if (rightSide > leftSide) onLeftSide = !onLeftSide;
        }
      }

      items.sort((a, b) => {
        const aFK = foreignKeys.find((e) => e.key === a.getAttribute('foreignKey'))
        const bFK = foreignKeys.find((e) => e.key === b.getAttribute('foreignKey'))

        const aIndex = foreignKeys.indexOf(aFK)
        const bIndex = foreignKeys.indexOf(bFK)
        
        return aIndex - bIndex;
      })
      
      let leftSideHeight = 0;
      let rightSideHeight = 0;
      items.forEach((e, i) => {
        const elForeignKey = e.getAttribute('foreignKey')
        const hierarchies = this.getHierarchyList(e);
        let height = 30 + 40 * hierarchies.length;

        if (this.nodes[0].portsIn[elForeignKey]) {
          this.nodes.push({
            id: `dimension-${i}`,
            title: `${e.tagName}: ${ e.getAttribute('name') }`,
            size: {
              width: 150,
              height: height,
            },
            coordinates: {
              x: 0,
              y: 20 + leftSideHeight
            },
            portsOut: {
              [elForeignKey]: ''
            },
            data: e
          })

          this.links[`link-${i}`] = {
            id: `link-${i}`,
            start_id: `dimension-${i}`,
            start_port: elForeignKey,
            end_id: 'cube',
            end_port: elForeignKey
          }

          leftSideHeight += height + 20;
        } else if (this.nodes[0].portsOut[elForeignKey]) {
          this.nodes.push({
            id: `dimension-${i}`,
            title: `${e.tagName}: ${ e.getAttribute('name') }`,
            size: {
              width: 150,
              height: height,
            },
            coordinates: {
              x: 450,
              y: 20 + rightSideHeight
            },
            portsIn: {
              [elForeignKey]: ''
            },
            data: e
          })

          this.links[`link-${i}`] = {
            id: `link-${i}`,
            start_id: `cube`,
            start_port: elForeignKey,
            end_id: `dimension-${i}`,
            end_port: elForeignKey
          }

          rightSideHeight += height + 20;
        }
      });

    },
    init() {
      this.$refs.diagram.setModel({
        nodes: this.nodes,
        links: this.links
      });

      this.$refs.diagram.$refs.diagram.spz.zoomAtPoint(0.3, {x: 50, y: 50})
    },
    nodeColor() {
      return '#00f';
    },
    getHierarchyList(e) {
      const possibleElements = this.getElementsOfType("Hierarchy").filter(e => !e.abstract)
      const hierarchies = Array.from(e.querySelectorAll(`:scope > ${possibleElements.join(', :scope >')}`))
      return hierarchies
    }
  }
}
</script>
<style>
  .diagram-editor__wrapper {
    width: 100%;
    height: 100%;
  }

  .diagram-editor__wrapper svg {
    width: 100%;
    height: 100%;
  }

  g > svg > svg > text {
    font-size: 7px !important; 
  }
</style>