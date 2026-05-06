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
      <div className="p-5 shrink-0"
        style={{ background: 'rgba(11,18,32,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-xl font-bold text-white gradient-text mb-1">{t('mindmap_header')}</h1>
          <p className="text-[#64748b] text-sm mb-4">{t('mindmap_description')}</p>

          <div className="flex gap-3">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={t('describe_your_idea_placeholder')}
              className="flex-1 px-4 py-2.5 rounded-xl text-[#e2e8f0] placeholder-[#475569] text-sm outline-none transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(14,165,233,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.08)' }}
              onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
              onKeyPress={(e) => e.key === 'Enter' && generateMindMap()}
            />
            <button
              onClick={generateMindMap}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 16px rgba(14,165,233,0.35)' }}
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