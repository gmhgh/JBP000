<template>
  <DraggableDiv v-show="treeConfig.config!=null" />
  <div id="tooltip"></div>
  <div id="tool-header">
    <tool-header @addGridItem="addGridItem" />
  </div>
  <div id="tool-body">
    <grid-layout v-model:layout="layout" :responsive-layouts="layout" :col-num="colNum" :row-height="100"
      :is-draggable="draggable" :is-resizable="resizable" :responsive="responsive" :vertical-compact="true"
      :use-css-transforms="true">
      <grid-item v-for="item in layout" :key="item.i" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i">
        <div class="content_container">
          <div class="content_header">
            <span class="icon">
              <fa :icon="['fas', 'ellipsis-vertical']" color="grey" />
            </span>
            <span class="center" v-on:mouseover="mouseover" v-on:mouseleave="mouseleave">
              {{ item.data.fileName? (item.i + " - " + item.data.fileName): ""}}
            </span>
            <span class="remove" @click="removeGridItem(item.i)">
              <fa :icon="['fas', 'xmark']" />
            </span>
          </div>
          <div class="content_body">
            <upload-newick v-if="!item.data.fileString" v-model:data="item.data" />
            <vis-tool v-if="item.data.fileString" v-model:newick="item.data.fileString" :fileName="item.data.fileName"
              :id="item.i" />
          </div>
        </div>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script setup>
import { GridLayout, GridItem } from "vue3-grid-layout";
import VisTool from "/@cp/visTool/VisTool.vue";
import UploadNewick from "/@cp/upload/UploadNewick.vue";
import ToolHeader from "/@cp/ToolHeader.vue";
import DraggableDiv from "/@cp/draggableDiv/DraggableDiv.vue";
import { watch, onMounted, ref, reactive, provide } from "vue";

const global = reactive({
  sortBy: null,
  selected: [],
  state: {
    0: {
      isSync: false,
      maxDistance: 0,
      updateDistance: true,
    }
  },
  globalMaxDistance: 0,
  isPatristic: null,
});

const treeConfig = reactive({
  config: null
});

provide("global", global);
provide("treeConfig", treeConfig);


watch(
  () => global.state,
  (curr, _) => {
    let filtered = Object.fromEntries(Object.entries(curr).filter(([k, v]) => v.isSync)); //obj
    if (Object.keys(filtered).length) {
      let flag = Object.values(filtered).map(el => el.updateDistance).every(el => el);
      if (flag) {
        global.globalMaxDistance = Math.max(...Object.values(filtered).map(el => el.maxDistance));
      }
    }
  },
  { deep: true }
);


const width = 8;
const height = 4;

const layout = reactive([
  {
    x: 0,
    y: 0,
    w: width,
    h: height,
    i: 0,
    data: { fileString: null, fileName: null },
  },
]);

const draggable = ref(false);
const resizable = ref(true);
const responsive = ref(false);
const colNum = 24;
const index = ref(null);

onMounted(() => {
  index.value = layout.length;
});



const mouseover = () => {
  draggable.value = true;
};

const mouseleave = () => {
  draggable.value = false;
};

const addGridItem = () => {
  // Add a new item. It must have a unique key!
  let d = {
    x: (layout.length * width) % (colNum || 12),
    y: layout.length + (colNum || 12), // puts it at the bottom
    w: width,
    h: height,
    i: index.value,
    data: { fileString: null, fileName: null },
  };
  // console.log(d);
  layout.push(d);
  // Increment the counter to ensure key is always unique.
  global.state[index.value] = {
    isSync: false,
    maxDistance: 0,
  };
  index.value++;
};

const removeGridItem = (val) => {
  const index = layout.map((item) => item.i).indexOf(val);
  delete global.state[val];
  if (!global.state.length) {
    global.sortBy = null;
    global.selected = [];
    treeConfig.config = null;
  }
  layout.splice(index, 1);
};
</script>

<style lang="scss" scoped>
$content_header_height: 20px;

.layoutJSON {
  background: #ddd;
  border: 1px solid black;
  margin-top: 10px;
  padding: 10px;
}

.columns {
  -moz-columns: 120px;
  -webkit-columns: 120px;
  columns: 120px;
}

/*************************************/
.content_container {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.content_header {
  height: $content_header_height;
  // background: #eee;
  border-bottom: 1px solid;
}

.content_body {
  flex-grow: 1;
  padding: 5px;
  // background-color: aquamarine;
}

.icon {
  position: absolute;
  top: 2px;
  left: 5px;
}

.remove {
  position: absolute;
  top: 2px;
  right: 6px;
  cursor: pointer;
}

.center {
  text-align: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: auto;
  height: $content_header_height;
  width: 100%;
}

.vue-grid-layout {
  background: #f4f6f7;
}

.vue-grid-item:not(.vue-grid-placeholder) {
  /* background: #ccc; */
  border: 1px solid black;
}

.vue-grid-item .resizing {
  opacity: 0.9;
}

.vue-grid-item .static {
  // background: #cce;
}

.vue-grid-item .no-drag {
  height: 100%;
  width: 100%;
}

.vue-grid-item .minMax {
  font-size: 12px;
}

.vue-grid-item .add {
  cursor: pointer;
}

.vue-draggable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 0;
  left: 0;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='5' fill='#999999'/></svg>") no-repeat;
  background-position: bottom right;
  padding: 0 8px 8px 0;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  cursor: pointer;
}


#tooltip {
  background: cornsilk;
  border: 1px solid black;
  border-radius: 5px;
  padding: 5px;
  z-index: 1000;
  position: absolute;
  display: none;
  font-size: 10pt;
  opacity: .9;
}
</style>