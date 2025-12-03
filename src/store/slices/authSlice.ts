import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '../../types'
import { loginWithEmail, logoutFromFirebase, mapFirebaseUser, type LoginPayload } from '../../features/auth/services/authService'

type AuthState = {
  user: AuthUser | null
  loading: boolean
  error: string | null
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
}

export const loginUser = createAsyncThunk<AuthUser, LoginPayload>(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const user = await loginWithEmail(payload)
      const mappedUser = mapFirebaseUser(user)
      if (!mappedUser) {
        throw new Error('Usuário inválido')
      }
      return mappedUser
    } catch (error: any) {
      const errorCode = error.code
      const errorMessage = getAuthErrorMessage(errorCode)
      return rejectWithValue(errorMessage)
    }
  },
)

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.'
    case 'auth/user-not-found':
      return 'Usuário não encontrado.'
    case 'auth/wrong-password':
      return 'Senha incorreta.'
    case 'auth/invalid-email':
      return 'E-mail inválido.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.'
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet.'
    default:
      return 'Ocorreu um erro ao fazer login. Tente novamente.'
  }
}

export const logoutUser = createAsyncThunk<void>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await logoutFromFirebase()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao sair'
      return rejectWithValue(message)
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload
      state.initialized = true
      state.error = null
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.initialized = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? 'Não foi possível fazer login'
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false
        state.user = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? 'Erro ao sair'
      })
  },
})

export const { setCurrentUser, clearAuthError } = authSlice.actions
export default authSlice.reducer

