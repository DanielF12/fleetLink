import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../../../lib'
import type { AuthUser } from '../../../types/user'

export type LoginPayload = {
  email: string
  password: string
}

export const loginWithEmail = async ({ email, password }: LoginPayload) => {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export const logoutFromFirebase = async () => {
  await signOut(auth)
}

export const subscribeToAuthChanges = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(mapFirebaseUser(user))
  })
}

export const mapFirebaseUser = (user: User | null): AuthUser | null => {
  if (!user) {
    return null
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  }
}

