import type { TruckDocument, DriverDocument } from '../../../types'
import { Card, Badge, PaginationControl } from '../../../components/ui'
import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/ShadcnButton'
import { Trash2 } from 'lucide-react'

type TruckListProps = {
  trucks: TruckDocument[]
  drivers: DriverDocument[]
  onSelect: (truck: TruckDocument) => void
  onDelete: (truck: TruckDocument) => void
}

const TruckList = ({
  trucks,
  drivers,
  onSelect,
  onDelete,
}: TruckListProps) => {
  if (trucks.length === 0) {
    return (
      <Card className="text-center text-slate-400">
        No trucks registered yet. Click "New Truck" to start.
      </Card>
    )
  }

  const getLinkedDriverName = (driverId?: string | null) => {
    if (!driverId) return '-'
    const driver = drivers.find(d => d.id === driverId)
    return driver ? driver.name : '-'
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Reset page when trucks length changes (e.g. filter or new addition)
  useEffect(() => {
    setCurrentPage(1)
  }, [trucks.length])

  const totalPages = Math.ceil(trucks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = trucks.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Card className="p-0 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[1000px] grid grid-cols-[120px_1fr_1.5fr_1fr_0.8fr_1.5fr_80px] gap-4 border-b border-slate-200 bg-slate-50 p-4 font-medium text-slate-500 text-sm tracking-wider">
          <div className="text-left">Status</div>
          <div className="text-left">Plate</div>
          <div className="text-left">Model</div>
          <div className="text-left">Capacity</div>
          <div className="text-left">Year</div>
          <div className="text-left">Driver</div>
          <div className="text-left">Actions</div>
        </div>
        <div className="max-h-[600px] overflow-y-auto min-w-[1000px]">
          {currentItems.map((truck) => (
            <div
              key={truck.id}
              className="grid grid-cols-[120px_1fr_1.5fr_1fr_0.8fr_1.5fr_80px] gap-4 cursor-pointer items-center border-b border-slate-200 p-4 hover:bg-slate-50 transition-colors"
              onClick={() => onSelect(truck)}
            >
              <div className="flex items-center">
                <Badge variant={truck.status === 'active' ? 'success' : truck.status === 'maintenance' ? 'warning' : 'danger'}>
                  {truck.status === 'active' ? 'Active' : truck.status === 'maintenance' ? 'Maintenance' : 'Inactive'}
                </Badge>
              </div>
              <div className="font-medium text-slate-900 text-left truncate" title={truck.licensePlate}>
                {truck.licensePlate}
              </div>
              <div className="text-slate-600 text-left truncate" title={truck.model}>
                {truck.model}
              </div>
              <div className="text-slate-600 text-left">
                {truck.capacityKg} kg
              </div>
              <div className="text-slate-600 text-left">
                {truck.year}
              </div>
              <div className="text-slate-600 text-left truncate" title={getLinkedDriverName(truck.driverId)}>
                {getLinkedDriverName(truck.driverId)}
              </div>
              <div className="flex justify-start">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!truck.driverId) {
                      onDelete(truck)
                    }
                  }}
                  disabled={!!truck.driverId}
                  className={truck.driverId
                    ? 'text-slate-400'
                    : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                  }
                  title={truck.driverId ? "Cannot remove truck linked to a driver" : "Remove truck"}
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
        totalItems={trucks.length}
      />
    </Card>
  )
}

export default TruckList
