import { Card } from '../../../components/ui'
import { Truck, Package, MapPin, type LucideIcon } from 'lucide-react'

type DashboardStatsProps = {
    stats: {
        planned: number
        inRoute: number
        delivered: number
        activeDrivers: number
        availableTrucks: number
    }
}

type StatCardProps = {
    title: string
    value: number | string
    icon: LucideIcon
    colorClass: string
    bgClass: string
    textClass: string
    children?: React.ReactNode
}

/**
 * Component of stat card
 * @param {string} title - Title of the card
 * @param {number | string} value - Value of the card
 * @param {LucideIcon} icon - Icon of the card
 * @param {string} colorClass - Color class of the card
 * @param {string} bgClass - Background class of the card
 * @param {string} textClass - Text class of the card
 * @param {React.ReactNode} children - Children of the card
 */
const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, textClass, children }: StatCardProps) => (
    <Card className={`p-6 border-l-4 ${colorClass}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                {children ? children : <p className="text-2xl font-bold text-slate-900">{value}</p>}
            </div>
            <div className={`p-3 rounded-full ${bgClass}`}>
                <Icon className={`h-6 w-6 ${textClass}`} />
            </div>
        </div>
    </Card>
)

const DashboardStats = ({ stats }: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Planned Loads"
                value={stats.planned}
                icon={Package}
                colorClass="border-l-blue-500"
                bgClass="bg-blue-50"
                textClass="text-blue-600"
            />

            <StatCard
                title="In Route"
                value={stats.inRoute}
                icon={MapPin}
                colorClass="border-l-amber-500"
                bgClass="bg-amber-50"
                textClass="text-amber-600"
            />

            <StatCard
                title="Delivered"
                value={stats.delivered}
                icon={Package}
                colorClass="border-l-emerald-500"
                bgClass="bg-emerald-50"
                textClass="text-emerald-600"
            />

            <StatCard
                title="Available Fleet"
                value=""
                icon={Truck}
                colorClass="border-l-indigo-500"
                bgClass="bg-indigo-50"
                textClass="text-indigo-600"
            >
                <div className="flex gap-4 mt-1">
                    <div>
                        <span className="text-xs text-slate-400">Drivers</span>
                        <p className="text-lg font-bold text-slate-900">{stats.activeDrivers}</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400">Trucks</span>
                        <p className="text-lg font-bold text-slate-900">{stats.availableTrucks}</p>
                    </div>
                </div>
            </StatCard>
        </div>
    )
}

export default DashboardStats
