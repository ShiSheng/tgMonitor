// 监控配置
module.exports = {
  // 监控的关键词列表
  keywords: [
    '重要', 
    '通知',
    '公告',
    '聪明钱已塞'
    // 添加更多关键词
  ],
  
  // 是否保存匹配的消息到本地
  saveMessages: true,
  
  // 消息保存路径
  savePath: './messages',
  
  // 是否启用控制台日志
  enableConsoleLog: true,
  
  // 是否监控所有对话
  monitorAllChats: false,
  
  // 指定监控的对话ID列表（如果monitorAllChats为false）
  // 可以通过运行程序并查看日志获取对话ID
  monitorChats: [
    // 例如: -1001234567890
  ]
};