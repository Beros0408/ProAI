'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/context'

type Tutorial = {
  id: string
  title: string
  icon: string
  steps: { num: string; title: string; desc: string }[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

function buildTutorials(webhookUrl: string): Tutorial[] {
  return [
    {
      id: 'tally',
      title: 'Tally Form',
      icon: '📝',
      steps: [
        { num: '1', title: 'Open your Tally form', desc: 'Go to tally.so and open the form you want to connect.' },
        { num: '2', title: 'Open Settings → Integrations → Webhooks', desc: 'Find the Webhooks section in your form settings.' },
        { num: '3', title: 'Paste your ProAI URL', desc: `URL: ${webhookUrl}` },
        { num: '4', title: 'Done!', desc: 'ProAI will process every new form submission automatically.' },
      ],
    },
    {
      id: 'zapier',
      title: 'Zapier',
      icon: '⚡',
      steps: [
        { num: '1', title: 'Create a new Zap', desc: 'Go to zapier.com and click "Create Zap".' },
        { num: '2', title: 'Choose your trigger app', desc: 'Select whatever app or event should start the Zap.' },
        { num: '3', title: 'Add action: Webhooks by Zapier → POST', desc: `Set the URL to: ${webhookUrl}` },
        { num: '4', title: 'Done!', desc: 'ProAI will automatically process each triggered event.' },
      ],
    },
    {
      id: 'n8n',
      title: 'n8n',
      icon: '🔄',
      steps: [
        { num: '1', title: 'Open your n8n workflow', desc: 'Create or open an existing workflow on n8n.' },
        { num: '2', title: 'Add an HTTP Request node', desc: 'Search for "HTTP Request" in the node list.' },
        { num: '3', title: 'Configure the request', desc: `Method: POST\nURL: ${webhookUrl}\nBody: your JSON data` },
        { num: '4', title: 'Done!', desc: 'ProAI will process every execution of your n8n workflow.' },
      ],
    },
    {
      id: 'make',
      title: 'Make (ex-Integromat)',
      icon: '🔮',
      steps: [
        { num: '1', title: 'Open your Make scenario', desc: 'Go to make.com and open or create a scenario.' },
        { num: '2', title: 'Add HTTP → Make a request', desc: 'Search for "HTTP" module and select "Make a request".' },
        { num: '3', title: 'Configure the request', desc: `Method: POST\nURL: ${webhookUrl}\nContent type: application/json` },
        { num: '4', title: 'Done!', desc: 'ProAI will process every execution of your Make scenario.' },
      ],
    },
  ]
}

type Props = {
  webhookUrl: string
  onClose: () => void
}

export function WebhookIntegrationTutorial({ webhookUrl, onClose }: Props) {
  const { t } = useTranslation()
  const tutorials = buildTutorials(webhookUrl)
  const [active, setActive] = useState(tutorials[0].id)
  const current = tutorials.find(t => t.id === active) ?? tutorials[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex w-full max-w-xl flex-col rounded-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-base font-bold text-white">{t('webhook.tutorial_title')}</h2>
            <p className="text-xs text-slate-500">{t('webhook.tutorial_subtitle')}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white" style={{ background: 'var(--bg-elevated)' }}>
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="flex w-40 shrink-0 flex-col gap-1 border-r p-3" style={{ borderColor: 'var(--border-color)' }}>
            {tutorials.map(tut => (
              <button
                key={tut.id}
                onClick={() => setActive(tut.id)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors"
                style={
                  active === tut.id
                    ? { background: '#6366F118', color: '#6366F1', border: '1px solid #6366F130' }
                    : { color: 'var(--text-secondary)', border: '1px solid transparent' }
                }
              >
                <span>{tut.icon}</span>
                <span>{tut.title}</span>
              </button>
            ))}
          </div>

          {/* Steps */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">
              {current.icon} {t('webhook.tutorial_connect')} {current.title}
            </h3>

            {current.steps.map(step => (
              <div key={step.num} className="flex gap-3">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: '#6366F118', color: '#6366F1' }}
                >
                  {step.num}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{step.title}</p>
                  <pre className="mt-0.5 whitespace-pre-wrap text-xs text-slate-400 font-sans leading-relaxed">{step.desc}</pre>
                </div>
              </div>
            ))}

            {/* URL copy */}
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
              <p className="mb-1.5 text-xs font-medium text-slate-400">{t('webhook.your_url')}</p>
              <code className="break-all text-xs text-indigo-400">{webhookUrl}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
