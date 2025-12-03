import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils'

const buttonBase =
  'cursor-pointer inline-flex items-center justify-center rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const variantStyles: Record<string, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600',
  secondary:
    'bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-500 border border-slate-200 shadow-sm',
  disabled: 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3 text-lg',
}

type ButtonProps = {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  loading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

const Button = ({
  className,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonBase, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default Button

