import { ChatContainer } from '@/components/chat/ChatContainer'
import type { AgentType } from '@proai/types'

interface Props {
  params: { id: string }
  searchParams: { agent?: string }
}

export default function ChatConversationPage({ params, searchParams }: Props) {
  const agentType = (searchParams.agent as AgentType) ?? 'general'
  return (
    <div className="h-full flex flex-col -m-6">
      <ChatContainer conversationId={params.id === 'new' ? null : params.id} agentType={agentType} />
    </div>
  )
}
