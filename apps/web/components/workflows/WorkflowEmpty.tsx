import { GitBranch, Zap } from 'lucide-react'

interface Props {
  onStart: () => void
}

export function WorkflowEmpty({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 px-8 text-center">
      <div className="relative">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(96,165,250,0.1)',
            border: '1px solid rgba(96,165,250,0.2)',
            boxShadow: '0 0 40px rgba(96,165,250,0.15)',
          }}
        >
          <GitBranch className="w-9 h-9 text-[#60a5fa]" style={{ animation: 'float 3s ease-in-out infinite' }} />
        </div>
        <div
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(45,212,191,0.2)', border: '1px solid rgba(45,212,191,0.4)' }}
        >
          <Zap className="w-3 h-3 text-[#2dd4bf]" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-1">Aucune étape configurée</h3>
        <p className="text-sm text-[var(--text-muted)] max-w-xs">
          Choisissez un déclencheur puis ajoutez des actions pour automatiser vos tâches.
        </p>
      </div>

      <button
        onClick={onStart}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold
                   text-white transition-all hover:opacity-90 hover:scale-105"
        style={{ background: '#60a5fa' }}
      >
        <Zap className="w-4 h-4" />
        Configurer le déclencheur
      </button>
    </div>
  )
}
