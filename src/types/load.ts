export type LoadStatus = 'planned' | 'in-route' | 'delivered'

export type RouteInfo = {
  distance: number // meters
  duration: number // seconds
  coordinates: [number, number][] // [lng, lat]
}

export type LoadDocument = {
  id?: string
  description: string
  weightKg: number
  origin: string
  destination: string
  status: LoadStatus
  driverId: string
  truckId: string
  routeInfo?: {
    distance: number
    duration: number
    geometry: any // GeoJSON or Polyline string
    originCoords: { lat: number; lng: number }
    destinationCoords: { lat: number; lng: number }
  }
  departureTime?: string
  createdAt: string
  updatedAt: string
}

