export type TruckStatus = 'active' | 'maintenance'

export type TruckDocument = {
  id?: string
  licensePlate: string
  model: string
  capacityKg: number
  year: number
  status: TruckStatus
  driverId?: string | null
  documentUrl?: string | null
  createdAt: string
  updatedAt: string
}

