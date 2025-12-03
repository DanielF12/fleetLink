import { useEffect, useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { TruckDocument, TruckStatus, DriverDocument } from '../../../types'
import { Button, Input, Select, ConfirmDialog } from '../../../components/ui'
import { useTruckActiveLoads } from '../../loads/hooks'

const truckSchema = yup.object({
  licensePlate: yup
    .string()
    .required('License plate is required')
    .transform((value) => value.toUpperCase())
    .matches(/^[A-Z0-9\s-]{2,12}$/, 'Invalid license plate (use only letters, numbers and dashes)'),
  model: yup.string().required('Model is required'),
  capacityKg: yup.number().typeError('Must be a number').required('Capacity is required'),
  year: yup.number()
    .typeError('Must be a number')
    .integer('Invalid year')
    .min(1990, 'Year must be greater than 1990')
    .max(new Date().getFullYear() + 1, 'Invalid year')
    .required('Year is required'),
  status: yup.mixed<TruckStatus>().oneOf(['active', 'maintenance']).required('Select a status'),
})

export type TruckFormValues = {
  licensePlate: string
  model: string
  capacityKg: number
  year: number
  status: TruckStatus
  documentFile?: FileList
}

type TruckFormProps = {
  defaultValues?: TruckDocument | null
  drivers: DriverDocument[]
  onSubmit: (values: TruckFormValues) => Promise<void> | void
  loading?: boolean
}

const TruckForm = ({ defaultValues, drivers, onSubmit, loading }: TruckFormProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<TruckFormValues | null>(null)

  // Fetch active loads for this truck if we are editing
  const { data: activeLoads = [] } = useTruckActiveLoads(defaultValues?.id)

  // useMemo to not re-render the form when the truck prop changes
  // because defaultValues will not change
  const defaultFormValues = useMemo(() => {
    return defaultValues ?? {
      licensePlate: '',
      model: '',
      capacityKg: 1,
      year: new Date().getFullYear(),
      status: 'active' as TruckStatus,
    }
  }, [defaultValues])

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<TruckFormValues>({
    resolver: yupResolver(truckSchema) as any,
    defaultValues: defaultFormValues,
  })

  useEffect(() => {
    if (defaultValues) {
      reset({
        licensePlate: defaultValues.licensePlate,
        model: defaultValues.model,
        capacityKg: defaultValues.capacityKg,
        year: defaultValues.year,
        status: defaultValues.status,
      })
    } else {
      // Reset to default values when creating new truck
      reset({
        licensePlate: '',
        model: '',
        capacityKg: 1,
        year: new Date().getFullYear(),
        status: 'active',
      })
    }
  }, [defaultValues, reset])

  const handleFormSubmit = async (data: TruckFormValues) => {
    // Validate capacity reduction against active loads
    if (defaultValues && data.capacityKg < defaultValues.capacityKg) {
      const conflictingLoad = activeLoads.find(load => load.weightKg > data.capacityKg)
      if (conflictingLoad) {
        setError('capacityKg', {
          type: 'manual',
          message: `Insufficient capacity for active load "${conflictingLoad.description}" (${conflictingLoad.weightKg}kg).`
        })
        return
      }
    }

    // Check if status is changing to maintenance AND there are active loads
    if (data.status === 'maintenance' && activeLoads.length > 0) {
      setPendingSubmit(data)
      setShowConfirmDialog(true)
      return
    }

    await onSubmit(data)
  }

  const handleConfirmMaintenance = async () => {
    if (pendingSubmit) {
      await onSubmit(pendingSubmit)
      setShowConfirmDialog(false)
      setPendingSubmit(null)
    }
  }

  return (
    <>
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false)
          setPendingSubmit(null)
        }}
        onConfirm={handleConfirmMaintenance}
        title="Warning: Active Loads"
        message="This truck has planned or in-progress loads. Setting it to maintenance will not automatically cancel these loads. Are you sure you want to continue?"
        confirmText="Yes, set to maintenance"
        cancelText="Cancel"
        isLoading={loading}
      />
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="License Plate" placeholder="ABC1D23" {...register('licensePlate')} error={errors.licensePlate?.message} />
          <Input label="Model" placeholder="Model" {...register('model')} error={errors.model?.message} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Capacity (kg)"
            type="number"
            placeholder="12000"
            {...register('capacityKg')}
            error={errors.capacityKg?.message}
          />
          <Input label="Year" type="number" placeholder="2023" {...register('year')} error={errors.year?.message} />
          <div>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'maintenance', label: 'Maintenance' },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.status?.message}
                />
              )}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 text-left">Document (PDF or Image)</label>
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            {...register('documentFile')}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {defaultValues?.documentUrl && (
            <div className="mt-2">
              <a
                href={defaultValues.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-2"
              >
                View current document
              </a>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 text-left block text-sm font-medium text-slate-700">Linked Driver</label>
          <input
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 cursor-not-allowed shadow-sm"
            value={defaultValues?.driverId ? drivers.find(d => d.id === defaultValues.driverId)?.name || 'Driver not found' : 'No driver linked'}
            disabled
            readOnly
          />
          <p className="text-left text-xs text-amber-600 mt-2">
            Driver assignment must be managed through the Drivers screen.
          </p>
        </div>

        <div className="flex justify-end pt-4 mt-6">
          <Button type="submit" loading={loading}>
            {defaultValues ? 'Save Changes' : 'Add'}
          </Button>
        </div>
      </form>
    </>
  )
}

export default TruckForm
