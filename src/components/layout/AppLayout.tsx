import { useState, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { logoutUser } from '../../store/slices/authSlice'
import { Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

type AppLayoutProps = {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const dispatch = useAppDispatch()
  const { user, loading } = useAppSelector((state) => state.auth)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await dispatch(logoutUser())
  }

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <NavLink
        to="/dashboard"
        onClick={() => mobile && setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `text-md font-medium transition ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'} ${mobile ? 'block py-2' : ''}`
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/drivers"
        onClick={() => mobile && setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `text-md font-medium transition ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'} ${mobile ? 'block py-2' : ''}`
        }
      >
        Drivers
      </NavLink>
      <NavLink
        to="/trucks"
        onClick={() => mobile && setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `text-md font-medium transition ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'} ${mobile ? 'block py-2' : ''}`
        }
      >
        Trucks
      </NavLink>
      <NavLink
        to="/loads"
        onClick={() => mobile && setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `text-md font-medium transition ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'} ${mobile ? 'block py-2' : ''}`
        }
      >
        Loads
      </NavLink>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-40">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-4 md:gap-24">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-slate-600 hover:text-slate-900"
              onClick={toggleMenu}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>

            <div>
              <p className="text-lg font-semibold text-slate-900 text-left">FleetLink</p>
              <p className="text-xs md:text-sm text-slate-500 text-left">Integrated Management</p>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <NavLinks />
            </nav>
          </div>

          {/* Desktop User/Logout */}
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-600">
            {user && (
              <div className="text-right">
                <p className="font-medium text-slate-900">{user.email ?? 'User'}</p>
                <p className="text-xs text-slate-500">Connected</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-4 shadow-lg absolute w-full left-0 z-50">
            <nav className="flex flex-col space-y-2">
              <NavLinks mobile />
            </nav>
            <div className="pt-4 border-t border-slate-100">
              {user && (
                <div className="mb-4">
                  <p className="font-medium text-slate-900">{user.email ?? 'User'}</p>
                  <p className="text-xs text-slate-500">Connected</p>
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="cursor-pointer w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8">{children}</main>
    </div>
  )
}

export default AppLayout

