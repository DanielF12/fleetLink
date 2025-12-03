import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAppDispatch, useAppSelector } from '../../../hooks'
import { Input, Button } from '../../../components/ui'
import { clearAuthError, loginUser } from '../../../store/slices/authSlice'

type LoginFormValues = {
  email: string
  password: string
}

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, user } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(loginUser(values))
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard', { replace: true })
    }
  })

  useEffect(() => {
    return () => {
      dispatch(clearAuthError())
    }
  }, [dispatch])

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-xl ">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">FleetLink</h1>
          <p className="mt-2 text-sm text-slate-500">Manage drivers, trucks and loads</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="Email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Password"
            error={errors.password?.message}
            {...register('password')}
          />

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage