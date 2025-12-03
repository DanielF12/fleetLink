export type DriverDocument = {
  id?: string
  name: string
  licenseNumber: string // CNH
  phone: string
  truckId?: string | null
  createdAt: string
  updatedAt: string
}
