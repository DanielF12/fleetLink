import {
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import type { TruckDocument } from '../../../types'
import { storage, trucksCollection, driversCollection } from '../../../lib'

const TRUCK_DOCUMENTS_PATH = 'trucks'

export const getTrucks = async () => {
  const trucksQuery = query(trucksCollection, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(trucksQuery)
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as TruckDocument[]
}



export const createTruck = async (data: Omit<TruckDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(trucksCollection, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export const updateTruck = async (truckId: string, data: Partial<TruckDocument>) => {
  const truckRef = doc(trucksCollection, truckId)
  await updateDoc(truckRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteTruck = async (truckId: string) => {
  // First, check if this truck is linked to a driver
  const truckRef = doc(trucksCollection, truckId)
  const truckSnap = await getDoc(truckRef)

  if (!truckSnap.exists()) {
    throw new Error('Truck not found')
  }

  const truckData = truckSnap.data() as TruckDocument

  if (truckData.driverId) {
    // Fetch the driver to get their name
    const driverRef = doc(driversCollection, truckData.driverId)
    const driverSnap = await getDoc(driverRef)

    if (driverSnap.exists()) {
      const driverData = driverSnap.data()
      throw new Error(`It is not possible to delete this truck because it is linked to the driver ${driverData.name}. Unlink the driver first.`)
    }
  }

  await deleteDoc(truckRef)
}

export const uploadTruckDocument = async (truckId: string, file: File) => {
  const fileRef = ref(storage, `${TRUCK_DOCUMENTS_PATH}/${truckId}/${file.name}`)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}

export const deleteTruckDocument = async (fileUrl: string) => {
  const fileRef = ref(storage, fileUrl)
  await deleteObject(fileRef)
}

export const checkLicensePlateAvailability = async (licensePlate: string) => {
  const normalizedPlate = licensePlate.trim().toUpperCase()
  const plateQuery = query(trucksCollection, where('licensePlate', '==', normalizedPlate))
  const snapshot = await getDocs(plateQuery)
  return snapshot.empty
}
