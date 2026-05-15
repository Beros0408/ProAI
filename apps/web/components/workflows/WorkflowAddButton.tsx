import { Plus } from 'lucide-react'

interface Props {
  onClick: () => void
  label?: string
}

export function WorkflowAddButton({ onClick, label }: Props) {
  return (
    <button
      onClick={onClick}
      title={label ?? 'Ajouter une étape'}
      className="flex items-center gap-1.5 rounded-full border-2 border-dashed
                 border-[#60a5fa] bg-[var(--bg-elevated)]
                 text-[#60a5fa] text-xs font-semibold
                 px-3 py-1.5
                 hover:bg-[#60a5fa] hover:text-white
                 transition-all hover:scale-105 hover:border-solid
                 focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:ring-offset-2
                 focus:ring-offset-[var(--bg-base)]"
    >
      <Plus className="w-3.5 h-3.5" />
      {label && <span>{label}</span>}
    </button>
  )
}
