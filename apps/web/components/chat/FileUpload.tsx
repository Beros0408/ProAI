'use client'

import { useCallback, useState } from 'react'

export function FileUpload({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) onFile(file)
  }, [onFile])

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded-3xl border-2 ${dragging ? 'border-primary/80 bg-slate-900/90' : 'border-slate-700 bg-slate-950/90'} p-6 text-center transition`}
    >
      <p className="text-sm font-medium text-white">Glisse un fichier ici</p>
      <p className="mt-2 text-xs text-slate-400">PDF ou document pour analyse intelligente.</p>
      <input
        type="file"
        accept="application/pdf"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
        }}
        className="mt-4 w-full cursor-pointer rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white"
      />
    </div>
  )
}
