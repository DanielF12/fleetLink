import type { HTMLAttributes, TableHTMLAttributes } from 'react'
import { cn } from '../../utils'

export const Table = ({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table className={cn('w-full min-w-full divide-y divide-slate-200 text-sm text-slate-700', className)} {...props} />
  </div>
)

export const TableHead = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead
    className={cn(
      'bg-slate-50 text-left text-[0.7rem] tracking-[0.2em] text-slate-500',
      className,
    )}
    {...props}
  />
)

export const TableHeaderCell = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('px-6 py-4 font-semibold text-slate-700', className)} {...props} />
)

export const TableBody = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('divide-y divide-slate-200 text-base text-slate-900', className)} {...props} />
)

export const TableRow = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('transition hover:bg-slate-50', className)} {...props} />
)

export const TableCell = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-6 py-4 align-middle', className)} {...props} />
)

