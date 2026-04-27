import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AgentBadge } from './AgentBadge'
import { cn } from '@/lib/utils'
import type { IMessage } from '@proai/types'
import type { AgentType } from '@proai/types'

interface Props {
  message: IMessage
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

        <span className="text-[10px] text-muted">
          {new Date(message.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
          {message.tokensUsed && <span className="ml-1">· {message.tokensUsed} tokens</span>}
        </span>
      </div>
    </div>
  )
}
