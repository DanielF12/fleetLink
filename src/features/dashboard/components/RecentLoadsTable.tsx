import { Card, Badge, Button } from '../../../components/ui'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { LoadDocument } from '../../../types'

type RecentLoadsTableProps = {
    loads: LoadDocument[]
    onOpenMap: (e: React.MouseEvent, load: LoadDocument) => void
}

const RecentLoadsTable = ({ loads, onOpenMap }: RecentLoadsTableProps) => {
    const navigate = useNavigate()

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'planned': return 'Planned'
            case 'in-route': return 'In Route'
            case 'delivered': return 'Delivered'
            default: return status
        }
    }

    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900">Recent Loads</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/loads')} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    View all <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
            <div className="w-full overflow-x-auto">
                <div className="min-w-[1000px] grid grid-cols-[100px_1.5fr_1.5fr_1.5fr_100px] gap-4 border-b border-slate-200 bg-slate-50 p-4 font-medium text-slate-500 text-sm tracking-wider">
                    <div className="text-left">Status</div>
                    <div className="text-left">Description</div>
                    <div className="text-left">Origin</div>
                    <div className="text-left">Destination</div>
                    <div className="text-center">Actions</div>
                </div>
                <div className="min-w-[1000px]">
                    {loads.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No recent loads found.
                        </div>
                    ) : (
                        loads.map((load) => (
                            <div
                                key={load.id}
                                className="grid grid-cols-[100px_1.5fr_1.5fr_1.5fr_100px] gap-4 items-center border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <Badge variant={
                                        load.status === 'in-route' ? 'warning' :
                                            load.status === 'delivered' ? 'success' : 'info'
                                    }>
                                        {getStatusLabel(load.status)}
                                    </Badge>
                                </div>
                                <div className="font-medium text-slate-900 text-left truncate" title={load.description}>
                                    {load.description}
                                </div>
                                <div className="text-slate-600 text-left truncate" title={load.origin}>
                                    {load.origin}
                                </div>
                                <div className="text-slate-600 text-left truncate" title={load.destination}>
                                    {load.destination}
                                </div>
                                <div className="flex justify-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => onOpenMap(e, load)}
                                        className="text-slate-500 hover:text-blue-600"
                                    >
                                        Details
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Card>
    )
}

export default RecentLoadsTable
