'use client'

'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  const baseClass = 'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50'
  const variantClass =
    variant === 'primary'
      ? 'bg-primary text-slate-950 hover:bg-primary/90'
      : 'border border-default bg-surface text-foreground hover:bg-[var(--bg-elevated)]'

  return <button className={`${baseClass} ${variantClass} ${className}`.trim()} {...props} />
}
