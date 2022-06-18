<template>
  <!-- <button @click="resize">resize</button>
  <button @click="resetZoom">resetZoom</button> -->
  <!-- <input type="checkbox" v-model="config.showTicklines" />
  <label for="checkbox">drawScale</label> -->

  <el-divider content-position="left"><span class="divider-font">Tree Style</span></el-divider>

  <div class="row-c2">
    <span class="col">
      Flip
    </span>
    <span class="col">
      <el-switch size="small" v-model="config.isFlip" inline-prompt active-text="Y" inactive-text="N" />
    </span>
  </div>

  <div class="row-c2">
    <span class="col">
      Zoom
    </span>
    <span class="col">
      <el-switch size="small" v-model="config.zoomable" inline-prompt active-text="Y" inactive-text="N" />
    </span>
  </div>

  <div class="row-c2">
    <span class="col">
      Length
    </span>
    <span class="col">
      <el-switch size="small" v-model="config.showLength" inline-prompt active-text="Y" inactive-text="N" />
    </span>
  </div>

  <div class="row-c2">
    <span class="col">
      X-Expand
    </span>
    <span class="col">
      <el-input-number size="small" v-model="config.expand.x" :step="5" />
    </span>
  </div>

  <div class="row-c2">
    <span class="col">Y-Expand</span>
    <span class="col">
      <el-input-number size="small" v-model="config.expand.y" :step="5" />
    </span>
  </div>

  <div class="row-c2" style="margin-top:20px">
    <span class="col"></span>
    <span class="col">
      <el-button size="small" type="primary" @click="resize" plain>Resize</el-button>
    </span>
  </div>


  <el-divider content-position="left"><span class="divider-font">Leaf Style</span></el-divider>

  <div class="row-c2">
    <span class="col">Label</span>
    <span class="col">
      <el-switch size="small" v-model="config.showLabel" inline-prompt active-text="Y" inactive-text="N" />
    </span>
  </div>

  <div class="row-c2" v-show="config.showLabel">
    <span class="col">Font Size</span>
    <span class="col">
      <el-input-number size="small" v-model="config.style.fontsize" :min="4" :step="1" />
    </span>
  </div>

  <div class="row-c2">
    <span class="col">Node Size</span>
    <span class="col">
      <el-input-number size="small" v-model="config.style.leafsize" :min="2" :step="1" />
    </span>
  </div>

  <!-- #region [Select Leaf] -->
  <el-divider content-position="left">
    <span class="divider-font">
      <el-icon v-if="config.isSync">
        <Connection />
      </el-icon> 
      Select Leaf
    </span>
  </el-divider>

  <el-tag v-for="tag in props.config.selected" :key="tag" class="mx-1 m-r" closable :disable-transitions="false"
    @close="handleClose(tag)">
    {{ tag }}
  </el-tag>

  <el-autocomplete v-if="inputVisible" ref="InputRef" v-model="inputValue" :fetch-suggestions="querySearch"
    :trigger-on-focus="false" size="small" clearable placeholder="leaf name" @keyup.enter="handleInputConfirm"
    @select="handleSelect" />

  <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
    <el-icon>
      <Plus />
    </el-icon>
  </el-button>
  <!-- #endregion -->

  <el-divider content-position="left">
    <span class="divider-font">
      <el-icon v-if="config.isSync">
        <Connection />
      </el-icon> 
      Sort Branch by
    </span>
  </el-divider>

  <div class="row-c2">
    <span class="col"
      v-bind:class="selectSortByCluster">
      Cluster :
    </span>
    <span class="col">
      <el-radio-group v-model="sortMethod">
        <el-radio-button size="small" label="1">
          <fa :icon="['fas', 'arrow-down-9-1']" />
        </el-radio-button>
        <el-radio-button size="small" label="-1" >
          <fa :icon="['fas', 'arrow-down-1-9']" />
        </el-radio-button>
      </el-radio-group>
    </span>
  </div>

  <div class="row-c2">
    <span class="col"
      v-bind:class="selectSortByDepth">
      Depth :
    </span>
    <span class="col">
      <el-radio-group v-model="sortMethod">
        <el-radio-button size="small" label="2">
          <fa :icon="['fas', 'arrow-down-wide-short']" />
        </el-radio-button>
        <el-radio-button size="small" label="-2" >
          <fa :icon="['fas', 'arrow-down-short-wide']" />
        </el-radio-button>
      </el-radio-group>
    </span>
  </div>


  <div class="row-c2">
    <span class="col"
      v-bind:class="selectedSortByDistance">
      Distance :
    </span>
    <span class="col">
      <el-switch 
        size="small" 
        v-model="switchIsPatristicValue"
        v-on:change="switchIsPatristicChange" 
        active-text="patristic" 
        inactive-text="edge" 
        />
    </span>
  </div>

  <div class="row-c1">
    <span class="col">
      to <el-autocomplete ref="SortInputRef" v-model="sortInputValue" :fetch-suggestions="querySearch"
        :trigger-on-focus="false" size="small" clearable placeholder="leaf name" @keyup.enter="handleSortInputConfirm"
        @select="handleSortSelect" />
    </span>
  </div>


