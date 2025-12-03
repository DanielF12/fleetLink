import { useState } from 'react'
import { AppLayout } from '../../../components/layout'
import { Button, Modal, Spinner } from '../../../components/ui'
import { LoadForm, LoadList } from '../components'
import { useLoads } from '../hooks'
import { useDrivers } from '../../drivers/hooks'
import { useTrucks } from '../../trucks/hooks'
import type { LoadDocument } from '../../../types'

const LoadsPage = () => {
  const { data: loads = [], isLoading: isLoadingLoads } = useLoads()
  const { data: drivers = [], isLoading: isLoadingDrivers } = useDrivers()
  const { data: trucks = [], isLoading: isLoadingTrucks } = useTrucks()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<LoadDocument | undefined>(undefined)

  const isLoading = isLoadingLoads || isLoadingDrivers || isLoadingTrucks

  const handleOpenModal = (load?: LoadDocument) => {
    setSelectedLoad(load)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedLoad(undefined)
    setIsModalOpen(false)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className='flex flex-col text-left'>
            <h1 className="text-2xl font-semibold text-slate-900">Loads</h1>
            <p className="text-sm text-slate-500 mt-2">Manage loads and their assignments to drivers and trucks.</p>
          </div>
          <Button onClick={() => handleOpenModal()}>New Load</Button>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <LoadList
            loads={loads}
            drivers={drivers}
            trucks={trucks}
            onSelect={handleOpenModal}
          />
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedLoad ? 'Edit Load' : 'New Load'}
        >
          <LoadForm
            load={selectedLoad}
            drivers={drivers}
            trucks={trucks}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        </Modal>
      </div>
    </AppLayout>
  )
}

export default LoadsPage
