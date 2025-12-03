import { X } from 'lucide-react'
import type { LoadDocument, DriverDocument, TruckDocument } from '../../../types'
import LoadRouteMap from './LoadRouteMap'
import LoadRouteInfo from './LoadRouteInfo'

type LoadMapModalProps = {
    isOpen: boolean
    onClose: () => void
    load: LoadDocument | null
    driver: DriverDocument | null
    truck: TruckDocument | null
}

const LoadMapModal = ({ isOpen, onClose, load, driver, truck }: LoadMapModalProps) => {
    if (!isOpen || !load) return null



    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 text-left shadow-xl transition-all w-full max-w-5xl">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium leading-6 text-slate-900" id="modal-title">
                            Load Route
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <LoadRouteMap load={load} />
                        <LoadRouteInfo load={load} driver={driver} truck={truck} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadMapModal