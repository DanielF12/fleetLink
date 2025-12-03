import { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button, Input, Select } from '../../../components/ui'
import { useCreateDriver, useUpdateDriver } from '../hooks'
import { useDriverActiveLoads } from '../../loads/hooks'
import { checkLicenseNumberAvailability } from '../services/driverService'
import type { DriverDocument, TruckDocument } from '../../../types'

const schema = yup.object({
    name: yup.string().required('Name is required'),
    licenseNumber: yup
        .string()
        .required('License number is required')
        .transform((value) => value.toUpperCase())
        .matches(/^[A-Z0-9]{5,20}$/, 'Invalid license (use only letters and numbers)'),
    phone: yup
        .string()
        .required('Phone is required')
        .matches(/^\+?[0-9\s\-\(\)]{8,20}$/, 'Invalid phone number'),
    truckId: yup.string().nullable(),
})

type DriverFormProps = {
    driver?: DriverDocument
    trucks: TruckDocument[]
    onSuccess: () => void
}

const DriverForm = ({ driver, trucks, onSuccess }: DriverFormProps) => {
    const createDriver = useCreateDriver()
    const updateDriver = useUpdateDriver()

    // Check for active loads (in route)
    const { data: activeLoads = [] } = useDriverActiveLoads(driver?.id)
    const hasActiveLoads = activeLoads.length > 0

    // useMemo to not re-render the form when the driver prop changes
    // because defaultValues will not change
    const defaultValues = useMemo(() => ({
        name: driver?.name || '',
        licenseNumber: driver?.licenseNumber || '',
        phone: driver?.phone || '',
        truckId: driver?.truckId || '',
    }), [driver])

    const {
        register,
        handleSubmit,
        setError,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues,
        values: defaultValues,
    })


    // Generate truck options from the full list of trucks
    // useMemo to not re-render when the forms are re-rendered
    // because the options will not change
    const truckOptions = useMemo(() => {
        // Filter trucks: keep only available ones (no driver) OR the one currently linked to this driver
        const availableTrucks = trucks.filter(truck =>
            !truck.driverId ||
            (driver && truck.driverId === driver.id) ||
            (driver && truck.id === driver.truckId)
        )

        const options = availableTrucks.map((truck: TruckDocument) => {
            const isCurrentTruck = truck.id === driver?.truckId

            let label = `${truck.licensePlate} - ${truck.model}`

            if (isCurrentTruck) {
                label += ' (Current)'
            }

            return {
                value: truck.id!,
                label: label,
                disabled: false
            }
        })

        // Sort options: Current truck first, then alphabetical
        const sortedOptions = options.sort((a, b) => {
            if (a.value === driver?.truckId) return -1
            if (b.value === driver?.truckId) return 1
            return a.label.localeCompare(b.label)
        })

        // Add "None" option at the beginning
        // because the driver can be unassigned
        return [
            { value: 'none', label: 'None (Unassigned)', disabled: false },
            ...sortedOptions
        ]
    }, [trucks, driver])

    const onSubmit = async (data: any) => {
        try {
            // Check for unique CNH if creating or if CNH changed
            if (!driver || data.licenseNumber !== driver.licenseNumber) {
                const isAvailable = await checkLicenseNumberAvailability(data.licenseNumber)
                if (!isAvailable) {
                    setError('licenseNumber', { message: 'License number already registered' })
                    return
                }
            }

            // Convert empty string or 'none' to null for truckId
            const formattedData = {
                ...data,
                truckId: (data.truckId && data.truckId !== 'none') ? data.truckId : null
            }

            if (driver && driver.id) {
                await updateDriver.mutateAsync({ id: driver.id, data: formattedData })
            } else {
                await createDriver.mutateAsync(formattedData)
            }
            onSuccess()
        } catch (error: unknown) {
            console.error('Error saving driver:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
                <Input
                    label="Full Name"
                    {...register('name')}
                    error={errors.name?.message}
                    placeholder="Full Name"
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <Input
                        label="License Number"
                        {...register('licenseNumber')}
                        error={errors.licenseNumber?.message}
                        placeholder="License Number"
                    />

                    <Input
                        label="Phone"
                        {...register('phone')}
                        error={errors.phone?.message}
                        placeholder="Phone"
                    />
                </div>

                <div className="space-y-1">
                    <Controller
                        name="truckId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                key={truckOptions.length}
                                label="Link Truck (Optional)"
                                value={field.value || ''}
                                onChange={field.onChange}
                                error={errors.truckId?.message}
                                options={truckOptions}
                                disabled={hasActiveLoads}
                            />
                        )}
                    />
                    {hasActiveLoads && (
                        <p className="text-left text-xs text-amber-600 mt-2">
                            Cannot change truck while there are loads in route.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 mt-6">
                <Button type="submit" loading={isSubmitting}>
                    {driver ? 'Save Changes' : 'Add'}
                </Button>
            </div>
        </form>
    )
}

export default DriverForm
