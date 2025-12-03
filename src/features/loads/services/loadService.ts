import {
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore'
import type { LoadDocument } from '../../../types'
import { loadsCollection } from '../../../lib'

export const getLoads = async () => {
    const loadsQuery = query(loadsCollection, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(loadsQuery)
    return snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
    })) as LoadDocument[]
}

export const createLoad = async (data: Omit<LoadDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = await addDoc(loadsCollection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    })
    return docRef.id
}

export const updateLoad = async (loadId: string, data: Partial<LoadDocument>) => {
    const docRef = doc(loadsCollection, loadId)
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    })
}

export const deleteLoad = async (loadId: string) => {
    const docRef = doc(loadsCollection, loadId)
    await deleteDoc(docRef)
}

// Fetch active loads for a specific driver
export const getDriverActiveLoads = async (driverId: string) => {
    const loadsQuery = query(
        loadsCollection,
        where('driverId', '==', driverId),
        where('status', '==', 'in-route')
    )
    const snapshot = await getDocs(loadsQuery)
    return snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
    })) as LoadDocument[]
}

// Fetch active loads for a specific truck
export const getTruckActiveLoads = async (truckId: string) => {
    const loadsQuery = query(
        loadsCollection,
        where('truckId', '==', truckId),
        where('status', 'in', ['planned', 'in-route'])
    )
    const snapshot = await getDocs(loadsQuery)
    return snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
    })) as LoadDocument[]
}
