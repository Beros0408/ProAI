'use client'

import { Fragment } from 'react'
import { WorkflowCard } from './WorkflowCard'
import { WorkflowConnector } from './WorkflowConnector'
import { WorkflowAddButton } from './WorkflowAddButton'
import { WorkflowEmpty } from './WorkflowEmpty'

export interface CanvasStep {
  id: string
  step_order: number
  step_type: string
  name: string
  config: Record<string, unknown>
}

export interface CanvasWorkflow {
  trigger_type: string
  steps: CanvasStep[]
}

interface Props {
  workflow: CanvasWorkflow
  onEditTrigger: () => void
  onAddStep: (afterIndex: number) => void
  onEditStep: (stepId: string) => void
  onDeleteStep: (stepId: string) => void
}

export function WorkflowCanvas({
  workflow,
  onEditTrigger,
  onAddStep,
  onEditStep,
  onDeleteStep,
}: Props) {
  const hasTrigger = !!workflow.trigger_type

  if (!hasTrigger) {
    return <WorkflowEmpty onStart={onEditTrigger} />
  }

  return (
    <div
      className="flex flex-col items-center py-8 px-4 min-h-[500px] overflow-y-auto"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Trigger card */}
      <WorkflowCard
        kind="trigger"
        data={{ trigger_type: workflow.trigger_type }}
        onEdit={onEditTrigger}
      />

      {/* Connector after trigger */}
      <WorkflowConnector animated />

      {/* Add first step button */}
      <WorkflowAddButton onClick={() => onAddStep(0)} label="Ajouter une action" />

      {/* Steps */}
      {workflow.steps.map((step, index) => (
        <Fragment key={step.id}>
          <WorkflowConnector animated />
          <WorkflowCard
            kind="action"
            data={step}
            onEdit={() => onEditStep(step.id)}
            onDelete={() => onDeleteStep(step.id)}
          />
          <WorkflowConnector animated />
          <WorkflowAddButton onClick={() => onAddStep(index + 1)} label="Ajouter une action" />
        </Fragment>
      ))}

      {/* Bottom padding */}
      <div className="h-8" />
    </div>
  )
}
