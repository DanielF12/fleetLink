import { useState } from 'react'
import toast from 'react-hot-toast'
import { AppLayout } from '../../../components/layout'
import { Button, Card, Modal, ConfirmDialog } from '../../../components/ui'
import type { TruckDocument } from '../../../types'
import { TruckForm, TruckList, useCreateTruck, useDeleteTruck, useTrucks, useUpdateTruck } from '..'
import { useDrivers } from '../../drivers/hooks'

const TrucksPage = () => {
  const [selectedTruck, setSelectedTruck] = useState<TruckDocument | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [truckToDelete, setTruckToDelete] = useState<TruckDocument | null>(null)

  const { data: trucks = [], isLoading: isLoadingTrucks, isError: isErrorTrucks } = useTrucks()
  const { data: drivers = [], isLoading: isLoadingDrivers } = useDrivers()

  const createTruck = useCreateTruck()
  const updateTruck = useUpdateTruck()
  const deleteTruck = useDeleteTruck()

  const isLoading = isLoadingTrucks || isLoadingDrivers
  const isError = isErrorTrucks

  const handleConfirmDelete = async () => {
    if (truckToDelete) {
      try {
        await deleteTruck.mutateAsync(truckToDelete.id!)
        setIsConfirmOpen(false)
        setTruckToDelete(null)
      } catch (error: any) {
        toast.error(error.message || 'Error deleting truck')
      }
    }
  }

  const handleDeleteClick = (truck: TruckDocument) => {
    setTruckToDelete(truck)
    setIsConfirmOpen(true)
  }

  const handleEditTruck = (truck: TruckDocument) => {
    setSelectedTruck(truck)
    setIsFormOpen(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className='flex flex-col text-left'>
            <h1 className="text-2xl font-semibold text-slate-900">Trucks</h1>
            <p className="text-sm text-slate-500 mt-2">Manage trucks and analyze their driver assignments.</p>
          </div>
          <Button onClick={() => {
            setSelectedTruck(null)
            setIsFormOpen(true)
          }}>
            New Truck
          </Button>
        </div>

        {isLoading && <Card className="text-center text-slate-400">Loading trucks...</Card>}
        {isError && <Card className="text-center text-rose-400">Could not load trucks.</Card>}
        {!isLoading && !isError && (
          <TruckList
            trucks={trucks}
            drivers={drivers}
            onSelect={handleEditTruck}
            onDelete={handleDeleteClick}
          />
        )}

        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedTruck(null)
          }}
          title={selectedTruck ? 'Edit Truck' : 'New Truck'}
          description={selectedTruck ? 'Update truck details.' : 'Fill in the details to register a new truck.'}
        >
          <TruckForm
            defaultValues={selectedTruck || undefined}
            drivers={drivers}
            onSubmit={async (values) => {
              if (selectedTruck) {
                await updateTruck.mutateAsync({
                  truckId: selectedTruck.id!,
                  data: values,
                })
              } else {
                await createTruck.mutateAsync({
                  ...values,
                  driverId: null,
                  documentUrl: null,
                })
              }
              setIsFormOpen(false)
              setSelectedTruck(null)
            }}
            loading={selectedTruck ? updateTruck.isPending : createTruck.isPending}
          />
        </Modal>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm removal"
          message={`Are you sure you want to remove the truck ${truckToDelete?.licensePlate}? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
        />
      </div>
    </AppLayout>
  )
}

export default TrucksPage
