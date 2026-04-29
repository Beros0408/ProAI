'use client'

import { useState, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Trash2, Power, PowerOff, Save } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/Button'

interface Workflow {
  id: string
  name: string
  active: boolean
  createdAt: string
  nodes: Node[]
  edges: Edge[]
}

const NODE_TYPES = {
  trigger: { label: 'Trigger', color: 'from-green-500 to-green-600', icon: '▶️' },
  condition: { label: 'Condition', color: 'from-orange-500 to-orange-600', icon: '?>' },
  action: { label: 'Action', color: 'from-blue-500 to-blue-600', icon: '⚙️' },
}

const TRIGGER_TEMPLATES = [
  { id: 'new_lead', label: 'Nouveau lead' },
  { id: 'email_received', label: 'Email reçu' },
  { id: 'scheduled', label: 'Heure planifiée' },
]

const CONDITION_TEMPLATES = [
  { id: 'score_gt_70', label: 'Si score > 70' },
  { id: 'no_reply_3days', label: 'Pas de réponse après 3 jours' },
]

const ACTION_TEMPLATES = [
  { id: 'send_email', label: 'Envoyer email' },
  { id: 'linkedin_post', label: 'Publier sur LinkedIn' },
  { id: 'create_task', label: 'Créer tâche' },
  { id: 'slack_notify', label: 'Notifier Slack' },
]

function WorkflowNode({ data }: { data: any }) {
  const typeConfig = NODE_TYPES[data.type as keyof typeof NODE_TYPES] || NODE_TYPES.action
  return (
    <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${typeConfig.color} text-white shadow-lg`}>
      <div className="text-xs font-bold">{typeConfig.icon} {typeConfig.label}</div>
      <div className="text-sm font-medium mt-1">{data.label}</div>
    </div>
  )
}

export default function WorkflowsPage() {
  const { t } = useTranslation()
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Lead Scoring',
      active: true,
      createdAt: '2024-04-15',
      nodes: [],
      edges: [],
    },
  ])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(workflows[0] || null)
  const [nodes, setNodes, onNodesChange] = useNodesState(selectedWorkflow?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(selectedWorkflow?.edges || [])
  const [showSidebar, setShowSidebar] = useState(true)

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds))
  }, [setEdges])

  const addNode = (type: 'trigger' | 'condition' | 'action', template: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      data: {
        label: template,
        type,
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      type: 'input',
    }
    setNodes((nds) => [...nds, newNode])
  }

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  const saveWorkflow = () => {
    if (!selectedWorkflow) return
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === selectedWorkflow.id
          ? { ...w, nodes, edges }
          : w
      )
    )
  }

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, active: !w.active }
          : w
      )
    )
  }

  const createWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `${Date.now()}`,
      name: `Workflow ${workflows.length + 1}`,
      active: false,
      createdAt: new Date().toISOString().split('T')[0],
      nodes: [],
      edges: [],
    }
    setWorkflows((prev) => [...prev, newWorkflow])
    setSelectedWorkflow(newWorkflow)
    setNodes([])
    setEdges([])
  }

  return (
    <div className="space-y-6 animate-fade-in h-screen flex flex-col">
      <div className="animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground gradient-text">Workflow Builder</h1>
            <p className="text-muted text-sm mt-0.5">Créez des workflows automatisés</p>
          </div>
          <Button onClick={createWorkflow} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau workflow
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Sidebar - Node Palette */}
        <div className="w-64 bg-surface border border-[#1E1E2E] rounded-xl p-4 space-y-4 overflow-y-auto">
          <div>
            <p className="text-xs font-bold text-muted uppercase mb-2">Triggers</p>
            <div className="space-y-2">
              {TRIGGER_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => addNode('trigger', t.label)}
                  className="w-full px-3 py-2 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-left font-medium"
                >
                  ▶️ {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#1E1E2E] pt-4">
            <p className="text-xs font-bold text-muted uppercase mb-2">Conditions</p>
            <div className="space-y-2">
              {CONDITION_TEMPLATES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => addNode('condition', c.label)}
                  className="w-full px-3 py-2 text-xs bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-left font-medium"
                >
                  ?> {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#1E1E2E] pt-4">
            <p className="text-xs font-bold text-muted uppercase mb-2">Actions</p>
            <div className="space-y-2">
              {ACTION_TEMPLATES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => addNode('action', a.label)}
                  className="w-full px-3 py-2 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-left font-medium"
                >
                  ⚙️ {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-base border border-[#1E1E2E] rounded-xl overflow-hidden">
          {selectedWorkflow ? (
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}>
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <p>Sélectionnez ou créez un workflow pour commencer</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Workflow List */}
        <div className="w-64 bg-surface border border-[#1E1E2E] rounded-xl p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => {
                  setSelectedWorkflow(workflow)
                  setNodes(workflow.nodes)
                  setEdges(workflow.edges)
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedWorkflow?.id === workflow.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-base border-[#1E1E2E] hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground text-sm">{workflow.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleWorkflow(workflow.id)
                    }}
                    className={`p-1 rounded transition-colors ${
                      workflow.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {workflow.active ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-xs text-muted">{workflow.createdAt}</p>
              </div>
            ))}
          </div>

          <button
            onClick={saveWorkflow}
            className="w-full px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}
