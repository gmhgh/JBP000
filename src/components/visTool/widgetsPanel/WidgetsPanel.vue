<template>
  <div class="wrapper">
    <div class=" widgets">
      <el-switch v-model="config.isSync" inline-prompt :active-icon="Connection" :inactive-icon="Close" />
      <el-button @click="showPanel" :icon="Operation" size="small" type="primary" plain circle />
    </div>
    <div class=" color-scaler" v-show="(typeof config.sortBy==='string')">
      <div class="float-l dist-type-label">{{config.isPatristic?"patristic":"edge"}}: </div>
      <div class="float-l">0</div>
      <div class="float-l pct80"></div>
      <div class="float-l">{{config.isSync?global.globalMaxDistance:config.maxDistance}}</div>
    </div>

  </div>
</template>

<script setup>
import { ElSwitch } from "element-plus"
import { Connection, Close, Operation } from '@element-plus/icons-vue'
import { inject } from "vue";
import { interpolateRdYlBu } from "d3-scale-chromatic";

const treeConfig = inject("treeConfig")
const global = inject("global")


// 点击显示控制面板，把本地设置推送到全局
const showPanel = () => {
  treeConfig.config = props.config;
}
const props = defineProps({
  config: { type: Object }
});
</script>

<style lang="scss" scoped>
.wrapper{
  display:grid;
  grid-template-columns: 1fr 3fr;
  grid-gap: 10px;
}

.widgets{
  width:70px;
}
.color-scaler-label{
  // 
  padding-right:10px;
}
.color-scaler{
  height:20px;
  padding-right:5px;
}

.dist-type-label{
  text-align: right;
  padding-right: 5px;
  width:65px;
}

.float-l{
  float:left; 
}
.float-r{
  float:right; 
  
}

.pct80{
  width:40%;
  height:45%;
  margin:4px 4px 0px 4px;
  background-image: linear-gradient(
    to right,
    rgb(165, 0, 38), 
    rgb(241, 110, 67),
    rgb(254, 221, 144),
    rgb(220, 241, 236),
    rgb(117, 171, 208),
    rgb(49, 54, 149));
}

.el-switch {
  height: 0;
  margin-right: 5px;
}

.el-button--small {
  --el-button-size: 20px;
}
</style>