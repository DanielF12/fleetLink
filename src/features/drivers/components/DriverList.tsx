import type { DriverDocument, TruckDocument } from '../../../types'
import { Card, PaginationControl } from '../../../components/ui'
import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/ShadcnButton'
import { Trash2 } from 'lucide-react'

type DriverListProps = {
    drivers: DriverDocument[]
    trucks: TruckDocument[]
    onSelect: (driver: DriverDocument) => void
    onDelete: (driver: DriverDocument) => void
}

const DriverList = ({
    drivers,
    trucks,
    onSelect,
    onDelete,
}: DriverListProps) => {
    if (drivers.length === 0) {
        return (
            <Card className="text-center text-slate-400">
                No drivers registered yet. Click "New Driver" to start.
            </Card>
        )
    }

    // Get the license plate of the truck linked to the driver
    const getLinkedTruckPlate = (truckId?: string | null) => {
        if (!truckId) return '-'
        const truck = trucks.find(t => t.id === truckId)
        return truck ? truck.licensePlate : '-'
    }

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Reset page when drivers length changes
    useEffect(() => {
        setCurrentPage(1)
    }, [drivers.length])

    const totalPages = Math.ceil(drivers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentItems = drivers.slice(startIndex, startIndex + itemsPerPage)

    return (
        <Card className="p-0 overflow-hidden">
            <div className="w-full overflow-x-auto">
                <div className="min-w-[800px] grid grid-cols-[1.5fr_1fr_1fr_1fr_80px] gap-4 border-b border-slate-200 bg-slate-50 p-4 font-medium text-slate-500 text-sm tracking-wider">
                    <div className="text-left">Name</div>
                    <div className="text-left">Phone</div>
                    <div className="text-left">License</div>
                    <div className="text-left">Truck</div>
                    <div className="text-left">Actions</div>
                </div>
                <div className="max-h-[600px] overflow-y-auto min-w-[800px]">
                    {currentItems.map((driver) => (
                        <div
                            key={driver.id}
                            className="grid grid-cols-[1.5fr_1fr_1fr_1fr_80px] gap-4 cursor-pointer items-center border-b border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                            onClick={() => onSelect(driver)}
                        >
                            <div className="flex items-center gap-4">
                                <p className="font-medium text-slate-900 text-left truncate" title={driver.name}>{driver.name}</p>
                            </div>
                            <div className="text-slate-600 text-left truncate" title={driver.phone}>
                                {driver.phone}
                            </div>
                            <div className="text-slate-600 text-left truncate" title={driver.licenseNumber}>
                                {driver.licenseNumber}
                            </div>
                            <div className="text-slate-600 text-left truncate" title={getLinkedTruckPlate(driver.truckId)}>
                                {getLinkedTruckPlate(driver.truckId)}
                            </div>
                            <div className="flex justify-start">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (!driver.truckId) {
                                            onDelete(driver)
                                        }
                                    }}
                                    disabled={!!driver.truckId}
                                    className={driver.truckId
                                        ? 'text-slate-400'
                                        : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                                    }
                                    title={driver.truckId ? "Cannot remove driver linked to a truck" : "Remove driver"}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={drivers.length}
            />
        </Card>
    )
}

export default DriverList
