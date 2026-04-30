'use client'

import { useState, useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Save, GitBranch, Zap, Filter, Send, ChevronDown, Power } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

interface Workflow {
  id: string
  name: string
  active: boolean
  createdAt: string
  nodes: Node[]
  edges: Edge[]
}

interface NodeTemplate {
  id: string
  label: string
  type: 'trigger' | 'condition' | 'action'
}

const TRIGGER_TEMPLATES: NodeTemplate[] = [
  { id: 'new_lead', label: 'Nouveau lead', type: 'trigger' },
  { id: 'email_received', label: 'Email reçu', type: 'trigger' },
  { id: 'scheduled', label: 'Heure planifiée', type: 'trigger' },
]

const CONDITION_TEMPLATES: NodeTemplate[] = [
  { id: 'score_gt_70', label: 'Si score > 70', type: 'condition' },
  { id: 'no_reply', label: 'Si pas de réponse', type: 'condition' },
]

const ACTION_TEMPLATES: NodeTemplate[] = [
  { id: 'send_email', label: 'Envoyer email', type: 'action' },
  { id: 'linkedin_post', label: 'Publier LinkedIn', type: 'action' },
  { id: 'slack_notify', label: 'Notifier Slack', type: 'action' },
]

const NODE_COLORS: Record<string, { border: string; icon: any; iconColor: string }> = {
  trigger: { border: '#34d399', icon: Zap, iconColor: '#34d399' },
  condition: { border: '#fb923c', icon: Filter, iconColor: '#fb923c' },
  action: { border: '#0ea5e9', icon: Send, iconColor: '#0ea5e9' },
}

interface WorkflowNodeData {
  label: string
  type: 'trigger' | 'condition' | 'action'
}

function WorkflowNode({ data }: { data: WorkflowNodeData }) {
  const config = NODE_COLORS[data.type]
  const IconComponent = config.icon
  
  return (
    <div
      className="rounded-[12px] bg-[#111827] p-4 min-w-[200px] border-l-4"
      style={{ borderLeftColor: config.border }}
    >
      <div className="flex items-center gap-2 mb-2">
        <IconComponent className="w-4 h-4" style={{ color: config.iconColor }} />
        <span className="text-xs font-semibold uppercase text-[#cbd5e1]">{data.type}</span>
      </div>
      <p className="text-sm font-medium text-white">{data.label}</p>
    </div>
  )
}

function CollapsibleSection({
  title,
  icon: Icon,
  items,
  onItemDrag,
  onItemClick,
  isOpen,
  onToggle,
}: {
  title: string
  icon: any
  items: NodeTemplate[]
  onItemDrag: (item: NodeTemplate) => void
  onItemClick: (item: NodeTemplate) => void
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-t border-[rgba(255,255,255,0.08)] pt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3 hover:opacity-80 transition"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#94a3b8] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('application/reactflow', JSON.stringify(item))
                onItemDrag(item)
              }}
              onClick={() => onItemClick(item)}
              className="w-full rounded-[12px] bg-[#1a2236] p-3 text-left text-sm text-white border border-dashed border-transparent hover:border-[rgba(255,255,255,0.12)] cursor-grab active:cursor-grabbing transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


