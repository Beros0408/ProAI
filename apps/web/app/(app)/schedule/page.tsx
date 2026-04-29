'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/Button'

interface ScheduledPost {
  id: string
  platform: 'linkedin' | 'instagram' | 'facebook'
  content: string
  date: string
  time: string
  status: 'planned' | 'published' | 'draft'
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  planned: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  published: { bg: 'bg-green-500/20', text: 'text-green-400' },
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
}

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-600',
  instagram: 'bg-gradient-to-r from-pink-500 to-orange-400',
  facebook: 'bg-blue-500',
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function getFirstDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

function CalendarDay({ day, posts, onAddPost }: { day: number; posts: ScheduledPost[]; onAddPost: (date: string) => void }) {
  return (
    <div
      className="min-h-24 bg-base border border-[#1E1E2E] rounded-lg p-2 hover:border-primary/50 transition-colors cursor-pointer group"
      onClick={() => onAddPost(`${day.toString().padStart(2, '0')}`)}
    >
      <div className="text-xs font-semibold text-foreground mb-1">{day}</div>
      <div className="space-y-1">
        {posts.slice(0, 2).map((post) => (
          <div
            key={post.id}
            className={`text-xs px-2 py-1 rounded-full text-white truncate ${PLATFORM_COLORS[post.platform]}`}
          >
            {post.platform}
          </div>
        ))}
        {posts.length > 2 && (
          <div className="text-xs text-muted">+{posts.length - 2} plus</div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onAddPost(`${day.toString().padStart(2, '0')}`)
        }}
        className="opacity-0 group-hover:opacity-100 mt-2 text-primary text-xs font-medium transition-opacity"
      >
        + Ajouter
      </button>
    </div>
  )
}

export default function SchedulePage() {
  const { t } = useTranslation()
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth()))
  const [posts, setPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      platform: 'linkedin',
      content: 'Nouvelle feature disponible!',
      date: '2024-04-15',
      time: '10:00',
      status: 'published',
    },
    {
      id: '2',
      platform: 'instagram',
      content: 'Check out our latest insights...',
      date: '2024-04-20',
      time: '14:00',
      status: 'planned',
    },
  ])
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [formData, setFormData] = useState({
    platform: 'linkedin' as const,
    content: '',
    time: '10:00',
  })

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleAddPost = (day: string) => {
    setSelectedDay(day)
    setShowModal(true)
  }

  const handleSavePost = () => {
    if (!formData.content) return

    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${selectedDay}`
    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      platform: formData.platform,
      content: formData.content,
      date: dateString,
      time: formData.time,
      status: 'planned',
    }

    setPosts([...posts, newPost])
    setFormData({ platform: 'linkedin', content: '', time: '10:00' })
    setShowModal(false)
  }

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id))
  }

  const getPostsForDay = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return posts.filter((p) => p.date === dateString)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground gradient-text">Calendrier de publication</h1>
        <p className="text-muted text-sm mt-0.5">Planifiez et programmez vos publications</p>
      </div>

      {/* Calendar Header */}
      <div className="bg-surface border border-[#1E1E2E] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-[#1E1E2E] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-[#1E1E2E] rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 bg-base/50 rounded-lg border border-[#1E1E2E]/50" />
          ))}
          {days.map((day) => (
            <CalendarDay
              key={day}
              day={day}
              posts={getPostsForDay(day)}
              onAddPost={handleAddPost}
            />
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-surface border border-[#1E1E2E] rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Posts planifiés</h3>
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-muted text-sm">Aucun post planifié</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between p-4 bg-base border border-[#1E1E2E] rounded-lg hover-lift"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${PLATFORM_COLORS[post.platform]}`}>
                      {post.platform}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[post.status].bg} ${STATUS_STYLES[post.status].text}`}>
                      {post.status === 'planned' && 'Planifié'}
                      {post.status === 'published' && 'Publié'}
                      {post.status === 'draft' && 'Brouillon'}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-2">{post.content}</p>
                  <p className="text-xs text-muted">
                    {post.date} à {post.time}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-surface border border-[#1E1E2E] rounded-xl p-6 w-full max-w-md space-y-4 animate-fade-up">
            <h2 className="text-xl font-bold text-foreground">
              Ajouter un post - {selectedDay} {MONTHS[currentDate.getMonth()]}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted">Plateforme</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                  className="w-full mt-1 bg-base border border-[#1E1E2E] rounded-lg px-3 py-2 text-foreground text-sm focus:border-primary focus:outline-none"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted">Contenu</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full mt-1 bg-base border border-[#1E1E2E] rounded-lg px-3 py-2 text-foreground placeholder-muted text-sm focus:border-primary focus:outline-none resize-none"
                  placeholder="Écrivez votre contenu..."
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm text-muted">Heure</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full mt-1 bg-base border border-[#1E1E2E] rounded-lg px-3 py-2 text-foreground text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <Button className="w-full bg-primary hover:bg-primary/80 text-white">
                Générer avec IA
              </Button>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-[#1E1E2E]">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSavePost}>Planifier</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
