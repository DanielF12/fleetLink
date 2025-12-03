import type { HTMLAttributes } from 'react'
import { cn } from '../../utils'

const badgeStyles: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
  danger: 'bg-red-100 text-red-700',
}

type BadgeProps = {
  variant?: keyof typeof badgeStyles
} & HTMLAttributes<HTMLSpanElement>

const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', badgeStyles[variant], className)}
      {...props}
    />
  )
}

export default Badge

