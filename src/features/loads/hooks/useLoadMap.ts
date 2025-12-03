import { useState } from 'react'
import type { LoadDocument, DriverDocument, TruckDocument } from '../../../types'

export const useLoadMap = () => {
    const [selectedLoadMap, setSelectedLoadMap] = useState<LoadDocument | null>(null)

    const handleOpenMap = (e: React.MouseEvent, load: LoadDocument) => {
        e.stopPropagation()
        setSelectedLoadMap(load)
    }

    const handleCloseMap = () => {
        setSelectedLoadMap(null)
    }

    const getSelectedDriver = (drivers: DriverDocument[]) => {
        if (!selectedLoadMap?.driverId) return null
        return drivers.find(d => d.id === selectedLoadMap.driverId) || null
    }

    const getSelectedTruck = (trucks: TruckDocument[]) => {
        if (!selectedLoadMap?.truckId) return null
        return trucks.find(t => t.id === selectedLoadMap.truckId) || null
    }

    return {
        selectedLoadMap,
        handleOpenMap,
        handleCloseMap,
        getSelectedDriver,
        getSelectedTruck
    }
}
