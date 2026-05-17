'use client'

import { useState, useRef, useEffect } from 'react'
import { aiApi } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import { Brain, Send, Loader2, Zap, RefreshCw, Copy, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  data?: unknown
  timestamp: Date
  loading?: boolean
}

const SUGGESTED = [
  'Show me all overdue invoices',
  'What is the current inventory value?',
  'How many employees do we have?',
  'Show fleet status summary',
  'List low stock items',
  'What payrolls are pending?',
  'Show active vehicles',
  'Create an invoice for Acme Corp for 500000 RWF',
]

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  const copyContent = () => {
    navigator.clipboard.writeText(msg.content)
    toast.success('Copied')
  }

  return (
    <div className={clsx('flex gap-3 group', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        isUser ? 'bg-primary-500' : 'bg-sidebar'
      )}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Zap className="w-4 h-4 text-primary-400" />}
      </div>

      {/* Bubble */}
      <div className={clsx('max-w-[80%] space-y-2', isUser && 'items-end flex flex-col')}>
        <div className={clsx(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-primary-500 text-white rounded-tr-sm'
            : 'bg-white border border-slate-100 text-ink rounded-tl-sm shadow-sm'
        )}>
          {msg.loading ? (
            <div className="flex items-center gap-2 text-ink-muted">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs">Thinking…</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          )}
        </div>

        {/* Data table if present */}
        {msg.data && !msg.loading && Array.isArray(msg.data) && msg.data.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-x-auto max-w-lg">
            <table className="text-xs w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {Object.keys(msg.data[0] as Record<string, unknown>).slice(0, 6).map(k => (
                    <th key={k} className="px-3 py-2 text-left text-ink-muted font-medium capitalize">{k.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(msg.data as Record<string, unknown>[]).slice(0, 8).map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    {Object.values(row).slice(0, 6).map((v, j) => (
                      <td key={j} className="px-3 py-2 text-ink-secondary">{String(v ?? '—').slice(0, 40)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {(msg.data as unknown[]).length > 8 && (
              <div className="px-3 py-2 text-[10px] text-ink-muted border-t border-slate-50">
                + {(msg.data as unknown[]).length - 8} more records
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-ink-muted">{msg.timestamp.toLocaleTimeString()}</span>
          {!isUser && (
            <button onClick={copyContent} className="text-ink-muted hover:text-ink transition-colors">
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AIPage() {
  const { user } = useAuth() as { user: { name: string } | null }
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! I'm your SyncFlow AI assistant. I can help you query invoices, inventory, fleet, HR, and more using natural language. What would you like to know?`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true,
    }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await aiApi.command(text)
      const result = res.data

      setMessages(prev => prev.map(m =>
        m.id === loadingMsg.id
          ? {
              ...m,
              loading: false,
              content: result.message || result.response || 'Done.',
              data: result.data,
            }
          : m
      ))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setMessages(prev => prev.map(m =>
        m.id === loadingMsg.id
          ? { ...m, loading: false, content: `Sorry, I encountered an error: ${msg || 'Unknown error'}` }
          : m
      ))
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearHistory = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Conversation cleared. How can I help you?',
      timestamp: new Date(),
    }])
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="AI Assistant" subtitle="Natural language commands for SyncFlow" />

      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder='Ask anything: "Show overdue invoices" · "Fleet status" · "Create invoice for 50k RWF"'
                disabled={isLoading}
                className="input flex-1 disabled:opacity-60"
              />
              <button type="submit" disabled={!input.trim() || isLoading} className="btn-primary gap-2 shrink-0">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Send</span>
              </button>
              <button type="button" onClick={clearHistory} className="btn-ghost shrink-0" title="Clear">
                <RefreshCw className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Suggestions sidebar */}
        <div className="w-64 border-l border-slate-100 p-4 hidden lg:flex flex-col gap-4 bg-slate-50/50 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary-500" />
              <h3 className="text-xs font-semibold text-ink uppercase tracking-wide">Suggestions</h3>
            </div>
            <div className="space-y-1.5">
              {SUGGESTED.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  disabled={isLoading}
                  className="w-full text-left text-xs text-ink-secondary hover:text-ink hover:bg-white border border-transparent hover:border-slate-200 px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-xs font-semibold text-primary-700">AI Capabilities</span>
              </div>
              <ul className="text-[11px] text-primary-600 space-y-1">
                <li>• Query invoices & revenue</li>
                <li>• Check inventory & stock</li>
                <li>• Fleet & GPS status</li>
                <li>• HR & payroll data</li>
                <li>• Create invoices by voice</li>
                <li>• Natural language search</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
