import { useState, lazy, Suspense, useEffect } from 'react'
import { Map as MapIcon, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '../../../components/ui/ShadcnButton'
import type { LoadDocument, DriverDocument, TruckDocument } from '../../../types'
import { Card, Badge, ConfirmDialog, PaginationControl } from '../../../components/ui'
import { useDeleteLoad, useLoadMap } from '../hooks'
import toast from 'react-hot-toast'

const LoadMapModal = lazy(() => import('./LoadMapModal'))

type LoadListProps = {
    loads: LoadDocument[]
    drivers: DriverDocument[]
    trucks: TruckDocument[]
    onSelect: (load: LoadDocument) => void
}



const LoadList = ({ loads, drivers, trucks, onSelect }: LoadListProps) => {
    const {
        selectedLoadMap,
        handleOpenMap,
        handleCloseMap,
        getSelectedDriver,
        getSelectedTruck
    } = useLoadMap()

    const [loadToDelete, setLoadToDelete] = useState<LoadDocument | null>(null)
    const deleteLoad = useDeleteLoad()

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Reset page when loads length changes
    useEffect(() => {
        setCurrentPage(1)
    }, [loads.length])

    const totalPages = Math.ceil(loads.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentItems = loads.slice(startIndex, startIndex + itemsPerPage)

    const getDriverName = (driverId?: string) => {
        if (!driverId) return '-'
        const driver = drivers.find(d => d.id === driverId)
        return driver ? driver.name : '-'
    }

    const getTruck = (truckId?: string) => {
        if (!truckId) return null
        return trucks.find(t => t.id === truckId)
    }

    const handleDeleteClick = (e: React.MouseEvent, load: LoadDocument) => {
        e.stopPropagation()
        if (load.status === 'in-route') {
            toast.error('Cannot delete a load in route.')
            return
        }
        setLoadToDelete(load)
    }

    const handleConfirmDelete = async () => {
        if (loadToDelete && loadToDelete.id) {
            try {
                await deleteLoad.mutateAsync(loadToDelete.id)
                toast.success('Load deleted successfully!')
                setLoadToDelete(null)
            } catch (error) {
                console.error('Error deleting load:', error)
                toast.error('Error deleting load.')
            }
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'planned': return 'Planned'
            case 'in-route': return 'In Route'
            case 'delivered': return 'Delivered'
            default: return status
        }
    }

    const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'info' => {
        switch (status) {
            case 'planned': return 'info'
            case 'in-route': return 'warning'
            case 'delivered': return 'success'
            default: return 'default'
        }
    }

    if (loads.length === 0) {
        return (
            <Card className="text-center text-slate-400">
                No loads registered yet. Click "New Load" to start.
            </Card>
        )
    }

    return (
        <>
            <Card className="p-0 overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[1200px] grid grid-cols-[120px_1.5fr_100px_2fr_2fr_1.5fr_1.5fr_120px] gap-4 border-b border-slate-200 bg-slate-50 p-4 font-medium text-slate-500 text-sm tracking-wider">
                        <div className="text-left">Status</div>
                        <div className="text-left">Description</div>
                        <div className="text-left">Weight</div>
                        <div className="text-left">Origin</div>
                        <div className="text-left">Destination</div>
                        <div className="text-left">Driver</div>
                        <div className="text-left">Truck</div>
                        <div className="text-left">Actions</div>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto min-w-[1200px]">
                        {currentItems.map((load) => {
                            const truck = getTruck(load.truckId)
                            const truckLabel = truck ? `${truck.licensePlate} - ${truck.model}` : '-'

                            return (
                                <div
                                    key={load.id}
                                    className="grid grid-cols-[120px_1.5fr_100px_2fr_2fr_1.5fr_1.5fr_120px] gap-4 cursor-pointer items-center border-b border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                                    onClick={() => onSelect(load)}
                                >
                                    <div className="flex items-center">
                                        <Badge variant={getStatusVariant(load.status)}>
                                            {getStatusLabel(load.status)}
                                        </Badge>
                                    </div>
                                    <div className="font-medium text-slate-900 text-left truncate" title={load.description}>
                                        {load.description}
                                    </div>
                                    <div className="text-slate-600 text-left">
                                        {load.weightKg.toLocaleString('en-US')} kg
                                    </div>
                                    <div className="text-slate-600 text-left truncate" title={load.origin}>
                                        {load.origin}
                                    </div>
                                    <div className="text-slate-600 text-left truncate" title={load.destination}>
                                        {load.destination}
                                    </div>
                                    <div className="text-slate-600 text-left truncate" title={getDriverName(load.driverId)}>
                                        {getDriverName(load.driverId)}
                                    </div>
                                    <div className="text-slate-600 text-left truncate flex items-center gap-2">
                                        <span className="truncate min-w-0" title={truckLabel}>{truckLabel}</span>
                                        {truck?.status === 'maintenance' && (
                                            <div className="group relative">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white group-hover:block z-10">
                                                    Truck in maintenance
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex text-left gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleOpenMap(e, load)}
                                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                            title="View route on map"
                                        >
                                            <MapIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleDeleteClick(e, load)}
                                            disabled={load.status === 'in-route'}
                                            className={load.status === 'in-route'
                                                ? 'text-slate-400'
                                                : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                                            }
                                            title={load.status === 'in-route' ? 'Cannot delete load in route' : 'Delete load'}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <PaginationControl
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={loads.length}
                />
            </Card>

            <Suspense fallback={
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Loading map...</p>
                    </div>
                </div>
            }>
                {selectedLoadMap && (
                    <LoadMapModal
                        isOpen={!!selectedLoadMap}
                        onClose={handleCloseMap}
                        load={selectedLoadMap}
                        driver={getSelectedDriver(drivers)}
                        truck={getSelectedTruck(trucks)}
                    />
                )}
            </Suspense>

            <ConfirmDialog
                isOpen={!!loadToDelete}
                onClose={() => setLoadToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Load"
                message={`Are you sure you want to delete the load "${loadToDelete?.description}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    )
}

export default LoadList
