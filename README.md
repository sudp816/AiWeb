# AI 聊天应用

这是一个基于 Next.js 和 DeepSeek API 的聊天应用，具有现代化的用户界面和实时对话功能。

## 在线演示

访问 [https://aiweb-sudp816-gmailcom.vercel.app](https://aiweb-sudp816-gmailcom.vercel.app) 体验应用。

## 功能特点

- 实时对话界面
- 支持 Markdown 格式的回复
- 对话历史记录
- 响应式设计
- 深色/浅色主题

## 技术栈

- Next.js 14
- React
- Tailwind CSS
- DeepSeek API
- TypeScript

## 本地开发

1. 克隆仓库
```bash
git clone https://github.com/sudp816/AiWeb.git
cd AiWeb
```

2. 安装依赖
```bash
npm install
```

3. 创建环境变量文件
```bash
cp .env.example .env.local
```
然后在 `.env.local` 中填入你的 DeepSeek API 密钥。

4. 启动开发服务器
```bash
npm run dev
```
应用将在 http://127.0.0.1:3001 运行。

## 部署

这个项目已经部署在 Vercel 上。如果你想部署自己的版本：

1. Fork 这个仓库
2. 在 [Vercel](https://vercel.com) 上创建一个新项目
3. 连接到你的 GitHub 仓库
4. 添加环境变量（DEEPSEEK_API_KEY）
5. 点击部署

## 环境变量

- `DEEPSEEK_API_KEY`: 你的 DeepSeek API 密钥

## 许可证

MIT
