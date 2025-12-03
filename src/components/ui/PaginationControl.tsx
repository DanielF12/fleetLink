import Button from './Button'
import { Select } from './Select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Componente de controle de paginação
 * @param {number} currentPage - Página atual
 * @param {number} totalPages - Total de páginas
 * @param {function} onPageChange - Função para mudar de página
 * @param {number} itemsPerPage - Itens por página
 * @param {function} onItemsPerPageChange - Função para mudar de itens por página
 * @param {number} totalItems - Total de itens
 */

type PaginationControlProps = {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    itemsPerPage: number
    onItemsPerPageChange: (items: number) => void
    totalItems: number
}

export const PaginationControl = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems,
}: PaginationControlProps) => {
    const itemsPerPageOptions = [
        { value: '5', label: '5 per page' },
        { value: '10', label: '10 per page' },
        { value: '25', label: '25 per page' },
        { value: '50', label: '50 per page' },
    ]

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 border-t border-slate-200">
            <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>
                    Showing <strong>{totalItems > 0 ? startItem : 0}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> results
                </span>
                <div className="w-[140px]">
                    <Select
                        value={String(itemsPerPage)}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        options={itemsPerPageOptions}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium text-slate-700">
                    Page {currentPage} of {Math.max(1, totalPages)}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
