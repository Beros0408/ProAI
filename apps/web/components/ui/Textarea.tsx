'use client'

import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className = '', ...props }: TextareaProps) {
  const classes = `min-h-[160px] w-full rounded-2xl border border-default bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`.trim()

  return <textarea className={classes} {...props} />
}
