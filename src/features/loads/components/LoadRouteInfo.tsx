import { Badge } from '../../../components/ui'
import type { LoadDocument, DriverDocument, TruckDocument } from '../../../types'
import { User, Truck, Phone, Calendar, Clock, MapPin, Box } from 'lucide-react'

type LoadRouteInfoProps = {
    load: LoadDocument
    driver: DriverDocument | null
    truck: TruckDocument | null
}

const LoadRouteInfo = ({ load, driver, truck }: LoadRouteInfoProps) => {
    const formatDuration = (seconds: number) => {
        if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60)
            const remainingSeconds = Math.floor(seconds % 60)
            return `${minutes}m ${remainingSeconds}s`
        }
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}h ${minutes}m`
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Distance
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                        {(load?.routeInfo?.distance ? load.routeInfo.distance / 1000 : 0).toFixed(1)}
                        <span className="text-xs font-normal text-slate-400 ml-1">km</span>
                    </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Estimated Time
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                        {load?.routeInfo?.duration ? formatDuration(load.routeInfo.duration) : '-'}
                    </p>
                </div>
            </div>

            {/* Visual Timeline */}
            <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900 mb-4 flex items-center justify-between">
                    Route
                    <Badge variant={load.status === 'planned' ? 'info' : load.status === 'in-route' ? 'warning' : 'success'}>
                        {load.status === 'planned' ? 'Planned' : load.status === 'in-route' ? 'In Route' : 'Delivered'}
                    </Badge>
                </h4>

                <div className="relative pl-4 border-l-2 border-slate-200 space-y-8 ml-2 py-2">
                    {/* Origin Point */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                        <div className="mb-1">
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Origin
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 leading-snug">{load.origin}</p>
                        {load.departureTime && (
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(load.departureTime).toLocaleString('en-US', {
                                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        )}
                    </div>

                    {/* Destination Point */}
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-red-500 ring-4 ring-white" />
                        <div className="mb-1">
                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                Destination
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 leading-snug">{load.destination}</p>
                        {load.routeInfo?.duration && load.departureTime && (
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                ETA: {new Date(new Date(load.departureTime).getTime() + load.routeInfo.duration * 1000).toLocaleString('en-US', {
                                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        )}
                    </div>
                </div>

                {/* Load Extra Info */}
                <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-md border border-slate-200 text-slate-400">
                            <Box className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Load</p>
                            <p className="text-sm font-medium text-slate-900">{load.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Weight</p>
                        <p className="text-sm font-medium text-slate-900">{load.weightKg.toLocaleString('en-US')} kg</p>
                    </div>
                </div>
            </div>

            {/* Unified Driver Card */}
            <div className="mt-auto pt-6 border-t border-slate-100">
                <h4 className="font-medium text-sm text-slate-900 tracking-wider mb-3">Transport</h4>
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-white shadow-sm">
                        {driver?.name ? getInitials(driver.name) : <User className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{driver?.name || 'No driver'}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone className="h-3 w-3" />
                            {driver?.phone || '-'}
                        </div>
                    </div>
                    <div className="text-right pl-4 border-l border-slate-100">
                        <div className="flex items-center justify-end gap-1 text-slate-900 font-medium">
                            <Truck className="h-3 w-3 text-slate-400" />
                            {truck?.licensePlate || '-'}
                        </div>
                        <p className="text-xs text-slate-500 truncate max-w-[100px]">{truck?.model || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadRouteInfo
