import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Button, Input, Select, AddressAutocomplete, ConfirmDialog } from '../../../components/ui'
import { useCreateLoad, useUpdateLoad } from '../hooks'
import type { LoadDocument, DriverDocument, TruckDocument } from '../../../types'
import { getRoute, getCoordinates } from '../../../services/mapService'

type LoadFormProps = {
    load?: LoadDocument
    drivers: DriverDocument[]
    trucks: TruckDocument[]
    onSuccess: () => void
    onCancel: () => void
}

// Status dictionary
const statusOptions = [
    { value: 'planned', label: 'Planned' },
    { value: 'in-route', label: 'In Route' },
    { value: 'delivered', label: 'Delivered' },
]

const LoadForm = ({ load, drivers, trucks, onSuccess, onCancel }: LoadFormProps) => {
    const createLoad = useCreateLoad()
    const updateLoad = useUpdateLoad()

    const schema = useMemo(() => {
        return yup.object({
            description: yup.string().required('Description is required'),
            weightKg: yup.number().typeError('Weight must be a number').required('Weight is required'),
            origin: yup.string().required('Origin is required'),
            destination: yup.string().required('Destination is required'),
            truckId: yup.string().required('Field is required')
                .test('check-capacity', 'Weight exceeds truck capacity', function (value) {
                    const { weightKg } = this.parent
                    if (!value || !weightKg) return true // Skip validation if fields are empty

                    const selectedTruck = trucks.find(t => t.id === value)
                    if (!selectedTruck) return true

                    if (weightKg > selectedTruck.capacityKg) {
                        return this.createError({
                            message: `Weight exceeds truck capacity (${selectedTruck.capacityKg} kg)`
                        })
                    }
                    return true
                }),
            status: yup.string().oneOf(['planned', 'in-route', 'delivered']).required('Status is required')
                .test('check-maintenance', 'Cannot set status to "In Route" because the truck is in maintenance', function (value) {
                    const { truckId } = this.parent
                    if (value !== 'in-route' || !truckId) return true

                    const selectedTruck = trucks.find(t => t.id === truckId)
                    if (!selectedTruck) return true

                    return selectedTruck.status !== 'maintenance'
                })
                .test('check-driver-link', 'Cannot set status to "In Route" because the selected truck has no driver assigned', function (value) {
                    const { truckId } = this.parent
                    if (value !== 'in-route' || !truckId) return true

                    const selectedTruck = trucks.find(t => t.id === truckId)
                    if (!selectedTruck) return true

                    return !!selectedTruck.driverId
                }),
        })
    }, [trucks])

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: load || {
            description: '',
            weightKg: undefined,
            origin: '',
            destination: '',
            truckId: '',
            status: 'planned',
        },
    })

    const truckOptions = useMemo(() => {
        return trucks
            .filter(truck =>
                (truck.driverId && truck.status !== 'maintenance') || // Rule: with driver and active
                (load?.truckId === truck.id) // exception: is the truck currently linked to this load
            )
            .map(truck => {
                // If this is the truck currently linked to the load, use the driver from the load (historical data)
                // Otherwise, use the current driver of the truck
                const driverId = (load && load.truckId === truck.id) ? load.driverId : truck.driverId
                const driver = drivers.find(d => d.id === driverId)

                const driverName = driver ? ` - ${driver.name}` : ' - No driver'
                // suffix for maintenance status
                const maintenanceSuffix = truck.status === 'maintenance' ? ' [MAINTENANCE]' : ''
                return {
                    value: truck.id!,
                    label: `${truck.licensePlate} - ${truck.model}${driverName}${maintenanceSuffix}`
                }
            })
    }, [trucks, drivers, load?.truckId])

    // Derived state
    const isDelivered = load?.status === 'delivered'
    const isEditable = !isDelivered

    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [pendingData, setPendingData] = useState<any>(null)
    const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(
        load?.routeInfo?.originCoords || null
    )
    const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(
        load?.routeInfo?.destinationCoords || null
    )

    const processSubmit = async (data: any) => {
        try {
            let routeInfo = load?.routeInfo

            // Calculate route if coordinates are available or can be fetched
            try {
                let startCoords = originCoords
                let endCoords = destinationCoords

                // If coordinates are missing but we have addresses, try to geocode
                if (!startCoords && data.origin) {
                    const coords = await getCoordinates(data.origin)
                    startCoords = { lng: coords[0], lat: coords[1] }
                }

                if (!endCoords && data.destination) {
                    const coords = await getCoordinates(data.destination)
                    endCoords = { lng: coords[0], lat: coords[1] }
                }

                // If we have both coordinates, calculate the route
                if (startCoords && endCoords) {
                    // Only recalculate if something changed or if we didn't have route info
                    const originChanged = startCoords.lat !== load?.routeInfo?.originCoords?.lat || startCoords.lng !== load?.routeInfo?.originCoords?.lng
                    const destinationChanged = endCoords.lat !== load?.routeInfo?.destinationCoords?.lat || endCoords.lng !== load?.routeInfo?.destinationCoords?.lng

                    if (!routeInfo || originChanged || destinationChanged) {
                        const route = await getRoute(
                            [startCoords.lng, startCoords.lat],
                            [endCoords.lng, endCoords.lat]
                        )

                        routeInfo = {
                            distance: route.distance,
                            duration: route.duration,
                            geometry: JSON.stringify(route.geometry),
                            originCoords: startCoords,
                            destinationCoords: endCoords
                        }
                    }
                }
            } catch (error) {
                console.error('Error calculating route:', error)
                toast.error('Could not calculate route information')
            }

            const loadData = {
                ...data,
                driverId: trucks.find(t => t.id === data.truckId)?.driverId,
                routeInfo
            }

            if (load && load.id) {
                await updateLoad.mutateAsync({ id: load.id, data: loadData })
                toast.success('Load updated successfully!')
            } else {
                await createLoad.mutateAsync(loadData)
                toast.success('Load created successfully!')
            }
            onSuccess()
        } catch (error) {
            console.error('Error saving load:', error)
            toast.error('Error saving load')
        }
    }

    const onSubmit = (data: any) => {
        if (data.status === 'delivered' && load?.status !== 'delivered') {
            setPendingData(data)
            setShowConfirmDialog(true)
        } else {
            processSubmit(data)
        }
    }

    const handleConfirmDelivery = () => {
        if (pendingData) {
            processSubmit(pendingData)
            setShowConfirmDialog(false)
        }
    }

    return (
        <>
            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => {
                    setShowConfirmDialog(false)
                    setPendingData(null)
                }}
                onConfirm={handleConfirmDelivery}
                title="Confirm Delivery"
                message="Marking this load as Delivered will finalize it and it cannot be edited. Do you want to continue?"
                confirmText="Yes, finalize load"
                cancelText="Cancel"
                isLoading={createLoad.isPending || updateLoad.isPending}
            />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {(!isEditable || isDelivered) && (
                    <div className="mb-4 rounded-md bg-blue-500/10 border border-blue-500/20 p-3">
                        <p className="text-sm text-blue-400">
                            {isDelivered
                                ? "This load has been delivered and cannot be changed."
                                : "For loads in progress, only the status can be changed."
                            }
                        </p>
                    </div>
                )}

                <Input
                    label="Description"
                    {...register('description')}
                    error={errors.description?.message}
                    placeholder="Ex: Electronics Load"
                    disabled={!isEditable}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Weight (kg)"
                        type="number"
                        {...register('weightKg')}
                        error={errors.weightKg?.message}
                        placeholder="Ex: 1500"
                        disabled={!isEditable}
                    />

                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Status"
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.status?.message}
                                options={statusOptions}
                                disabled={isDelivered}
                            />
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                    <Controller
                        name="origin"
                        control={control}
                        render={({ field }) => (
                            <AddressAutocomplete
                                label="Origin"
                                value={field.value}
                                onChange={field.onChange}
                                onSelect={(suggestion) => {
                                    setOriginCoords({
                                        lng: suggestion.center[0],
                                        lat: suggestion.center[1]
                                    })
                                }}
                                error={errors.origin?.message}
                                placeholder="Ex: São Paulo, SP"
                                disabled={!isEditable}
                            />
                        )}
                    />

                    <Controller
                        name="destination"
                        control={control}
                        render={({ field }) => (
                            <AddressAutocomplete
                                label="Destination"
                                value={field.value}
                                onChange={field.onChange}
                                onSelect={(suggestion) => {
                                    setDestinationCoords({
                                        lng: suggestion.center[0],
                                        lat: suggestion.center[1]
                                    })
                                }}
                                error={errors.destination?.message}
                                placeholder="Ex: Rio de Janeiro, RJ"
                                disabled={!isEditable}
                            />
                        )}
                    />
                </div>

                <Controller
                    name="truckId"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="Truck (with Driver)"
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.truckId?.message}
                            options={truckOptions}
                            disabled={!isEditable}
                        />
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        {isDelivered ? 'Close' : 'Cancel'}
                    </Button>
                    {!isDelivered && (
                        <Button type="submit" loading={isSubmitting}>
                            {load ? 'Save Changes' : 'Create Load'}
                        </Button>
                    )}
                </div>
            </form>
        </>
    )
}

export default LoadForm