export default function WorkflowsPage() {
  const { t } = useTranslation()
  const [workflows, setWorkflows] = useState<Workflow[]>([
    { id: '1', name: 'Lead Scoring', active: true, createdAt: '2026-04-30', nodes: [], edges: [] },
    { id: '2', name: 'Email Campaign', active: false, createdAt: '2026-04-25', nodes: [], edges: [] },
  ])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(workflows[0])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [workflowName, setWorkflowName] = useState(selectedWorkflow?.name || '')
  const [expandedSections, setExpandedSections] = useState({ triggers: true, conditions: true, actions: true })

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds))
  }, [setEdges])

  const addNode = (item: NodeTemplate) => {
    const newNode: Node = {
      id: `${item.type}-${Date.now()}`,
      type: 'customNode',
      data: { label: item.label, type: item.type },
      position: { x: 250 + Math.random() * 100, y: 150 + Math.random() * 150 },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    setWorkflowName(workflow.name)
    setNodes(workflow.nodes)
    setEdges(workflow.edges)
  }

  const saveWorkflow = () => {
    if (!selectedWorkflow) return
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === selectedWorkflow.id
          ? { ...w, nodes, edges, name: workflowName }
          : w
      )
    )
  }

  const createNewWorkflow = () => {
    const newId = Date.now().toString()
    const newWorkflow: Workflow = {
      id: newId,
      name: `Nouveau workflow ${workflows.length + 1}`,
      active: false,
      createdAt: new Date().toISOString().split('T')[0],
      nodes: [],
      edges: [],
    }
    setWorkflows((prev) => [...prev, newWorkflow])
    handleWorkflowSelect(newWorkflow)
  }

  const toggleWorkflowActive = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    )
  }

  const nodeTypes = useMemo(() => ({ customNode: WorkflowNode }), [])

  return (
    <div className="min-h-screen bg-[#0c1220] flex flex-col">
      <div className="border-b border-[rgba(255,255,255,0.08)] bg-[#0b1220] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-[700] text-white">Workflow Builder</h1>
            <p className="mt-1 text-sm text-[#94a3b8]">Créez des workflows d'automation pour vos campagnes</p>
          </div>
          <button
            onClick={createNewWorkflow}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#fb923c] to-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Plus className="mr-2 h-4 w-4" /> Nouveau workflow
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 p-6 min-h-0">
        <div className="flex-1 rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#111827] overflow-hidden flex flex-col" style={{ width: '75%' }}>
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[#0b1220] px-6 py-4">
            <div>
              <input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="bg-transparent text-[20px] font-[600] text-white outline-none border-none"
                placeholder="Nom du workflow"
              />
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedWorkflow?.active
                  ? 'bg-[#34d399] text-black'
                  : 'bg-[#4b5563] text-[#cbd5e1]'
              }`}
            >
              {selectedWorkflow?.active ? 'Actif' : 'Brouillon'}
            </span>
          </div>

          {nodes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <GitBranch className="w-16 h-16 text-[#0ea5e9]" style={{ animation: 'float 3s ease-in-out infinite' }} />
              </div>
              <div className="text-center">
                <h2 className="text-[24px] font-[700] text-white">Créez votre premier workflow</h2>
                <p className="mt-2 text-[14px] text-[#94a3b8]">Glissez un élément depuis le panneau ou cliquez ci-dessous</p>
              </div>
              <button
                onClick={() => addNode(TRIGGER_TEMPLATES[0])}
                className="rounded-full bg-[#0ea5e9] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                + Commencer
              </button>
            </div>
          ) : (
            <ReactFlow
              nodeTypes={nodeTypes}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={(event) => {
                event.preventDefault()
                const data = event.dataTransfer.getData('application/reactflow')
                if (!data) return
                try {
                  const item: NodeTemplate = JSON.parse(data)
                  addNode(item)
                } catch (e) {
                  console.error('Invalid drag data')
                }
              }}
              onDragOver={(event) => event.preventDefault()}
              fitView
              className="flex-1"
            >
              <Background gap={20} size={1} color="#1a2236" />
              <Controls showInteractive={false} />
            </ReactFlow>
          )}
        </div>

        <div className="rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#111827] flex flex-col overflow-hidden" style={{ width: '25%' }}>
          <div className="border-b border-[rgba(255,255,255,0.08)] bg-[#0b1220] px-6 py-4">
            <h2 className="text-[16px] font-[600] text-white">Éléments</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <CollapsibleSection
              title="Triggers"
              icon={Zap}
              items={TRIGGER_TEMPLATES}
              isOpen={expandedSections.triggers}
              onToggle={() => setExpandedSections((s) => ({ ...s, triggers: !s.triggers }))}
              onItemDrag={(item) => {
                // Drag will be handled by onDragStart
              }}
              onItemClick={addNode}
            />

            <CollapsibleSection
              title="Conditions"
              icon={Filter}
              items={CONDITION_TEMPLATES}
              isOpen={expandedSections.conditions}
              onToggle={() => setExpandedSections((s) => ({ ...s, conditions: !s.conditions }))}
              onItemDrag={(item) => {
                // Drag will be handled by onDragStart
              }}
              onItemClick={addNode}
            />

            <CollapsibleSection
              title="Actions"
              icon={Send}
              items={ACTION_TEMPLATES}
              isOpen={expandedSections.actions}
              onToggle={() => setExpandedSections((s) => ({ ...s, actions: !s.actions }))}
              onItemDrag={(item) => {
                // Drag will be handled by onDragStart
              }}
              onItemClick={addNode}
            />
          </div>

          <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#0b1220] p-4 space-y-3">
            <button
              onClick={saveWorkflow}
              className="w-full rounded-full border border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Save className="mr-2 h-4 w-4 inline" /> Sauvegarder
            </button>
            <button
              onClick={() => selectedWorkflow && toggleWorkflowActive(selectedWorkflow.id)}
              className="w-full rounded-full bg-[#0ea5e9] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <Power className="mr-2 h-4 w-4 inline" />
              {selectedWorkflow?.active ? 'Désactiver' : 'Activer le workflow'}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#0b1220] px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-[600] text-white">Workflows sauvegardés</h3>
          <span className="text-xs text-[#94a3b8]">{workflows.length} workflow(s)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              onClick={() => handleWorkflowSelect(workflow)}
              className={`rounded-[16px] p-4 border transition cursor-pointer ${
                selectedWorkflow?.id === workflow.id
                  ? 'border-[#0ea5e9] bg-[#0ea5e9]/10'
                  : 'border-[rgba(255,255,255,0.08)] bg-[#111827] hover:border-[#0ea5e9]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-semibold text-white truncate flex-1">{workflow.name}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleWorkflowActive(workflow.id)
                  }}
                  className={`rounded-full px-2 py-1 text-xs font-semibold transition ${
                    workflow.active
                      ? 'bg-[#34d399] text-black hover:bg-[#34d399]/80'
                      : 'bg-[#4b5563] text-[#cbd5e1] hover:bg-[#4b5563]/80'
                  }`}
                >
                  {workflow.active ? 'Actif' : 'Inactif'}
                </button>
              </div>
              <p className="text-xs text-[#94a3b8]">Créé le {workflow.createdAt}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
