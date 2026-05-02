# Script Python pour creer la page Agenda de ProAI
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web", "app", "(app)", "agenda", "page.tsx"
)
os.makedirs(os.path.dirname(TARGET), exist_ok=True)

CODE = r"""'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays, Plus, Sparkles, ChevronLeft, ChevronRight,
  Clock, CheckSquare, Square, Trash2, GripVertical,
  Video, Phone, Pencil, Coffee, Brain, Target, X
} from 'lucide-react'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)
const DAYS_SHORT = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']

const EVENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  meeting: { bg: 'rgba(14,165,233,0.2)', border: '#0ea5e9', text: '#7dd3fc' },
  focus: { bg: 'rgba(52,211,153,0.2)', border: '#34d399', text: '#6ee7b7' },
  call: { bg: 'rgba(251,146,60,0.2)', border: '#fb923c', text: '#fdba74' },
  break: { bg: 'rgba(148,163,184,0.15)', border: '#64748b', text: '#94a3b8' },
  ai: { bg: 'rgba(139,92,246,0.2)', border: '#8b5cf6', text: '#c4b5fd' },
}

interface CalEvent {
  id: string; title: string; day: number
  startHour: number; startMin: number; endHour: number; endMin: number
  type: string; icon: string; aiSuggested?: boolean
}

interface Task { id: string; text: string; done: boolean; priority: 'high' | 'medium' | 'low' }

const INITIAL_EVENTS: CalEvent[] = [
  { id: '1', title: 'Sprint planning', day: 0, startHour: 9, startMin: 0, endHour: 10, endMin: 0, type: 'meeting', icon: 'video' },
  { id: '2', title: 'Deep work - Strategie', day: 0, startHour: 10, startMin: 30, endHour: 12, endMin: 30, type: 'focus', icon: 'brain' },
  { id: '3', title: 'Call client Nextera', day: 1, startHour: 14, startMin: 0, endHour: 15, endMin: 0, type: 'call', icon: 'phone' },
  { id: '4', title: 'Revue produit', day: 2, startHour: 10, startMin: 0, endHour: 11, endMin: 0, type: 'meeting', icon: 'video' },
  { id: '5', title: 'Redaction newsletter', day: 2, startHour: 14, startMin: 0, endHour: 16, endMin: 0, type: 'focus', icon: 'brain' },
  { id: '6', title: 'Pause dejeuner', day: 3, startHour: 12, startMin: 0, endHour: 13, endMin: 0, type: 'break', icon: 'coffee' },
  { id: '7', title: 'Analyse KPIs Q2', day: 3, startHour: 9, startMin: 0, endHour: 10, endMin: 30, type: 'focus', icon: 'brain' },
  { id: '8', title: 'Sync equipe Sales', day: 4, startHour: 11, startMin: 0, endHour: 11, endMin: 45, type: 'meeting', icon: 'video' },
]

const AI_SUGGESTIONS: CalEvent[] = [
  { id: 'ai1', title: 'Deep work suggere', day: 1, startHour: 9, startMin: 0, endHour: 11, endMin: 0, type: 'ai', icon: 'brain', aiSuggested: true },
  { id: 'ai2', title: 'Prepa call client', day: 1, startHour: 13, startMin: 0, endHour: 13, endMin: 45, type: 'ai', icon: 'brain', aiSuggested: true },
]

const INITIAL_TASKS: Task[] = [
  { id: 't1', text: 'Finaliser le briefing marketing', done: false, priority: 'high' },
  { id: 't2', text: 'Mettre a jour le pipeline CRM', done: false, priority: 'medium' },
  { id: 't3', text: 'Valider le script video', done: false, priority: 'high' },
  { id: 't4', text: 'Envoyer rapport hebdo', done: true, priority: 'low' },
  { id: 't5', text: 'Planifier posts LinkedIn', done: false, priority: 'medium' },
]

function getWeekDates(offset: number): Date[] {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function isToday(d: Date): boolean {
  const now = new Date()
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

const ICON_MAP: Record<string, React.ElementType> = {
  video: Video, phone: Phone, brain: Brain, coffee: Coffee, target: Target, pencil: Pencil,
}

export default function AgendaPage() {
  const router = useRouter()
  const [weekOffset, setWeekOffset] = useState(0)
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [events, setEvents] = useState<CalEvent[]>(INITIAL_EVENTS)
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [showAiSuggestions, setShowAiSuggestions] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalDay, setModalDay] = useState(0)
  const [modalHour, setModalHour] = useState(9)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('meeting')
  const [newDuration, setNewDuration] = useState(60)
  const [aiLoading, setAiLoading] = useState(false)
  const [chargeLevel, setChargeLevel] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)

  const weekDates = getWeekDates(weekOffset)
  const now = new Date()
  const currentHour = now.getHours()
  const currentMin = now.getMinutes()

  useEffect(() => {
    const total = events.filter(e => !e.aiSuggested).reduce((acc, e) => acc + (e.endHour - e.startHour) + (e.endMin - e.startMin) / 60, 0)
    setChargeLevel(Math.min(100, Math.round((total / 40) * 100)))
  }, [events])

  useEffect(() => { if (gridRef.current) gridRef.current.scrollTop = Math.max(0, (currentHour - 8) * 80 - 40) }, [])

  const handleAiPlan = () => { setAiLoading(true); setTimeout(() => { setShowAiSuggestions(true); setEvents(prev => [...prev, ...AI_SUGGESTIONS]); setAiLoading(false) }, 1500) }
  const acceptSuggestion = (id: string) => setEvents(prev => prev.map(e => e.id === id ? { ...e, aiSuggested: false, type: 'focus' } : e))
  const dismissSuggestion = (id: string) => setEvents(prev => prev.filter(e => e.id !== id))
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const addEvent = () => {
    if (!newTitle.trim()) return
    setEvents(prev => [...prev, { id: `e${Date.now()}`, title: newTitle, day: modalDay, startHour: modalHour, startMin: 0, endHour: modalHour + Math.floor(newDuration / 60), endMin: newDuration % 60, type: newType, icon: newType === 'meeting' ? 'video' : newType === 'call' ? 'phone' : newType === 'focus' ? 'brain' : 'coffee' }])
    setShowModal(false); setNewTitle('')
  }

  const openAddModal = (day: number, hour: number) => { setModalDay(day); setModalHour(hour); setNewTitle(''); setNewType('meeting'); setNewDuration(60); setShowModal(true) }
  const chargeColor = chargeLevel > 80 ? '#ef4444' : chargeLevel > 50 ? '#fb923c' : '#34d399'

  return (
    <div className="flex flex-col h-full animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#0ea5e9' }}>Agenda intelligent</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}><Sparkles size={10} /> IA</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Planifiez votre semaine et vos rappels</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#111827' }}>
            <span style={{ color: '#94a3b8' }}>Charge</span>
            <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${chargeLevel}%`, background: chargeColor }} />
            </div>
            <span style={{ color: chargeColor }}>{chargeLevel}%</span>
          </div>
          <button onClick={handleAiPlan} disabled={aiLoading} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}>
            <Sparkles size={14} />{aiLoading ? 'Analyse en cours...' : 'Planifier avec IA'}
          </button>
          <div className="flex rounded-full overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {(['day', 'week', 'month'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className="px-4 py-1.5 text-xs font-medium transition-colors" style={{ background: view === v ? '#0ea5e9' : 'transparent', color: view === v ? 'white' : '#94a3b8' }}>
                {v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-[#1a2236]" style={{ color: '#94a3b8' }}><ChevronLeft size={18} /></button>
        <button onClick={() => setWeekOffset(0)} className="px-3 py-1 rounded-full text-xs font-medium hover:bg-[#1a2236]" style={{ color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>Aujourd'hui</button>
        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-[#1a2236]" style={{ color: '#94a3b8' }}><ChevronRight size={18} /></button>
        <span className="text-sm font-semibold text-white ml-2">{weekDates[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
      </div>
      {showAiSuggestions && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 animate-fade-up" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <Sparkles size={16} style={{ color: '#a78bfa' }} />
          <span className="text-sm" style={{ color: '#c4b5fd' }}>L'IA a suggere 2 creneaux optimaux. Acceptez ou rejetez-les.</span>
        </div>
      )}
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 rounded-xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="p-3 text-xs font-medium" style={{ color: '#64748b' }}><Clock size={14} /></div>
            {weekDates.map((d, i) => (
              <div key={i} className={`p-3 text-center ${isToday(d) ? 'bg-[rgba(14,165,233,0.08)]' : ''}`}>
                <div className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: i >= 5 ? '#fb923c' : '#64748b' }}>{DAYS_SHORT[i]}</div>
                <div className={`text-lg font-bold mt-0.5 ${isToday(d) ? 'text-[#0ea5e9]' : 'text-white'}`}>{d.getDate()}</div>
                {isToday(d) && <div className="w-1.5 h-1.5 rounded-full mx-auto mt-1" style={{ background: '#0ea5e9', boxShadow: '0 0 6px #0ea5e9' }} />}
              </div>
            ))}
          </div>
          <div ref={gridRef} className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)' }}>
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 relative" style={{ minHeight: '80px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="p-2 text-right pr-3 text-xs font-medium" style={{ color: '#64748b' }}>{`${hour.toString().padStart(2, '0')}:00`}</div>
                {weekOffset === 0 && hour === currentHour && (
                  <div className="absolute left-[12.5%] right-0 z-20 pointer-events-none flex items-center" style={{ top: `${(currentMin / 60) * 100}%` }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                    <div className="flex-1 h-[2px]" style={{ background: 'linear-gradient(90deg, #ef4444, transparent)' }} />
                  </div>
                )}
                {weekDates.map((d, dayIdx) => {
                  const cellKey = `${dayIdx}-${hour}`
                  const cellEvents = events.filter(e => e.day === dayIdx && e.startHour === hour)
                  const isHovered = hoveredCell === cellKey
                  return (
                    <div key={dayIdx} className="relative border-l transition-colors cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.04)', background: isToday(d) ? 'rgba(14,165,233,0.03)' : isHovered ? 'rgba(255,255,255,0.02)' : 'transparent' }} onMouseEnter={() => setHoveredCell(cellKey)} onMouseLeave={() => setHoveredCell(null)} onClick={() => cellEvents.length === 0 && openAddModal(dayIdx, hour)}>
                      {isHovered && cellEvents.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium" style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1px dashed rgba(14,165,233,0.3)' }}><Plus size={10} /> Ajouter</div>
                        </div>
                      )}
                      {cellEvents.map(event => {
                        const colors = EVENT_COLORS[event.type] || EVENT_COLORS.meeting
                        const dur = (event.endHour - event.startHour) + (event.endMin - event.startMin) / 60
                        const Icon = ICON_MAP[event.icon] || CalendarDays
                        return (
                          <div key={event.id} className="absolute left-1 right-1 rounded-lg px-2 py-1.5 z-10 transition-all duration-200 hover:scale-[1.02] hover:z-20 group" style={{ top: `${(event.startMin / 60) * 100}%`, height: `${dur * 80 - 4}px`, background: colors.bg, borderLeft: `3px solid ${colors.border}` }}>
                            <div className="flex items-center gap-1.5"><Icon size={11} style={{ color: colors.text }} /><span className="text-[11px] font-semibold truncate" style={{ color: colors.text }}>{event.title}</span></div>
                            <div className="text-[9px] mt-0.5" style={{ color: colors.text, opacity: 0.7 }}>{`${event.startHour.toString().padStart(2, '0')}:${event.startMin.toString().padStart(2, '0')} - ${event.endHour.toString().padStart(2, '0')}:${event.endMin.toString().padStart(2, '0')}`}</div>
                            {event.aiSuggested && (
                              <div className="flex items-center gap-1 mt-1">
                                <button onClick={e => { e.stopPropagation(); acceptSuggestion(event.id) }} className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399' }}>Accepter</button>
                                <button onClick={e => { e.stopPropagation(); dismissSuggestion(event.id) }} className="px-1.5 py-0.5 rounded text-[9px]" style={{ color: '#94a3b8' }}><X size={10} /></button>
                              </div>
                            )}
                            <div className="hidden group-hover:flex absolute top-1 right-1 gap-0.5">
                              <button className="p-0.5 rounded" style={{ color: '#94a3b8' }}><Pencil size={10} /></button>
                              <button onClick={e => { e.stopPropagation(); setEvents(prev => prev.filter(ev => ev.id !== event.id)) }} className="p-0.5 rounded" style={{ color: '#ef4444' }}><Trash2 size={10} /></button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="w-72 flex-shrink-0 rounded-xl p-4 flex flex-col gap-4" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#0ea5e9' }}>Taches du jour</h3>
            <p className="text-lg font-bold text-white">Checklist intelligente</p>
          </div>
          <button onClick={() => router.push('/chat?agent=automation')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:-translate-y-0.5" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px dashed rgba(139,92,246,0.3)' }}>
            <Sparkles size={12} /> Demander a l'IA d'organiser
          </button>
          <div className="flex-1 overflow-y-auto space-y-2">
            {tasks.map(task => {
              const prioColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#fb923c' : '#0ea5e9'
              return (
                <div key={task.id} className="flex items-start gap-2 px-3 py-2.5 rounded-lg transition-all hover:-translate-y-0.5 cursor-pointer group" style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <button onClick={() => toggleTask(task.id)} className="mt-0.5 flex-shrink-0">{task.done ? <CheckSquare size={16} style={{ color: '#34d399' }} /> : <Square size={16} style={{ color: '#64748b' }} />}</button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.done ? 'line-through text-[#64748b]' : 'text-[#e2e8f0]'}`}>{task.text}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `${prioColor}20`, color: prioColor }}>{task.priority}</span>
                  </div>
                  <GripVertical size={12} className="hidden group-hover:block mt-1 cursor-grab" style={{ color: '#64748b' }} />
                </div>
              )
            })}
          </div>
          <button onClick={() => setTasks(prev => [...prev, { id: `t${Date.now()}`, text: 'Nouvelle tache', done: false, priority: 'medium' }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ color: '#94a3b8', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Plus size={12} /> Ajouter une tache
          </button>
          <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] uppercase font-semibold mb-2" style={{ color: '#64748b' }}>Legende</p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(EVENT_COLORS).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5 text-[10px]" style={{ color: val.text }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: val.border }} />
                  {key === 'meeting' ? 'Reunion' : key === 'focus' ? 'Focus' : key === 'call' ? 'Appel' : key === 'break' ? 'Pause' : 'IA'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="rounded-2xl p-6 w-full max-w-md animate-fade-up" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Nouvel evenement</h3>
              <button onClick={() => setShowModal(false)} style={{ color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1">Titre</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Sprint planning" className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-[#64748b]" style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Type</label>
                  <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-white" style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <option value="meeting">Reunion</option><option value="focus">Focus</option><option value="call">Appel</option><option value="break">Pause</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Duree</label>
                  <select value={newDuration} onChange={e => setNewDuration(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg text-sm text-white" style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>1h</option><option value={90}>1h30</option><option value={120}>2h</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-full text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>Annuler</button>
                <button onClick={addEvent} className="flex-1 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
"""

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(CODE.lstrip())

print(f"[OK] Fichier cree : {TARGET}")
print(f"[OK] Taille : {os.path.getsize(TARGET)} octets")
