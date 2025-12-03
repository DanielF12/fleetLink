import { collection, type CollectionReference, type DocumentData } from 'firebase/firestore'
import { db } from './firebase'
import type { DriverDocument, LoadDocument, TruckDocument } from '../types'

const COLLECTIONS = {
  trucks: 'trucks',
  drivers: 'drivers',
  loads: 'loads',
} as const

const createCollection = <T = DocumentData>(path: string) => {
  return collection(db, path) as CollectionReference<T>
}

export const trucksCollection = createCollection<TruckDocument>(COLLECTIONS.trucks)
export const driversCollection = createCollection<DriverDocument>(COLLECTIONS.drivers)
export const loadsCollection = createCollection<LoadDocument>(COLLECTIONS.loads)

export { COLLECTIONS }

