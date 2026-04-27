'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Step1Welcome } from './steps/Step1Welcome'
import { Step2Organization } from './steps/Step2Organization'
import { Step3UseCase } from './steps/Step3UseCase'
import { Step4LLMProvider } from './steps/Step4LLMProvider'
import { Step5Ready } from './steps/Step5Ready'

const STEPS = [
  { id: 1, title: 'Bienvenue', component: Step1Welcome },
  { id: 2, title: 'Organisation', component: Step2Organization },
  { id: 3, title: 'Usage', component: Step3UseCase },
  { id: 4, title: 'Moteur IA', component: Step4LLMProvider },
  { id: 5, title: 'C\'est parti !', component: Step5Ready },
]

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Record<string, string>>({})

  function handleChange(key: string, value: string) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      router.push('/dashboard')
    }
  }

  const CurrentStep = STEPS[step].component
  const isLast = step === STEPS.length - 1

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted">Étape {step + 1} sur {STEPS.length}</span>
          <span className="text-xs text-primary font-medium">{STEPS[step].title}</span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                i <= step ? 'bg-primary' : 'bg-[#1E1E2E]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-surface border border-[#1E1E2E] rounded-2xl p-8 shadow-2xl animate-fade-in">
        <CurrentStep data={data} onChange={handleChange} />

        <div className="flex items-center gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-muted hover:text-foreground hover:bg-[#1E1E2E] transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-primary hover:bg-[#4F46E5] text-white font-medium text-sm transition-colors"
          >
            {isLast ? 'Accéder au dashboard' : 'Continuer'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Vous pourrez modifier ces informations dans les paramètres
      </p>
    </div>
  )
}
