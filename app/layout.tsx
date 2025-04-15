import './globals.css'

export const metadata = {
  title: 'AI 聊天助手',
  description: '基于 Next.js 和 DeepSeek API 构建的 AI 聊天应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
