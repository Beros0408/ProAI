'use client'

import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className = '', ...props }: TextareaProps) {
  const classes = `min-h-[160px] w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`.trim()

  return <textarea className={classes} {...props} />
}
