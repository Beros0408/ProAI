'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

const presets = [
  { label: 'LinkedIn post', value: 'Generate a high-engagement LinkedIn post about' },
  { label: 'Newsletter intro', value: 'Write a compelling newsletter introduction for' },
  { label: 'Email copy', value: 'Create a persuasive email copy for' },
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'inspirational', label: 'Inspirational' },
];

export default function ContentPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [preset, setPreset] = useState(presets[0].value);
  const [tone, setTone] = useState(tones[0].value);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/v1/content/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, language: 'fr' }),
      });

      const data = await response.json();
      setResult(data.content || 'Aucun résultat.');
    } catch (error) {
      setResult('Erreur lors de la génération.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'proai-content.txt';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">AI Content Studio</h1>
            <p className="mt-2 text-slate-400">
              Génère des messages, emails et newsletters optimisés pour ton audience.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push('/dashboard')} variant="secondary">
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Prépare ton contenu</h2>
            <p className="text-slate-400">
              Choisis un modèle, définis ton ton et décris le sujet pour créer un contenu prêt à publier.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Modèle</label>
              <select
                value={preset}
                onChange={(event) => setPreset(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white"
              >
                {presets.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">Ton</label>
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white"
              >
                {tones.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300">Sujet</label>
            <Textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Décris l'idée principale ici..."
              rows={5}
              className="mt-2 bg-slate-900 text-white"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button onClick={handleGenerate} disabled={loading || !topic.trim()}>
              {loading ? 'Génération...' : 'Générer'}
            </Button>
            <p className="text-sm text-slate-500">Convertis ton briefing en contenu engageant.</p>
          </div>
        </section>

        <aside className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="rounded-3xl bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-white">Astuces</h3>
            <ul className="mt-3 space-y-2 text-slate-400">
              <li>• Mentionne le public cible pour plus de précision.</li>
              <li>• Ajoute des mots-clés importants.</li>
              <li>• Change de ton pour varier les messages.</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-white">Actions</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Button disabled={!result} onClick={handleCopy} variant="secondary">
                Copier le contenu
              </Button>
              <Button disabled={!result} onClick={handleDownload} variant="secondary">
                Télécharger le fichier
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Résultat généré</h2>
            <p className="text-sm text-slate-500">Tu peux régénérer ou copier en un clic.</p>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !topic.trim()}>
            {loading ? 'Régénération...' : 'Régénération'}
          </Button>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 min-h-[260px] text-slate-300">
          {result ? <pre className="whitespace-pre-wrap break-words text-sm">{result}</pre> : <p className="text-slate-500">Le contenu généré apparaîtra ici.</p>}
        </div>
      </section>
    </div>
  );
}
