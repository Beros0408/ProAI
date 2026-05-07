import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AgentBadge } from './AgentBadge'
import { cn } from '@/lib/utils'
import type { IMessage } from '@proai/types'
import type { AgentType } from '@proai/types'
import type { ActionCard } from '@/hooks/useChat'

interface Props {
  message: IMessage & { actions?: ActionCard[] }
  agentType?: AgentType
}

export function ChatMessage({ message, agentType }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3 animate-slide-up', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold mt-0.5',
          isUser ? 'bg-primary/20 text-primary' : 'bg-surface border border-[#1E1E2E] text-foreground',
        )}
      >
        {isUser ? 'U' : '🤖'}
      </div>

      <div className={cn('flex flex-col gap-1 max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        {!isUser && agentType && (
          <AgentBadge agentType={agentType} size="sm" />
        )}

        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-white rounded-tr-sm'
              : 'bg-surface border border-[#1E1E2E] text-foreground rounded-tl-sm',
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:bg-base prose-pre:border prose-pre:border-[#1E1E2E] prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded"
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Action cards */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.actions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  action.variant === 'primary'
                    ? 'bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/30 hover:border-[#0ea5e9]/50'
                    : 'bg-white/5 text-[#94a3b8] border border-white/10 hover:bg-white/10 hover:text-white',
                )}
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}

        <span className="text-[10px] text-muted">
          {new Date(message.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
          {message.tokensUsed && <span className="ml-1">· {message.tokensUsed} tokens</span>}
        </span>
      </div>
    </div>
  )
}
