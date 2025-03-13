# Telegram消息监控工具

这是一个Node.js应用程序，用于监控Telegram用户加入的频道或群组中的特定消息。

## 功能

- 监控用户加入的所有频道和群组
- 根据关键词过滤消息
- 将匹配的消息保存到本地文件
- 支持自定义监控特定的对话

## 安装

1. 确保已安装Node.js (v12或更高版本)
2. 克隆此仓库或下载源代码
3. 在项目目录中运行 `npm install` 安装依赖

## 配置

1. 确保`.env`文件包含以下内容：
   ```
   API_ID=你的API_ID
   API_HASH=你的API_HASH
   SESSION_PATH=./你的session文件路径
   ```

2. 在`config.js`文件中配置监控设置：
   - `keywords`: 要监控的关键词列表
   - `saveMessages`: 是否保存匹配的消息
   - `savePath`: 消息保存路径
   - `enableConsoleLog`: 是否启用控制台日志
   - `monitorAllChats`: 是否监控所有对话
   - `monitorChats`: 指定监控的对话ID列表

## 使用方法

1. 运行 `npm start` 启动程序
2. 首次运行时，程序会显示所有可监控的对话列表
3. 根据需要，将特定对话的ID添加到`config.js`文件的`monitorChats`数组中
4. 程序将开始监控消息，匹配的消息将显示在控制台并保存到文件（如果启用）

## 注意事项

- 请确保您有权访问Telegram API
- 使用此工具时请遵守Telegram的服务条款
- 不要将您的API凭据分享给他人