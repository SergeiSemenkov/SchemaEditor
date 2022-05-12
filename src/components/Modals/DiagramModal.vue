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
                <rect width=10000 height="30" :y="10 + i * 35" :fill="colors['Hierarchy']" :key="`${hier.getAttribute('name')}_rect`">
                </rect>
                <text x=5 :y="20 + i * 35" font-size="7" :key="`${hier.getAttribute('name')}_label`" fill="#fff">
                  Hierarchy {{  hier.getAttribute('name') || 'with no name' }}
                </text>
                <text x=5 :y="35 + i * 35" font-size="7" :key="`${hier.getAttribute('name')}_pKey`" fill="#fff" font-weight="bold">
                  {{  hier.getAttribute('primaryKey') }}
                </text>
              </template>
            </svg>
          </template>
        </pre>
      </VueDiagramEditor>
      <div style="position: fixed; bottom: 20px; right: 20px; padding: 30px; border: 1px solid black; border-radius: 10px; background-color: white;">
        <div v-for="color in colorsDescriptions" :key="color[0]" style="padding: 5px;">
          <span :style="`display: inline-block; width: 15px; height: 15px; background-color: ${color[1]}; margin-right: 10px;`"></span>
          <span>{{ color[0] }}</span> 
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import xmlDescriptionMixin from '../../mixins/xmlDescriptionMixin'
import VueDiagramEditor from 'vue-diagram-editor';
import 'vue-diagram-editor/dist/vue-diagram-editor.css';

const colors = {
  Dimension: '#657ED4',
  VirtualCubeDimension: '#1E555C',
  DimensionUsage: '#550C18',
  Cube: '#0D0106',
  VirtualCube: '#3A2E39',
  Hierarchy: '#2BA84A',
  'Fact Table': '#95190C',
}

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
    },
    colors,
    colorsDescriptions: Object.entries(colors),
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
        const key = e.getAttribute('foreignKey') || 'Fact Table'
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
        title: `${this.cube.tagName}: ${ this.cube.getAttribute('name') }`,
        size: {
          width: 200,
          height: 40 + 10 * foreignKeys.length
        },
        coordinates: {
          x: 200,
          y: 150
        },
        data: this.cube,
        portsOut: {
        },
        portsIn: {
        }
      })
      

      let leftSide = 0;
      let rightSide = 0;
      let leftSideHeirarchies = 0;
      let rightSideHeirarchies = 0;
      let onLeftSide = true;
      for (let i = 0; i < foreignKeys.length; i++) {
        const el = foreignKeys[i];
        if (onLeftSide) {
          this.nodes[0].portsIn[`${el.key}`] = el.key
          leftSide += el.count
          leftSideHeirarchies++;

          if (leftSide > rightSide) onLeftSide = !onLeftSide;
        } else {
          this.nodes[0].portsOut[`${el.key}`] = el.key
          rightSide += el.count
          rightSideHeirarchies++;

          if (rightSide > leftSide) onLeftSide = !onLeftSide;
        }
      }

      this.nodes[0].size.height = 40 + 17 * Math.max(rightSideHeirarchies, leftSideHeirarchies);

      items.sort((a, b) => {
        const aFK = foreignKeys.find((e) => e.key === (a.getAttribute('foreignKey') || 'Fact Table'))
        const bFK = foreignKeys.find((e) => e.key === (b.getAttribute('foreignKey') || 'Fact Table'))

        const aIndex = foreignKeys.indexOf(aFK)
        const bIndex = foreignKeys.indexOf(bFK)
        
        return aIndex - bIndex;
      })
      
      let leftSideHeight = 0;
      let rightSideHeight = 0;
      items.forEach((e, i) => {
        const elForeignKey = e.getAttribute('foreignKey') || 'Fact Table'
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
    async init() {
      this.$refs.diagram.setModel({
        nodes: this.nodes,
        links: this.links
      });

      await this.$nextTick();
      this.$refs.diagram.$refs.diagram.spz.zoomAtPoint(0.3, {x: 50, y: 50})
      const diagram = this.$refs.diagram.$el;
      
      diagram.querySelectorAll('text').forEach((e) => {
        if (e.innerHTML.trim() === 'Fact Table') {
          e.setAttribute('fill', colors['Fact Table']);
        }
      })
      this.$refs.diagram.$refs.diagram.spz.setMinZoom(0.01)
    },
    nodeColor(node) {
      const nodeType = node.data.tagName
      console.log(nodeType);
      switch (nodeType) {
        case 'Dimension':
          return colors['Dimension'];
        case 'VirtualCubeDimension':
          return colors['VirtualCubeDimension'];
        case 'DimensionUsage':
          return colors['DimensionUsage'];
        case 'Cube':
          return colors['Cube'];
        case 'VirtualCube':
          return colors['VirtualCube'];
        default:
          return colors['Cube'];
      }
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

  svg > rect[fill-opacity] {
    fill-opacity: 0;
  }
</style>