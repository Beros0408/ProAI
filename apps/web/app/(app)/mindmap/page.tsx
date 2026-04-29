'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactFlow, { Node, Edge, addEdge, useNodesState, useEdgesState, Controls, Background } from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/context'

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export default function MindMapPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [idea, setIdea] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const generateMindMap = async () => {
    if (!idea.trim()) {
      alert(t('mindmap_error_no_idea'))
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/mindmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea }),
      })

      if (!response.ok) {
        throw new Error(t('mindmap_generation_error'))
      }

      const data = await response.json()

      setNodes(data.nodes)
      setEdges(data.edges)
      alert(t('mindmap_success'))
    } catch (error) {
      console.error('Erreur:', error)
      alert(t('mindmap_generation_error'))
    } finally {
      setIsLoading(false)
    }
  }

  const onConnect = (params: any) => setEdges((eds) => addEdge(params, eds))

  const onNodeClick = (_: any, node: Node) => {
    if (node.data?.agentType) {
      router.push(`/chat?agent=${node.data.agentType}`)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-base">
      {/* Header */}
      <div className="p-6 border-b border-[#1E1E2E] bg-surface/50">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-2xl font-bold text-foreground gradient-text mb-2">{t('mindmap_header')}</h1>
          <p className="text-muted mb-4">{t('mindmap_description')}</p>

          <div className="flex gap-4">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={t('describe_your_idea_placeholder')}
              className="flex-1 px-4 py-2 bg-base border border-[#1E1E2E] rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyPress={(e) => e.key === 'Enter' && generateMindMap()}
            />
            <button
              onClick={generateMindMap}
              disabled={isLoading}
              className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-50 hover-lift"
            >
              {isLoading ? t('generating') : t('generate_mind_map')}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mind Map */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          className="bg-base"
          style={{ backgroundColor: '#0c1220' }}
        >
          <Controls className="bg-surface border-[#1E1E2E]" />
          <Background color="#374151" gap={20} />
        </ReactFlow>
      </div>
    </div>
  )
}