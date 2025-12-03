import { Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import './App.css'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute } from './components/layout'
import { useAuthListener } from './features/auth'
import { Spinner } from './components/ui'

// Lazy load pages
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'))
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'))
const TrucksPage = lazy(() => import('./features/trucks').then(module => ({ default: module.TrucksPage })))
const DriversPage = lazy(() => import('./features/drivers').then(module => ({ default: module.DriversPage })))
const LoadsPage = lazy(() => import('./features/loads').then(module => ({ default: module.LoadsPage })))

function App() {
  useAuthListener()

  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trucks"
            element={
              <ProtectedRoute>
                <TrucksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers"
            element={
              <ProtectedRoute>
                <DriversPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loads"
            element={
              <ProtectedRoute>
                <LoadsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </>
  )
}

export default App
