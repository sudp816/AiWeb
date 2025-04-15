'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Chat {
  id: string
  messages: Message[]
  title: string
  createdAt: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentResponse])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleNewChat = () => {
    if (isLoading && abortController) {
      abortController.abort();
      setIsLoading(false);
      if (currentResponse) {
        setMessages(prev => [...prev, { role: 'assistant', content: currentResponse }]);
      }
    }

    if (messages.length > 0) {
      const lastUserMessage = messages.find(m => m.role === 'user')
      const chatTitle = lastUserMessage 
        ? lastUserMessage.content.slice(0, 30) + '...'
        : '新对话'

      if (!currentChatId || !chats.find(chat => chat.id === currentChatId)) {
        const newChat: Chat = {
          id: Date.now().toString(),
          messages: [...messages],
          title: chatTitle,
          createdAt: new Date()
        }
        setChats(prev => [newChat, ...prev])
      } else {
        setChats(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: [...messages] }
            : chat
        ))
      }
    }

    setMessages([])
    setInput('')
    setCurrentResponse('')
    setIsLoading(false)
    setCurrentChatId(null)
    setAbortController(null)
  }

  const handleSelectChat = (chatId: string) => {
    if (isLoading && abortController) {
      abortController.abort();
      setIsLoading(false);
    }

    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setMessages(chat.messages)
      setCurrentChatId(chatId)
      setInput('')
      setCurrentResponse('')
      setIsLoading(false)
      setAbortController(null)
    }
  }

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsLoading(false)
      if (currentResponse) {
        setMessages(prev => [...prev, { role: 'assistant', content: currentResponse }])
        setCurrentResponse('')
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    if (abortController) {
      abortController.abort()
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setCurrentResponse('')

    const controller = new AbortController()
    setAbortController(controller)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          chatId: currentChatId
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      let fullResponse = ''
      const reader = response.body?.getReader()
      
      if (!reader) {
        throw new Error('No reader available')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        fullResponse += chunk
        setCurrentResponse(prev => prev + chunk)
      }

      if (!controller.signal.aborted) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: fullResponse },
        ])

        if (!currentChatId && messages.length === 0) {
          const newChat: Chat = {
            id: Date.now().toString(),
            messages: [...messages, userMessage, { role: 'assistant', content: fullResponse }],
            title: userMessage.content.slice(0, 30) + '...',
            createdAt: new Date()
          }
          setChats(prev => [newChat, ...prev])
          setCurrentChatId(newChat.id)
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted')
        return
      }
      console.error('Error:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，发生了错误。请稍后再试。',
        },
      ])
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
        setCurrentResponse('')
        setAbortController(null)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="sidebar">
        <button className="new-chat-button" onClick={handleNewChat}>
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="text-gray-700">新对话</span>
        </button>
        <div className="chats-list">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
            >
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                height="1em"
                width="1em"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="truncate text-gray-700">{chat.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-4xl font-bold mb-2 text-gray-800">欢迎使用 AI 助手</h1>
              <p className="text-lg text-gray-600 mb-8">我可以帮助你解答问题、编写代码、分析数据等</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } mb-4`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none text-white [&_strong]:text-white [&_em]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_h6]:text-white px-2">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="px-2">
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {currentResponse && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-[80%] rounded-lg p-4 bg-gray-800 text-white">
                    <div className="prose prose-sm max-w-none text-white [&_strong]:text-white [&_em]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_h6]:text-white px-2">
                      <ReactMarkdown>
                        {currentResponse}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入消息..."
              className="flex-1 p-3 border rounded-lg resize-none overflow-hidden bg-white"
              rows={1}
            />
            <div className="flex gap-2">
              {isLoading && (
                <button
                  onClick={handleStopGeneration}
                  className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  </svg>
                </button>
              )}
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-lg flex items-center justify-center min-w-[60px] ${
                  !input.trim() || isLoading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } transition-colors`}
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 