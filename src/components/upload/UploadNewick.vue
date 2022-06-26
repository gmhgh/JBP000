<template>
  <el-upload
    ref="doc"
    drag
    action=""
    :auto-upload="false"
    :limit="1"
    :on-change="getFile"
    :on-remove="removeFile"
    :on-exceed="handleExceed"
  >
    <el-icon class="el-icon--upload"><document-add /></el-icon>
    <div class="el-upload__text">Drop file or click</div>
  </el-upload>
  <div v-if="fileString" class="btn-upload">
    <el-button type="success" @click="uploadTreeData" round>
      <el-icon :size="28"><Upload /></el-icon>
    </el-button>
  </div>
</template>

<script>
import "/@js/patristic.js";
import { DocumentAdd, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
export default {
  name: "UploadNewick",
  components: { DocumentAdd, Upload, ElMessage },
  props: {
    data: {
      type: Object
    },
  },
  data() {
    return {
      fileName: null,
      fileString:null,
    };
  },
  methods: {
    uploadTreeData() {
      this.$emit("update:data", {
          fileString : this.fileString,
          fileName : this.fileName
      });
    },
    removeFile() {
      this.fileName = null;
      this.fileString = null;
    },
    getFile(file) {
      let reader = new FileReader();
      reader.readAsText(file.raw);

      reader.onload = (e) => {
        const fileString = e.target.result;
        try {
          let res = patristic.parseNewick(fileString);
          if(res.children.length === 0){
            ElMessage.error("Not a valid newick text file!");
            this.removeFile();
            return
          }
          this.fileString = fileString;
          this.fileName = file.name.replace(/\.[^/.]+$/, "");
        } catch (err) {
          ElMessage.error("Not a valid newick text file!");
          this.removeFile();
        }
      };
    },
    handleExceed(files) {
      this.$refs.doc.clearFiles();
      let file = files[0];
      this.$refs.doc.handleStart(file);
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-upload) {
  display: table;
  margin: 0 auto;
  min-width: 100%;
  min-height: 100%;
}
:deep(.el-upload-dragger) {
  width: 100%;
  height: 100% !important;
}
:deep(.el-icon--upload) {
  margin: 5px;
  font-size: 60px;
}

.btn-upload {
  position: fixed;
  left: 50%;
  bottom: 10px;
  transform: translate(-50%, -50%);
  margin: 0 auto;
}
</style>