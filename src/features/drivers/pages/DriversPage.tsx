import { useState } from 'react'
import toast from 'react-hot-toast'
import { AppLayout } from '../../../components/layout'
import { Button, Modal, Card, ConfirmDialog } from '../../../components/ui'
import { DriverForm, DriverList } from '../components'
import { useDeleteDriver, useDrivers } from '../hooks'
import { useTrucks } from '../../trucks/hooks'
import type { DriverDocument } from '../../../types'

const DriversPage = () => {
  const { data: drivers = [], isLoading: isLoadingDrivers, isError: isErrorDrivers } = useDrivers()
  const { data: trucks = [], isLoading: isLoadingTrucks } = useTrucks()

  const deleteDriver = useDeleteDriver()
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<DriverDocument | undefined>(undefined)
  const [driverToDelete, setDriverToDelete] = useState<DriverDocument | null>(null)

  const isLoading = isLoadingDrivers || isLoadingTrucks
  const isError = isErrorDrivers

  const handleCloseFormModal = () => {
    setSelectedDriver(undefined)
    setIsFormModalOpen(false)
  }

  const handleEditDriver = (driver: DriverDocument) => {
    setSelectedDriver(driver)
    setIsFormModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (driverToDelete) {
      try {
        await deleteDriver.mutateAsync(driverToDelete.id!)
        setIsConfirmOpen(false)
        setDriverToDelete(null)
      } catch (error: any) {
        toast.error(error.message || 'Error removing driver')
      }
    }
  }

  const handleDeleteClick = (driver: DriverDocument) => {
    setDriverToDelete(driver)
    setIsConfirmOpen(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className='flex flex-col text-left'>
            <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
            <p className="text-sm text-slate-500 mt-2">Manage drivers and their truck assignments.</p>
          </div>
          <Button onClick={() => {
            setSelectedDriver(undefined)
            setIsFormModalOpen(true)
          }}>
            New Driver
          </Button>
        </div>

        {isLoading && <Card className="text-center text-slate-400">Loading drivers...</Card>}
        {isError && <Card className="text-center text-rose-400">Failed to load drivers.</Card>}
        {!isLoading && !isError && (
          <DriverList
            drivers={drivers}
            trucks={trucks}
            onSelect={handleEditDriver}
            onDelete={handleDeleteClick}
          />
        )}

        <Modal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          title={selectedDriver ? 'Edit Driver' : 'New Driver'}
          description={selectedDriver ? 'Update driver information.' : 'Fill in the details to register a new driver.'}
        >
          <DriverForm
            driver={selectedDriver}
            trucks={trucks}
            onSuccess={handleCloseFormModal}
          />
        </Modal>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm removal"
          message={`Are you sure you want to remove driver ${driverToDelete?.name}? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
        />
      </div>
    </AppLayout>
  )
}

export default DriversPage
