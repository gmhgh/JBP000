const path = require('path')

module.exports = {
    alias: {
        '/@/': path.resolve(__dirname, './src'),
        '/@js/': path.resolve(__dirname, './src/assets/js'),
        '/@cp/': path.resolve(__dirname, './src/components'),
    },
    port: '3000', // 默认是 3000 端口
  }
