<template>
  <div class="header-container">
    <div class="logo">
      <h2>Phylorder</h2>
    </div>
    <div></div>
    <div>     
      <el-button class="btn-add" type="success" @click="addGridItem" circle size="large">
        <el-icon :size="35">
          <Plus />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script>
import { Plus } from "@element-plus/icons-vue";
export default {
  name: "ToolHeader",
  components: { Plus },
  methods: {
    addGridItem() {
      this.$emit("addGridItem");
    },
  },
};
</script>

<style lang="scss" scoped>
.header-container {
  height: 50px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  background-color: lightyellow;
}

.header-container>div {
  width: 33%;
  height: 100px;
}

.logo{
  padding-left:20px;
}

.btn-add {
  position: absolute;
  right:50px;
  top:5px;
}
</style>