<template>
    <div ref="draggableContainer" id="draggable-container">
        <div id="draggable-header" @mousedown="dragMouseDown">
            <span class="icon"><fa :icon="['fa', 'sliders']" color="grey" /></span>
            <span class="center">
                {{treeConfig.config?(treeConfig.config.id + " - " + treeConfig.config.fileName):""}}
            </span>
            <span class="remove" @click="hidePanel">
              <fa :icon="['fas', 'xmark']" />
            </span>
        </div>
        <div id="draggable-body">
            <control-panel 
                v-if="treeConfig.config"
                v-model:config="treeConfig.config"/>      
        </div>
    </div>
</template>

<script setup>
import { ref,  inject } from "vue";
import ControlPanel from "/@cp/draggableDiv/draggableBody/ControlPanel.vue"
import { Plus } from "@element-plus/icons-vue";

const draggableContainer = ref(null);
const treeConfig = inject("treeConfig")

const hidePanel=()=>{
    treeConfig.config = null
}

const positions = {
    clientX: undefined,
    clientY: undefined,
    movementX: 0,
    movementY: 0
}
const dragMouseDown = (event) => {
    event.preventDefault()
    // get the mouse cursor position at startup:
    positions.clientX = event.clientX
    positions.clientY = event.clientY
    document.onmousemove = elementDrag
    document.onmouseup = closeDragElement
}



const elementDrag = (event) => {
    event.preventDefault()
    positions.movementX = positions.clientX - event.clientX
    positions.movementY = positions.clientY - event.clientY
    positions.clientX = event.clientX
    positions.clientY = event.clientY
    // set the element's new position:
    draggableContainer.value.style.top = draggableContainer.value.offsetTop - positions.movementY + 'px'
    draggableContainer.value.style.left = (draggableContainer.value.offsetLeft - positions.movementX) + 'px'
}





const closeDragElement = () => {
    document.onmouseup = null
    document.onmousemove = null
}
</script>

<style  lang="scss" scoped>

$header_height: 22px;
$radius: 10px;
$width: 300px;

#draggable-container {
    
    position: absolute;
    z-index: 9;
    border: solid .5px grey;
    // left: 80%;
    left: calc(100% - 10px);

    top: 50%;
    transform: translate(-$width*2, -50%);
    background: #FFFFFF;
    width:$width;
    border-radius: $radius;
}

#draggable-header {
    z-index: 10;
    border-bottom: solid .5px grey;
    height: $header_height;

}
#draggable-body{
    padding: 10px ;
}
.icon{
  position: absolute;
  top:3px;
  left:5px;
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
  width: 100%;
  cursor:all-scroll;
}
</style>