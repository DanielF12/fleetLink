import {
    doc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    where,
} from 'firebase/firestore'
import type { DriverDocument } from '../../../types'
import { db, driversCollection, trucksCollection } from '../../../lib'

export const getDrivers = async () => {
    const driversQuery = query(driversCollection, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(driversQuery)
    return snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
    })) as DriverDocument[]
}

export const createDriver = async (data: Omit<DriverDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await runTransaction(db, async (transaction) => {
        // Create driver ref
        const driverRef = doc(driversCollection)

        // If truck is selected, check if it's already linked to another driver
        // second check for security
        if (data.truckId) {
            const truckRef = doc(trucksCollection, data.truckId)
            const truckDoc = await transaction.get(truckRef)

            if (truckDoc.exists()) {
                const truckData = truckDoc.data()
                if (truckData.driverId) {
                    throw new Error(`Truck ${truckData.licensePlate} already linked to another driver.`)
                }

                transaction.update(truckRef, {
                    driverId: driverRef.id,
                    updatedAt: serverTimestamp()
                })
            }
        }

        // Create driver
        transaction.set(driverRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        })

        return driverRef.id
    })
}

export const updateDriver = async (driverId: string, data: Partial<DriverDocument>) => {
    return await runTransaction(db, async (transaction) => {
        const driverRef = doc(driversCollection, driverId)
        const driverDoc = await transaction.get(driverRef)

        if (!driverDoc.exists()) {
            throw new Error('Driver not found')
        }

        const currentDriver = driverDoc.data() as DriverDocument
        const oldTruckId = currentDriver.truckId
        const newTruckId = data.truckId

        // If truck changed
        if (newTruckId !== undefined && newTruckId !== oldTruckId) {
            // If linking to a new truck, check if it's occupied
            if (newTruckId) {
                const newTruckRef = doc(trucksCollection, newTruckId)
                const newTruckDoc = await transaction.get(newTruckRef)

                if (newTruckDoc.exists()) {
                    const newTruckData = newTruckDoc.data()
                    // Check if truck has a driver AND it's not the current driver
                    if (newTruckData.driverId && newTruckData.driverId !== driverId) {
                        throw new Error(`Truck ${newTruckData.licensePlate} already linked to another driver.`)
                    }
                }
            }

            const { loadsCollection } = await import('../../../lib')

            // Check if driver has loads that are 'in-route'
            // Block if there are in-route loads
            const inRouteQuery = query(
                loadsCollection,
                where('driverId', '==', driverId),
                where('status', '==', 'in-route')
            )
            const inRouteSnapshot = await getDocs(inRouteQuery)

            if (!inRouteSnapshot.empty) {
                throw new Error('It is not possible to change the link because there are loads in route linked to this driver')
            }

            // Update only 'planned' loads to use the new truck
            const plannedQuery = query(
                loadsCollection,
                where('driverId', '==', driverId),
                where('status', '==', 'planned')
            )
            const plannedSnapshot = await getDocs(plannedQuery)

            plannedSnapshot.docs.forEach(doc => {
                transaction.update(doc.ref, {
                    truckId: newTruckId || null,
                    updatedAt: serverTimestamp()
                })
            })

            // Unlink old truck if exists
            if (oldTruckId) {
                const oldTruckRef = doc(trucksCollection, oldTruckId)
                transaction.update(oldTruckRef, {
                    driverId: null,
                    updatedAt: serverTimestamp()
                })
            }

            // Link new truck if exists
            if (newTruckId) {
                const newTruckRef = doc(trucksCollection, newTruckId)
                transaction.update(newTruckRef, {
                    driverId: driverId,
                    updatedAt: serverTimestamp()
                })
            }
        }

        // Update driver
        transaction.update(driverRef, {
            ...data,
            updatedAt: serverTimestamp(),
        })
    })
}

export const deleteDriver = async (driverId: string) => {
    return await runTransaction(db, async (transaction) => {
        const driverRef = doc(driversCollection, driverId)
        const driverDoc = await transaction.get(driverRef)

        if (!driverDoc.exists()) {
            throw new Error('Driver not found')
        }

        const currentDriver = driverDoc.data() as DriverDocument

        // Check if driver has a linked truck
        // double check to prevent removal of a driver that is linked to a truck
        if (currentDriver.truckId) {
            // Fetch the truck to get its license plate
            const truckRef = doc(trucksCollection, currentDriver.truckId)
            const truckDoc = await transaction.get(truckRef)

            if (truckDoc.exists()) {
                const truckData = truckDoc.data()
                throw new Error(`It is not possible to delete this driver because it is linked to the truck ${truckData.licensePlate}. Unlink the truck first.`)
            }
        }

        // Delete driver
        transaction.delete(driverRef)
    })
}
// Check if license number is unique
export const checkLicenseNumberAvailability = async (licenseNumber: string) => {
    const normalizedLicense = licenseNumber.trim()
    const licenseQuery = query(driversCollection, where('licenseNumber', '==', normalizedLicense))
    const snapshot = await getDocs(licenseQuery)
    return snapshot.empty
}
