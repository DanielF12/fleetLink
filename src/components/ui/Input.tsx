import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils'

type InputProps = {
  label?: string
  error?: string
  helperText?: string
  icon?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${props.name ?? Math.random().toString(36).slice(2)}`

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-left text-sm font-medium text-slate-700" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed',
              !!icon && 'pl-11',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-slate-500">{helperText}</p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input

