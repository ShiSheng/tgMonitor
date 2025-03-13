// 导入必要的库
require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// 确保消息保存目录存在
if (config.saveMessages && !fs.existsSync(config.savePath)) {
  fs.mkdirSync(config.savePath, { recursive: true });
}

// 初始化Telegram客户端
const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const sessionPath = process.env.SESSION_PATH;

// 创建StringSession
let session = new StringSession("");

// 如果session文件存在，尝试读取内容
if (fs.existsSync(sessionPath)) {
  try {
    console.log(`尝试从 ${sessionPath} 读取会话数据...`);
    const sessionData = fs.readFileSync(sessionPath, 'utf8');
    session = new StringSession(sessionData.trim());
    console.log('会话数据读取成功!');
  } catch (err) {
    console.error('读取会话文件失败:', err);
  }
}

// 创建客户端
const client = new TelegramClient(session, apiId, apiHash, {
  connectionRetries: 5,
});

// 保存消息到文件
function saveMessage(chat, message) {
  if (!config.saveMessages) return;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const chatName = chat.title || chat.username || chat.firstName || chat.id.toString();
  const fileName = `${timestamp}_${chatName}.json`;
  const filePath = path.join(config.savePath, fileName);
  
  const data = {
    timestamp: new Date().toISOString(),
    chatId: chat.id.toString(),
    chatName: chatName,
    message: message.text,
    sender: message.sender ? (message.sender.username || message.sender.firstName || 'Unknown') : 'Unknown',
    messageId: message.id
  };
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`消息已保存到: ${filePath}`);
}

// 检查消息是否包含关键词
function containsKeyword(text) {
  if (!text) return false;
  return config.keywords.some(keyword => text.includes(keyword));
}

// 处理新消息事件
async function handleNewMessage(event) {
  const message = event.message;
  
  // 跳过自己发送的消息
  if (message.out) return;
  
  try {
    // 获取对话信息
    const chat = await message.getChat();
    const chatId = chat.id.toString();
    
    // 检查是否需要监控此对话
    if (!config.monitorAllChats && !config.monitorChats.includes(chatId)) {
      return;
    }
    
    // 获取消息文本
    const text = message.text || message.message;
    
    // 如果消息包含关键词，则处理
    if (containsKeyword(text)) {
      const chatName = chat.title || chat.username || chat.firstName || chatId;
      const sender = message.sender ? (message.sender.username || message.sender.firstName || 'Unknown') : 'Unknown';
      
      console.log(`\n发现匹配消息!`);
      console.log(`对话: ${chatName} (${chatId})`);
      console.log(`发送者: ${sender}`);
      console.log(`消息: ${text}\n`);
      
      // 保存消息
      saveMessage(chat, message);
    }
  } catch (err) {
    console.error('处理消息时出错:', err);
  }
}

// 显示所有对话信息（用于获取对话ID）
async function listAllDialogs() {
  console.log('\n获取所有对话列表...');
  const dialogs = await client.getDialogs();
  
  console.log('\n可监控的对话列表:');
  dialogs.forEach((dialog, i) => {
    const chat = dialog.entity;
    const chatId = chat.id.toString();
    const chatName = chat.title || chat.username || chat.firstName || chatId;
    console.log(`${i + 1}. ${chatName} (ID: ${chatId})`);
  });
  
  console.log('\n要监控特定对话，请将对话ID添加到config.js文件的monitorChats数组中。\n');
}

// 主函数
async function main() {
  try {
    console.log('正在连接到Telegram...');
    await client.start({
      phoneNumber: async () => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        return new Promise((resolve) => {
          readline.question('请输入您的电话号码 (格式: +86123456789): ', (phoneNumber) => {
            readline.close();
            resolve(phoneNumber);
          });
        });
      },
      password: async () => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        return new Promise((resolve) => {
          readline.question('请输入您的两步验证密码: ', (password) => {
            readline.close();
            resolve(password);
          });
        });
      },
      phoneCode: async () => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        return new Promise((resolve) => {
          readline.question('请输入您收到的验证码: ', (code) => {
            readline.close();
            resolve(code);
          });
        });
      },
      onError: (err) => console.error('连接错误:', err),
    });
    
    // 保存会话数据到文件
    const sessionData = client.session.save();
    fs.writeFileSync(sessionPath, sessionData);
    console.log(`会话数据已保存到 ${sessionPath}`);
    
    console.log('已成功连接到Telegram!');
    
    // 显示所有对话
    await listAllDialogs();
    
    // 添加新消息事件处理器
    client.addEventHandler(handleNewMessage, new NewMessage({}));
    
    console.log(`\n开始监控消息...`);
    console.log(`监控关键词: ${config.keywords.join(', ')}`);
    console.log(`监控模式: ${config.monitorAllChats ? '所有对话' : '指定对话'}`);
    console.log('按Ctrl+C退出程序\n');
    
  } catch (err) {
    console.error('程序启动错误:', err);
  }
}

// 运行主函数
main();