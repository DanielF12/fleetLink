import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppSelector } from '../../hooks'

type ProtectedRouteProps = {
  children: ReactNode
  redirectPath?: string
}

export const ProtectedRoute = ({ children, redirectPath = '/login' }: ProtectedRouteProps) => {
  const { user, initialized, loading } = useAppSelector((state) => state.auth)

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-slate-500 font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}