</template>

<script setup>
import { nextTick, ref, watch, inject, computed} from 'vue';
import { ElMessage, ElSwitch } from "element-plus";
import { Plus,Connection } from "@element-plus/icons-vue";

//#region [DeclarProps]
const props = defineProps({
  config: { type: Object }
});
const global = inject("global");
//#endregion

//#region [Sort Leaf]
const sortMethod = ref(null)

const SortInputRef = ref(null)
const sortInputValue = ref('')
const switchIsPatristicValue = ref(null)

// when switch patristic, auto show length
const switchIsPatristicChange = (val)=>{
  updateConfig('isPatristic', val)
}


const selectSortByCluster = computed({
  get(){
    const {sortBy} = props.config
    return sortBy===1 || sortBy===-1? "selected":""
  }
});
const selectSortByDepth = computed({
  get(){
    const {sortBy} = props.config
    return sortBy===2 || sortBy===-2? "selected":""
  }
});

const selectedSortByDistance = computed({
  get(){
    const {sortBy} = props.config
    return typeof sortBy==="string"? "selected":""
  }
});

const handleSortInputConfirm = () => {
  const input = sortInputValue.value
  if (input) {
    const { leafs } = props.config
    if (leafs.includes(input)) {
      // props.config.sortBy = input
      updateConfig('sortBy', input)
      sortMethod.value = null
    } else {
      ElMessage.error(`${input} is not exist`);
    }
  }
}

const handleSortSelect = (item) => {
  handleSortInputConfirm()
}

watch(
  () => sortMethod.value,
  (curr, _) => {
    if (curr) {
      sortInputValue.value = '';
      updateConfig('sortBy', parseInt(curr))
    }
  }
);

watch(
  () => props.config.isPatristic,
  (curr, _) => {
    switchIsPatristicValue.value = curr
  }
);

watch(
  () => props.config.sortBy,
  (curr, _) => {
    if (typeof curr === 'string') {
      sortInputValue.value = curr;
      sortMethod.value = null;
    }else if(typeof curr === 'number') {
      sortMethod.value = curr
    }else {
      sortInputValue.value = '';
      sortMethod.value = null
    }

  }
);

//#endregion


//#region [Select Leaf]
const inputVisible = ref(false)
const InputRef = ref(null)
const inputValue = ref('')

const handleSelect = (item) => {
  handleInputConfirm()
}

const handleClose = (tag) => {
  const { selected } = props.config
  updateConfig('selected', selected.filter(item => item !== tag))
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value.focus()
  })
}

const handleInputConfirm = () => {
  const input = inputValue.value
  if (input) {
    const { selected } = props.config
    if (selected.includes(input)) {
      ElMessage.error(`${input} is already selected`);
    } else {
      const { leafs } = props.config
      if (leafs.includes(input)) {
        updateConfig('selected', selected.concat([input]))
      } else {
        ElMessage.error(`${input} is not exist`);
      }
    }
  }
  inputVisible.value = false
  inputValue.value = ''
}
//#endregion


//#region [QueryFilter]
const querySearch = (queryString, cb) => {
  const { leafs } = props.config
  const results = queryString
    ? leafs.filter(createFilter(queryString))
    : leafs
  cb([...results.map(el => { return { 'value': el } })])
}

const createFilter = (queryString) => {
  return (leafs) => {
    return (
      leafs.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}
//#endregion

const updateConfig = (k, v) => {
  const { isSync } = props.config
  if (isSync) {
    global[k] = v
    if (k == 'sortBy') {
      for (const [key, value] of Object.entries(global.state)) {
        if (value.isSync) value.updateDistance = false;
      }
    }
  } else {
    props.config[k] = v
  }
}


const resize = () => {
  props.config.expand.x = 0
  props.config.expand.y = 0
  props.config.zoomable = true
  props.config.resize = !props.config.resize;
}

// const resetZoom = () => {
//   props.config.resetZoom = !props.config.resetZoom;
// }
</script>
<style scoped>
.row-c2 {
  margin: 2px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.row-c1 {
  margin: 2px 0;
  display: grid;
  grid-template-columns: 1fr;
}

.row-c3 {
  margin: 2px 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.col {
  font-size: 12px;
  margin: auto;

}

.divider-font {
  color: darkgray;
  font-size: 12px;
}

.m-r {
  margin-right: 2px
}

.selected{
  color:#409EFF;
}
</style>