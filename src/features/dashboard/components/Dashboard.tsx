import { useMemo, lazy, Suspense } from 'react'
import { useLoads, useLoadMap } from '../../loads/hooks'
import { useDrivers } from '../../drivers/hooks'
import { useTrucks } from '../../trucks/hooks'
import DashboardStats from './DashboardStats'
import RecentLoadsTable from './RecentLoadsTable'

const Dashboard = () => {
    const { data: loads = [], isLoading: isLoadingLoads } = useLoads()
    const { data: drivers = [], isLoading: isLoadingDrivers } = useDrivers()
    const { data: trucks = [], isLoading: isLoadingTrucks } = useTrucks()

    const {
        selectedLoadMap,
        handleOpenMap,
        handleCloseMap,
        getSelectedDriver,
        getSelectedTruck
    } = useLoadMap()

    const LoadMapModal = useMemo(() => lazy(() => import('../../loads/components/LoadMapModal')), [])

    const stats = useMemo(() => {
        const planned = loads.filter(l => l.status === 'planned').length
        const inRoute = loads.filter(l => l.status === 'in-route').length
        const delivered = loads.filter(l => l.status === 'delivered').length

        const activeDrivers = drivers.length
        const availableTrucks = trucks.filter(t => t.status === 'active').length

        return { planned, inRoute, delivered, activeDrivers, availableTrucks }
    }, [loads, drivers, trucks])

    const recentLoads = useMemo(() => {
        return loads.slice(0, 5)
    }, [loads])

    if (isLoadingLoads || isLoadingDrivers || isLoadingTrucks) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                <p className="text-slate-500">Overview of logistics operation</p>
            </div>

            <DashboardStats stats={stats} />

            <RecentLoadsTable loads={recentLoads} onOpenMap={handleOpenMap} />

            <Suspense fallback={
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
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
        </div>
    )
}

export default Dashboard
