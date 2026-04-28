'use client'

import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

const templates = [
  {
    title: 'Lancement de produit',
    description: 'Annonce un lancement avec un ton énergique et une proposition claire.',
  },
  {
    title: 'Résumé d’article',
    description: 'Transforme un article long en résumé clair et actionnable.',
  },
  {
    title: 'Post LinkedIn',
    description: 'Rédige un post LinkedIn qui capte l’attention et génère de l’engagement.',
  },
  {
    title: 'Email de relance',
    description: 'Crée un email de suivi personnalisé pour réactiver un prospect.',
  },
]

export default function TemplatesPage() {
  const router = useRouter()

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Bibliothèque de templates</h1>
            <p className="mt-2 text-slate-400">Utilise des formats testés pour accélérer la création de contenu.</p>
          </div>
          <Button onClick={() => router.push('/content')} variant="secondary">
            Aller à Contenu IA
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article key={template.title} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-sm shadow-slate-950/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{template.title}</h2>
              </div>
            </div>
            <p className="mt-4 text-slate-400">{template.description}</p>
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => router.push('/content')}>Utiliser</Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
