'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/translations'
import { api } from '@/lib/api'
import { BackButton } from '@/components/ui/BackButton'

interface ScheduledEvent {
  id: string
  platform: 'linkedin' | 'instagram' | 'facebook' | 'twitter'
  content: string
  contentKey?: TranslationKey
  date: string
  time: string
}

interface CalendarCell {
  iso: string
  date: Date
  day: number
  inCurrentMonth: boolean
}

// MONTHS and DAYS_OF_WEEK are computed inside the component via Intl (locale-aware)

const INITIAL_EVENTS: ScheduledEvent[] = [
  { id: 'linkedin-3', platform: 'linkedin', content: 'LinkedIn post on product roadmap', contentKey: 'schedule.mock.linkedin_roadmap', date: '2026-05-03', time: '09:00' },
  { id: 'linkedin-7', platform: 'linkedin', content: 'ProAI features announcement', contentKey: 'schedule.mock.linkedin_features', date: '2026-05-07', time: '11:00' },
  { id: 'linkedin-14', platform: 'linkedin', content: 'Growth hacking tip', contentKey: 'schedule.mock.linkedin_growth', date: '2026-05-14', time: '14:00' },
  { id: 'linkedin-21', platform: 'linkedin', content: 'Customer testimonial', contentKey: 'schedule.mock.linkedin_testimonial', date: '2026-05-21', time: '16:00' },
  { id: 'linkedin-28', platform: 'linkedin', content: 'Monthly wrap-up', contentKey: 'schedule.mock.linkedin_summary', date: '2026-05-28', time: '10:00' },
  { id: 'instagram-5', platform: 'instagram', content: 'Creative product story', contentKey: 'schedule.mock.instagram_story', date: '2026-05-05', time: '12:30' },
  { id: 'instagram-12', platform: 'instagram', content: 'Customer carousel post', contentKey: 'schedule.mock.instagram_carousel', date: '2026-05-12', time: '15:00' },
  { id: 'instagram-19', platform: 'instagram', content: 'Behind-the-scenes video', contentKey: 'schedule.mock.instagram_video', date: '2026-05-19', time: '18:00' },
  { id: 'instagram-26', platform: 'instagram', content: 'Training reel', contentKey: 'schedule.mock.instagram_reel', date: '2026-05-26', time: '17:00' },
  { id: 'facebook-10', platform: 'facebook', content: 'Live event announcement', contentKey: 'schedule.mock.facebook_live', date: '2026-05-10', time: '13:00' },
  { id: 'facebook-20', platform: 'facebook', content: 'Sponsored post', contentKey: 'schedule.mock.facebook_sponsored', date: '2026-05-20', time: '19:00' },
]

const PLATFORM_PILL_STYLE: Record<ScheduledEvent['platform'], string> = {
  linkedin: 'bg-[#0ea5e9] text-white',
  instagram: 'bg-[#f472b6] text-white',
  facebook: 'bg-[#8b5cf6] text-white',
  twitter: 'bg-[#1da1f2] text-white',
}

const PLATFORM_DOT_STYLE: Record<ScheduledEvent['platform'], string> = {
  linkedin: 'bg-[#0ea5e9]',
  instagram: 'bg-[#f472b6]',
  facebook: 'bg-[#8b5cf6]',
  twitter: 'bg-[#1da1f2]',
}

function generateCalendarDays(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1)
  const startDay = (firstDay.getDay() + 6) % 7
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const cells: CalendarCell[] = []

  for (let i = 0; i < 42; i += 1) {
    const dayNumber = i - startDay + 1
    let cellDate: Date
    let inCurrentMonth = true

    if (dayNumber <= 0) {
      cellDate = new Date(year, month - 1, daysInPrevMonth + dayNumber)
      inCurrentMonth = false
    } else if (dayNumber > daysInCurrentMonth) {
      cellDate = new Date(year, month + 1, dayNumber - daysInCurrentMonth)
      inCurrentMonth = false
    } else {
      cellDate = new Date(year, month, dayNumber)
    }

    cells.push({
      iso: cellDate.toISOString().slice(0, 10),
      date: cellDate,
      day: cellDate.getDate(),
      inCurrentMonth,
    })
  }

  return cells
}

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function truncateText(text: string, maxLength: number) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`
}

export default function SchedulePage() {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const intlLocale = locale === 'fr' ? 'fr-FR' : 'en-US'
  const MONTHS = Array.from({ length: 12 }, (_, i) => {
    const name = new Intl.DateTimeFormat(intlLocale, { month: 'long' }).format(new Date(2000, i, 1))
    return name.charAt(0).toUpperCase() + name.slice(1)
  })
  // Jan 1 2024 = Monday — generates Mon–Sun in order
  const DAYS_OF_WEEK = Array.from({ length: 7 }, (_, i) => {
    const name = new Intl.DateTimeFormat(intlLocale, { weekday: 'short' }).format(new Date(2024, 0, 1 + i))
    return name.charAt(0).toUpperCase() + name.slice(1)
  })
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth()) })
  const [events, setEvents] = useState<ScheduledEvent[]>(INITIAL_EVENTS)

  // Pre-fill modal if redirected from content page with ?content=...&platform=...
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const contentParam = params.get('content')
    const platformParam = params.get('platform')
    if (contentParam) {
      const platform = (platformParam as ScheduledEvent['platform']) || 'linkedin'
      setSelectedDay(today.toISOString().slice(0, 10))
      setFormData({ platform, content: decodeURIComponent(contentParam), time: '10:00' })
      setShowModal(true)
    }
  }, [])

  useEffect(() => {
    api.get<{ id: string; platform: string; content: string; scheduled_date: string; scheduled_time: string }[]>('/api/v1/schedule/posts')
      .then((posts) => {
        const apiEvents: ScheduledEvent[] = posts.map((p) => ({
          id: p.id,
          platform: p.platform as ScheduledEvent['platform'],
          content: p.content,
          date: p.scheduled_date,
          time: p.scheduled_time,
        }))
        setEvents((prev) => {
          const existingIds = new Set(prev.map((e) => e.id))
          const newOnes = apiEvents.filter((e) => !existingIds.has(e.id))
          return [...prev, ...newOnes]
        })
      })
      .catch(() => {})
  }, [])
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null)
  const [formData, setFormData] = useState<{ platform: ScheduledEvent['platform']; content: string; time: string }>({ platform: 'linkedin', content: '', time: '10:00' })

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  const handleToday = () => { const d = new Date(); setCurrentDate(new Date(d.getFullYear(), d.getMonth())) }

  const handleCellClick = (dateIso: string) => {
    setSelectedDay(dateIso)
    setFormData({ platform: 'linkedin', content: '', time: '10:00' })
    setShowModal(true)
    setSelectedEvent(null)
  }

  const handlePillClick = (event: ScheduledEvent) => {
    setSelectedEvent(event)
    setShowModal(false)
  }

  const handleSaveEvent = () => {
    if (!formData.content) return
    setEvents((prev) => [
      ...prev,
      {
        id: `event-${Date.now()}`,
        platform: formData.platform,
        content: formData.content,
        date: selectedDay,
        time: formData.time,
      },
    ])
    setShowModal(false)
  }

  const cells = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth())
  const eventsByDate = cells.reduce<Record<string, ScheduledEvent[]>>((acc, cell) => {
    const dayEvents = events.filter((event) => event.date === cell.iso)
    if (dayEvents.length) acc[cell.iso] = dayEvents
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#0c1220] px-4 py-6 text-white sm:px-6 lg:px-8 animate-fade-up">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <BackButton />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[28px] font-[700] text-white" style={{ letterSpacing: '-0.02em' }}>{t('schedule.title')}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#94a3b8]">{t('schedule.subtitle2')}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/agenda')}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t('schedule.viewagenda')}
            </button>
            <button
              type="button"
              onClick={() => handleCellClick(currentDate.toISOString().slice(0, 10))}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#fb923c] to-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <Plus className="mr-2 h-4 w-4" /> {t('schedule.newpost')}
            </button>
          </div>
        </div>

        <div className="rounded-[24px] p-6" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', boxShadow: '0 15px 40px rgba(0,0,0,0.15)' }}>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[28px] font-[700] text-white">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#0ea5e9] hover:text-black"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#0ea5e9] hover:text-black"
              >
                {t('schedule.today')}
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#0ea5e9] hover:text-black"
              >
                &gt;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 text-center text-[12px] font-[600] uppercase tracking-[0.14em] text-[#94a3b8]">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-3">
            {cells.map((cell) => {
              const dayEvents = eventsByDate[cell.iso] || []
              const isToday = isSameDate(cell.date, today)
              const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6

              return (
                <div
                  key={cell.iso}
                  onClick={() => handleCellClick(cell.iso)}
                  className={`group rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[#111827] p-3 min-h-[120px] transition-all duration-200 ease-in-out hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(14,165,233,0.15)] hover:border-[#0ea5e9] ${cell.inCurrentMonth ? '' : 'opacity-25'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[16px] font-[600] ${isWeekend ? 'text-[#fb923c]' : 'text-white'}`}>{cell.day}</span>
                    {isToday && <span className="text-[10px] uppercase tracking-[0.2em] text-[#0ea5e9]">{t('schedule.today')}</span>}
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    <div className="hidden flex-col gap-2 md:flex">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={(eventClick) => {
                            eventClick.stopPropagation()
                            handlePillClick(event)
                          }}
                          className={`inline-flex w-full items-center rounded-full px-3 py-1 text-[11px] font-medium transition ${PLATFORM_PILL_STYLE[event.platform]}`}
                        >
                          {event.platform} · {truncateText(event.contentKey ? t(event.contentKey) : event.content, 26)}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span key={event.id} className={`h-2.5 w-2.5 rounded-full ${PLATFORM_DOT_STYLE[event.platform]}`} />
                      ))}
                    </div>

                    {dayEvents.length > 3 && (
                      <div className="text-[11px] text-[#94a3b8]">+{dayEvents.length - 3} {t('schedule.others')}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
          <div className="w-full max-w-lg rounded-[24px] p-6 animate-scale-in" style={{ background: 'var(--bg-surface)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--border-color)', boxShadow: '0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(14,165,233,0.08)' }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{t('schedule.addEvent')}</h2>
                <p className="mt-1 text-sm text-[#94a3b8]">{t('schedule.selectedDate')} : {selectedDay}</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-[#94a3b8] transition hover:text-white">{t('schedule.close')}</button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="space-y-2 text-sm text-[#cbd5e1]">
                {t('schedule.platform')}
                <select
                  value={formData.platform}
                  onChange={(event) => setFormData({ ...formData, platform: event.target.value as ScheduledEvent['platform'] })}
                  className="w-full rounded-[16px] border border-[rgba(255,255,255,0.12)] bg-[#0c1220] px-4 py-3 text-sm text-white outline-none focus:border-[#0ea5e9]"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter / X</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-[#cbd5e1]">
                {t('schedule.content')}
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(event) => setFormData({ ...formData, content: event.target.value })}
                  className="w-full rounded-[16px] border border-[rgba(255,255,255,0.12)] bg-[#0c1220] px-4 py-3 text-sm text-white outline-none focus:border-[#0ea5e9]"
                />
              </label>

              <label className="space-y-2 text-sm text-[#cbd5e1]">
                {t('schedule.time')}
                <input
                  type="time"
                  value={formData.time}
                  onChange={(event) => setFormData({ ...formData, time: event.target.value })}
                  className="w-full rounded-[16px] border border-[rgba(255,255,255,0.12)] bg-[#0c1220] px-4 py-3 text-sm text-white outline-none focus:border-[#0ea5e9]"
                />
              </label>

              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvent}
                  className="rounded-full bg-gradient-to-r from-[#fb923c] to-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  {t('schedule.saveEvent')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-6 sm:items-center">
          <div className="w-full max-w-md rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#94a3b8]">{t('schedule.details')}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{selectedEvent.platform} · {selectedEvent.time}</h3>
              </div>
              <button type="button" onClick={() => setSelectedEvent(null)} className="text-[#94a3b8] transition hover:text-white">{t('schedule.close')}</button>
            </div>

            <div className="mt-4 rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#0c1220] p-4">
              <p className="text-sm text-[#94a3b8]">{t('schedule.date')}</p>
              <p className="mt-1 text-white">{selectedEvent.date}</p>
              <p className="mt-4 text-sm text-[#94a3b8]">{t('schedule.content')}</p>
              <p className="mt-1 text-white">{selectedEvent.contentKey ? t(selectedEvent.contentKey) : selectedEvent.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
