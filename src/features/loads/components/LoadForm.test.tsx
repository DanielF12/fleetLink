import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import LoadForm from './LoadForm'
import { useCreateLoad, useUpdateLoad } from '../hooks'

// Mock the hooks
vi.mock('../hooks', () => ({
    useCreateLoad: vi.fn(),
    useUpdateLoad: vi.fn(),
}))

// Mock the map service
vi.mock('../../../services/mapService', () => ({
    getCoordinates: vi.fn().mockResolvedValue([0, 0]),
    getRoute: vi.fn().mockResolvedValue({
        distance: 1000,
        duration: 3600,
        geometry: { coordinates: [] }
    }),
}))

// Mock the UI components
vi.mock('../../../components/ui', async (importOriginal) => {
    const actual = await importOriginal<any>()
    return {
        ...actual,
        AddressAutocomplete: ({ value, onChange, label, placeholder, error, disabled }: any) => (
            <div className="flex flex-col gap-1.5">
                <label>{label}</label>
                <input
                    data-testid={`autocomplete-${label}`}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                {error && <span className="text-sm text-red-500">{error}</span>}
            </div>
        ),

        // Mock the Select (Radix UI) component
        Select: ({ value, onChange, label, options, error, disabled }: any) => (
            <div className="flex flex-col gap-1.5">
                <label>{label}</label>
                <select
                    data-testid={`select-${label}`}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                    <option value="">Select...</option>
                    {options.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <span className="text-sm text-red-500">{error}</span>}
            </div>
        )
    }
})

// Test the LoadForm component
describe('LoadForm Integration', () => {
    const mockOnSuccess = vi.fn()
    const mockOnCancel = vi.fn()
    const mockMutateAsync = vi.fn()

    const mockDrivers = [
        { id: 'd1', name: 'João Silva', phone: '11999999999', licenseNumber: '12345678900', truckId: 't1', createdAt: '', updatedAt: '' }
    ]

    const mockTrucks = [
        { id: 't1', licensePlate: 'ABC-1234', model: 'Volvo FH', capacityKg: 10000, status: 'active', driverId: 'd1', year: 2020, createdAt: '', updatedAt: '' },
        { id: 't2', licensePlate: 'XYZ-5678', model: 'Scania R', capacityKg: 5000, status: 'active', driverId: 'd1', year: 2021, createdAt: '', updatedAt: '' }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
            ; (useCreateLoad as any).mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false })
            ; (useUpdateLoad as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
    })

    test('Happy Path: Should submit form successfully with valid data', async () => {
        render(
            <LoadForm
                drivers={mockDrivers}
                trucks={mockTrucks as any}
                onSuccess={mockOnSuccess}
                onCancel={mockOnCancel}
            />
        )

        // Fill Description
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Load' } })

        // Fill Weight
        fireEvent.change(screen.getByLabelText(/Weight/i), { target: { value: '1000' } })

        // Fill Origin (Autocomplete Mocked)
        fireEvent.change(screen.getByTestId('autocomplete-Origin'), { target: { value: 'São Paulo' } })

        // Fill Destination (Autocomplete Mocked)
        fireEvent.change(screen.getByTestId('autocomplete-Destination'), { target: { value: 'Rio de Janeiro' } })

        // Select Truck (Select Mocked)
        fireEvent.change(screen.getByTestId('select-Truck (with Driver)'), { target: { value: 't1' } })

        // Submit
        fireEvent.click(screen.getByText('Create Load'))

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
                description: 'Test Load',
                weightKg: 1000,
                origin: 'São Paulo',
                destination: 'Rio de Janeiro',
                truckId: 't1',
                status: 'planned'
            }))
            expect(mockOnSuccess).toHaveBeenCalled()
        })
    })

    test('Validation: Should show errors for required fields', async () => {
        render(
            <LoadForm
                drivers={mockDrivers}
                trucks={mockTrucks as any}
                onSuccess={mockOnSuccess}
                onCancel={mockOnCancel}
            />
        )

        fireEvent.click(screen.getByText('Create Load'))

        await waitFor(() => {
            expect(screen.getByText('Description is required')).toBeInTheDocument()
            expect(screen.getByText(/Weight is required|Weight must be a number/)).toBeInTheDocument()
            expect(screen.getByText('Origin is required')).toBeInTheDocument()
            expect(screen.getByText('Destination is required')).toBeInTheDocument()
            expect(screen.getByText('Field is required')).toBeInTheDocument() // Truck ID
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    test('Business Rule: Should validate weight against truck capacity', async () => {
        render(
            <LoadForm
                drivers={mockDrivers}
                trucks={mockTrucks as any}
                onSuccess={mockOnSuccess}
                onCancel={mockOnCancel}
            />
        )

        fireEvent.change(screen.getByLabelText(/Weight/i), { target: { value: '6000' } })
        fireEvent.change(screen.getByTestId('select-Truck (with Driver)'), { target: { value: 't2' } })
        fireEvent.click(screen.getByText('Create Load'))

        await waitFor(() => {
            expect(screen.getByText(/Weight exceeds truck capacity/)).toBeInTheDocument()
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
    })
})
