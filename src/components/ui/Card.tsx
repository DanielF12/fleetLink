import type { HTMLAttributes } from 'react'
import { cn } from '../../utils'

const Card = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

