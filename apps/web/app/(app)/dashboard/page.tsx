'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/context'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { MessageSquare, Zap, TrendingUp, Clock, Bot, Activity, CheckCircle, AlertCircle } from 'lucide-react'

const kpiData = [
  { name: 'Jan', conversations: 120, tasks: 30, leads: 20 },
  { name: 'Fév', conversations: 132, tasks: 35, leads: 22 },
  { name: 'Mar', conversations: 101, tasks: 28, leads: 18 },
  { name: 'Avr', conversations: 134, tasks: 38, leads: 24 },
  { name: 'Mai', conversations: 90, tasks: 25, leads: 16 },
  { name: 'Jun', conversations: 230, tasks: 42, leads: 28 },
]

const pieData = [
  { name: 'Actifs', value: 4, color: '#0ea5e9' },
  { name: 'Inactifs', value: 2, color: '#fb923c' },
]

const agents = [
  { name: 'Agent Commercial', status: 'active', lastActivity: '2 min ago' },
  { name: 'Agent Support', status: 'active', lastActivity: '5 min ago' },
  { name: 'Agent Marketing', status: 'idle', lastActivity: '1h ago' },
  { name: 'Agent Analyse', status: 'active', lastActivity: '30 sec ago' },
  { name: 'Agent Créatif', status: 'idle', lastActivity: '3h ago' },
  { name: 'Agent Automatisation', status: 'active', lastActivity: '1 min ago' },
]

const activities = [
  { time: '14:32', action: 'Nouvelle conversation démarrée', agent: 'Agent Commercial' },
  { time: '14:28', action: 'Lead généré automatiquement', agent: 'Agent Marketing' },
  { time: '14:25', action: 'Tâche d\'analyse terminée', agent: 'Agent Analyse' },
  { time: '14:20', action: 'Email envoyé', agent: 'Agent Support' },
  { time: '14:15', action: 'Rapport généré', agent: 'Agent Automatisation' },
]

export default function DashboardPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-[#0c1220] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#fb923c] bg-clip-text text-transparent">
            {t('dashboard_page_title')}
          </h1>
          <p className="text-gray-400 mt-2">{t('dashboard_overview')}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('conversations')}</p>
                <p className="text-2xl font-bold text-[#0ea5e9]">142</p>
                <p className="text-green-400 text-sm">+12% ce mois</p>
              </div>
              <MessageSquare className="w-8 h-8 text-[#0ea5e9]" />
            </div>
            <div className="mt-4 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiData.slice(-4)}>
                  <Bar dataKey="conversations" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('auto_tasks')}</p>
                <p className="text-2xl font-bold text-[#fb923c]">38</p>
                <p className="text-green-400 text-sm">+8% ce mois</p>
              </div>
              <Zap className="w-8 h-8 text-[#fb923c]" />
            </div>
            <div className="mt-4 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpiData.slice(-4)}>
                  <Line type="monotone" dataKey="tasks" stroke="#fb923c" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('generated_leads')}</p>
                <p className="text-2xl font-bold text-[#0ea5e9]">24</p>
                <p className="text-green-400 text-sm">+5% ce mois</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#0ea5e9]" />
            </div>
            <div className="mt-4 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiData.slice(-4)}>
                  <Bar dataKey="leads" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('time_saved')}</p>
                <p className="text-2xl font-bold text-[#fb923c]">6h</p>
                <p className="text-green-400 text-sm">+2h ce mois</p>
              </div>
              <Clock className="w-8 h-8 text-[#fb923c]" />
            </div>
            <div className="mt-4 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={20} outerRadius={30}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Status */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">{t('agent_status')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedAgent === agent.name
                      ? 'border-[#0ea5e9] bg-[#0ea5e9]/10'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedAgent(agent.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-[#0ea5e9]" />
                      <div>
                        <p className="font-medium text-white">{agent.name}</p>
                        <p className="text-sm text-gray-400">{agent.lastActivity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.status === 'active' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        agent.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {agent.status === 'active' ? t('connected') : t('not_connected')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">{t('recent_activity')}</h2>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Activity className="w-4 h-4 text-[#fb923c] mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.time} • {activity.agent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr,0.9fr]">
          <div className="rounded-3xl border border-gray-700 bg-[#111827]/80 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#0ea5e9]">{t('dashboard.quickactions')}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Accès direct aux workflows</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { href: '/crm', label: 'Nouveau lead' },
                { href: '/workflows', label: 'Créer workflow' },
                { href: '/schedule', label: 'Planifier post' },
                { href: '/content', label: 'Générer contenu' },
                { href: '/predictions', label: 'Voir prédictions' },
                { href: '/reports', label: 'Rapport hebdo' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-4 text-left transition hover:border-primary/60 hover-lift hover-glow"
                >
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-700 bg-gradient-to-br from-[#0ea5e9]/10 to-[#7c3aed]/10 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3 text-white">
              <div className="rounded-2xl bg-white/10 p-3">
                <TrendingUp className="h-6 w-6 text-[#0ea5e9]" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Prédiction express</p>
                <p className="mt-2 text-xl font-semibold">Vos ventes devraient augmenter de 15% ce mois-ci basé sur votre pipeline actuel.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">{t('monthly_revenue')}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kpiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                />
                <Line type="monotone" dataKey="conversations" stroke="#0ea5e9" strokeWidth={2} />
                <Line type="monotone" dataKey="tasks" stroke="#fb923c" strokeWidth={2} />
                <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

