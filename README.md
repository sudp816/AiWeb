# AI 聊天应用

这是一个基于 Next.js 和 OpenAI API 的聊天应用，具有现代化的用户界面和实时对话功能。

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
- OpenAI API
- TypeScript

## 本地开发

1. 克隆仓库
```bash
git clone [你的仓库地址]
cd [项目目录]
```

2. 安装依赖
```bash
npm install
```

3. 创建环境变量文件
```bash
cp .env.example .env.local
```
然后在 `.env.local` 中填入你的 OpenAI API 密钥。

4. 启动开发服务器
```bash
npm run dev
```

## 部署

这个项目可以部署在 Vercel 上：

1. 在 [Vercel](https://vercel.com) 上创建一个新项目
2. 连接到你的 GitHub 仓库
3. 添加环境变量（OPENAI_API_KEY）
4. 点击部署

## 环境变量

- `OPENAI_API_KEY`: 你的 OpenAI API 密钥

## 许可证

MIT
