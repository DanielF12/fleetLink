import { useEffect } from 'react'
import { useAppDispatch } from '../../../hooks'
import { setCurrentUser } from '../../../store/slices/authSlice'
import { subscribeToAuthChanges } from '../services/authService'

export const useAuthListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      dispatch(setCurrentUser(user))
    })

    return () => {
      unsubscribe()
    }
  }, [dispatch])
}

