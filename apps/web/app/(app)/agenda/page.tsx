'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'

type AgendaEvent = {
  id: string
  title: string
  description: string
  date: string
  start: string
  end: string
  reminder: string
  color: string
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
}

type AgendaTask = {
  id: string
  title: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

const initialEvents: AgendaEvent[] = [
  {
    id: 'evt-1',
    title: 'Revue produit',
    description: 'Préparer la démo avec l’équipe produit.',
    date: new Date().toISOString().slice(0, 10),
    start: '10:00',
    end: '11:00',
    reminder: '30min',
    color: '#0ea5e9',
    recurrence: 'weekly',
  },
  {
    id: 'evt-2',
    title: 'Standup client',
    description: 'Point rapide sur les livrables.',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().slice(0, 10),
    start: '14:00',
    end: '14:30',
    reminder: '15min',
    color: '#fb923c',
    recurrence: 'none',
  },
  {
    id: 'evt-3',
    title: 'Sprint planning',
    description: 'Organisation des priorités pour la semaine.',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0, 10),
    start: '09:00',
    end: '10:30',
    reminder: '1h',
    color: '#22c55e',
    recurrence: 'weekly',
  },
  {
    id: 'evt-4',
    title: 'Audit contenu',
    description: 'Vérifier les posts et articles programmés.',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().slice(0, 10),
    start: '16:00',
    end: '17:00',
    reminder: '1h',
    color: '#8b5cf6',
    recurrence: 'none',
  },
  {
    id: 'evt-5',
    title: 'Rappel facturation',
    description: 'Envoi facture au client A.',
    date: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString().slice(0, 10),
    start: '11:00',
    end: '11:30',
    reminder: '15min',
    color: '#ec4899',
    recurrence: 'monthly',
  },
]

const initialTasks: AgendaTask[] = [
  { id: 'tsk-1', title: 'Finaliser le briefing marketing', completed: false, priority: 'high' },
  { id: 'tsk-2', title: 'Répondre aux emails clients', completed: true, priority: 'medium' },
  { id: 'tsk-3', title: 'Mettre à jour le pipeline', completed: false, priority: 'low' },
  { id: 'tsk-4', title: 'Valider le script vidéo', completed: false, priority: 'high' },
]

const reminders = ['15min', '30min', '1h', '1j'] as const
const recurrences = ['none', 'daily', 'weekly', 'monthly'] as const

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'numeric' })
}

function formatTimeLabel(hour: number) {
  return `${hour.toString().padStart(2, '0')}:00`
}

function getWeekDays(reference: Date) {
  const current = new Date(reference)
  const dayIndex = current.getDay() || 7
  const monday = new Date(current)
  monday.setDate(current.getDate() - dayIndex + 1)
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    return day
  })
}

function buildMonthRange(reference: Date) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1)
  return Array.from({ length: 28 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

export default function AgendaPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const [events, setEvents] = useState<AgendaEvent[]>(initialEvents)
  const [tasks, setTasks] = useState<AgendaTask[]>(initialTasks)
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week')
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    start: '08:00',
    end: '09:00',
    reminder: '30min',
    color: '#0ea5e9',
    recurrence: 'none',
  })
  const [error, setError] = useState('')

  const today = useMemo(() => new Date(), [])
  const weekDays = useMemo(() => getWeekDays(today), [today])
  const monthDays = useMemo(() => buildMonthRange(today), [today])
  const displayView = isMobile ? 'day' : viewType
  const displayDays = displayView === 'day' ? [weekDays[0]] : displayView === 'week' ? weekDays : monthDays

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (selectedSlot) {
      setForm((current) => ({ ...current, date: selectedSlot.date, start: formatTimeLabel(selectedSlot.hour), end: formatTimeLabel(selectedSlot.hour + 1) }))
    }
  }, [selectedSlot])

  const hours = Array.from({ length: 13 }, (_, index) => 8 + index)

  const scheduleKey = displayView === 'month' ? 'month' : displayView

  const handleSlotClick = (date: string, hour: number) => {
    setSelectedSlot({ date, hour })
    setForm((current) => ({ ...current, date, start: formatTimeLabel(hour), end: formatTimeLabel(hour + 1) }))
    setIsModalOpen(true)
  }

  const handleCreateEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Le titre est requis.')
      return
    }

    const newEvent: AgendaEvent = {
      id: `evt-${Date.now()}`,
      title: form.title,
      description: form.description,
      date: form.date,
      start: form.start,
      end: form.end,
      reminder: form.reminder,
      color: form.color,
      recurrence: form.recurrence as AgendaEvent['recurrence'],
    }

    setEvents((current) => [...current, newEvent])
    setIsModalOpen(false)

    try {
      await fetch('/api/v1/agenda/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      })
    } catch {
      // silent fallback for mock mode
    }
  }

  const toggleTask = async (taskId: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    )
    try {
      await fetch(`/api/v1/agenda/tasks/${taskId}/toggle`, { method: 'PATCH' })
    } catch {
      // ignore
    }
  }

  const handleAskAi = () => {
    router.push('/chat/new?agent=analytics&context=agenda')
  }

  const activeTasks = tasks.filter((task) => !task.completed)

  return (
    <div className="min-h-screen bg-[#0c1220] text-white animate-fade-up">
      <div className="max-w-7xl mx-auto space-y-6 px-4 pb-10 lg:px-6">
        <div className="rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#0ea5e9]">Agenda intelligent</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Planifiez votre semaine et vos rappels</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">Organisez les événements, visualisez le planning et suivez les tâches quotidiennes avec IA.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['day', 'week', 'month'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewType(mode)}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${viewType === mode ? 'bg-primary text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                >
                  {mode === 'day' ? 'Jour' : mode === 'week' ? 'Semaine' : 'Mois'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr,0.9fr]">
          <section className="space-y-4 rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-4 shadow-xl shadow-black/20">
            <div className="overflow-x-auto rounded-3xl border border-[#1f2937] bg-[#0f172a]/70">
              {scheduleKey === 'month' ? (
                <div className="grid grid-cols-7 gap-2 p-4">
                  {monthDays.map((day) => {
                    const dateKey = day.toISOString().slice(0, 10)
                    const dayEvents = events.filter((event) => event.date === dateKey)
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => handleSlotClick(dateKey, 10)}
                        className="min-h-[120px] rounded-3xl border border-[#1e293b] bg-[#111827] p-4 text-left transition hover:border-primary/50 hover:bg-[#111827]/90"
                      >
                        <div className="flex items-center justify-between text-sm text-slate-300">
                          <span>{formatDayLabel(day)}</span>
                          <span>{dayEvents.length} év.</span>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-200">
                          {dayEvents.slice(0, 2).map((item) => (
                            <div key={item.id} className="rounded-2xl px-3 py-2" style={{ backgroundColor: `${item.color}22` }}>
                              {item.title}
                            </div>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="grid min-w-[960px] grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-px bg-[#0f172a]">
                  <div className="bg-[#111827] p-3 text-sm font-semibold text-slate-400">Heure</div>
                  {displayDays.map((day) => (
                    <div key={day.toISOString()} className="bg-[#111827] p-3 text-sm font-semibold text-slate-200">
                      <div>{formatDayLabel(day)}</div>
                    </div>
                  ))}
                  {hours.map((hour) => (
                    <>
                      <div key={`hour-${hour}`} className="bg-[#0f172a] p-3 text-sm text-slate-400">{formatTimeLabel(hour)}</div>
                      {displayDays.map((day) => {
                        const dateKey = day.toISOString().slice(0, 10)
                        const slotEvents = events.filter((event) => event.date === dateKey && Number(event.start.split(':')[0]) === hour)
                        return (
                          <button
                            key={`${dateKey}-${hour}`}
                            type="button"
                            onClick={() => handleSlotClick(dateKey, hour)}
                            className="group relative min-h-[96px] overflow-hidden border border-[#0f172a] bg-[#111827] p-3 text-left transition hover:border-primary/40 hover:bg-[#111827]/90"
                          >
                            {slotEvents.length > 0 ? (
                              slotEvents.map((event) => (
                                <div
                                  key={event.id}
                                  className="rounded-2xl p-3 text-sm font-medium text-white shadow-lg shadow-black/10"
                                  style={{ backgroundColor: event.color }}
                                >
                                  <div>{event.title}</div>
                                  <div className="text-xs opacity-80">{event.start} - {event.end}</div>
                                </div>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-500 group-hover:text-slate-300">Ajouter</span>
                            )}
                          </button>
                        )
                      })}
                    </>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4 rounded-3xl border border-[#1f2937] bg-[#111827]/90 p-5 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#fb923c]">Tâches du jour</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Checklist intelligente</h2>
              </div>
              <button
                onClick={handleAskAi}
                className="rounded-2xl border border-[#2b3348] bg-[#111827] px-4 py-2 text-sm text-slate-200 transition hover:border-primary hover:text-white"
              >
                Demander à l'IA
              </button>
            </div>

            <div className="space-y-3">
              {activeTasks.length === 0 ? (
                <div className="rounded-3xl border border-[#1e293b] bg-[#0f172a] p-4 text-sm text-slate-400">Toutes les tâches du jour sont complétées.</div>
              ) : (
                activeTasks.map((task) => {
                  const badge = task.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500' : task.priority === 'medium' ? 'bg-orange-500/20 text-orange-300 border-orange-500' : 'bg-sky-500/20 text-sky-300 border-sky-500'
                  return (
                    <label key={task.id} className="group flex items-start gap-3 rounded-3xl border border-[#1e293b] bg-[#0f172a] p-4 transition hover:border-primary/40">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{task.title}</p>
                        <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${badge}`}>{task.priority}</span>
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </aside>
        </div>

        {isModalOpen ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#1f2937] bg-[#0b1120] p-6 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between gap-4 pb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Ajouter un événement</h2>
                  <p className="text-sm text-slate-400">Planifiez un rendez-vous, un rappel ou une tâche clé.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-primary">Fermer</button>
              </div>

              <form className="grid gap-4" onSubmit={handleCreateEvent}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    Titre
                    <input
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                      value={form.title}
                      onChange={(event) => setForm({ ...form, title: event.target.value })}
                    />
                  </label>

                  <label className="space-y-2 text-sm text-slate-300">
                    Date
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                      value={form.date}
                      onChange={(event) => setForm({ ...form, date: event.target.value })}
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm text-slate-300">
                  Description
                  <textarea
                    className="w-full min-h-[110px] rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    Début
                    <input
                      type="time"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                      value={form.start}
                      onChange={(event) => setForm({ ...form, start: event.target.value })}
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Fin
                    <input
                      type="time"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                      value={form.end}
                      onChange={(event) => setForm({ ...form, end: event.target.value })}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-2 text-sm text-slate-300">
                    Rappel
                    <select
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                      value={form.reminder}
                      onChange={(event) => setForm({ ...form, reminder: event.target.value })}
                    >
                      {reminders.map((reminder) => (
                        <option key={reminder} value={reminder}>{reminder}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Couleur
                    <input
                      type="color"
                      className="h-12 w-full cursor-pointer rounded-2xl border border-slate-700 bg-slate-900 p-1"
                      value={form.color}
                      onChange={(event) => setForm({ ...form, color: event.target.value })}
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Récurrence
                    <select
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary"
                      value={form.recurrence}
                      onChange={(event) => setForm({ ...form, recurrence: event.target.value })}
                    >
                      {recurrences.map((recurrence) => (
                        <option key={recurrence} value={recurrence}>{recurrence}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {error ? <p className="text-sm text-red-400">{error}</p> : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm text-slate-200 transition hover:bg-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary/90"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
