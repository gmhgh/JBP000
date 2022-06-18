<template>
  <div class="wrapper">

    <div class="left-bottom">
      <widgets-panel v-model:config="config" />
    </div>


    <phylogenetic-tree v-model:config="config" v-model:data="data" />
  </div>

</template>

<script>
import PhylogeneticTree from "./phylogeneticTree/PhylogeneticTree.vue"
import WidgetsPanel from "./widgetsPanel/WidgetsPanel.vue"
import "/@js/patristic.js";
export default {
  name: "VisTool",
  props: {
    newick: { type: String },
    fileName: { type: String },
    id: { type: Number },
  },
  components: {
    PhylogeneticTree,
    WidgetsPanel
  },
  data() {
    return {
      config: {
        id: this.id,
        fileName: this.fileName,
        type: "cluster",
        layout: "horizontal",
        showLength: false,
        showTicklines: true,
        showLabel: false,
        zoomable: false,
        resize: true,
        resetZoom: true,
        expand: { x: 0, y: 0 },
        style: {
          fontsize: 10,
          leafsize: 5,
          leafstroke: 0.5,
        },
        sortBy: null,
        selected: [],
        maxDistance: 0,
        isSync: false,
        isFlip: false,
        isPatristic: false,
      },
      data: patristic.parseNewick(this.newick),
    }
  },
};
</script>
<style lang="scss" scoped >
.wrapper {
  height: 100%;
  position: relative;
}

.left-bottom {
  position: absolute;
  bottom: 0;
  width:100%
}
</style>