
const MAPBOX_DIRECTIONS_API = 'https://api.mapbox.com/directions/v5/mapbox/driving'
const MAPBOX_GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places'
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN



export type AddressSuggestion = {
    id: string
    place_name: string
    center: [number, number]
}

// Search coordinates (latitude, longitude) from an address (Geocoding)
export const getCoordinates = async (address: string): Promise<[number, number]> => {
    if (!MAPBOX_TOKEN) throw new Error('Mapbox token missing')

    try {
        const response = await fetch(
            `${MAPBOX_GEOCODING_API}/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
        )
        const data = await response.json()
        if (data.features && data.features.length > 0) {
            return data.features[0].center // Retorna [lng, lat]
        }
        throw new Error('Address not found')
    } catch (error) {
        console.error('Error while fetching coordinates:', error)
        throw error
    }
}

// Search address suggestions while the user types (Autocomplete)
export const searchAddress = async (query: string): Promise<AddressSuggestion[]> => {
    if (!MAPBOX_TOKEN) throw new Error('Mapbox token missing')

    if (!query || query.length < 3) return []

    try {
        const response = await fetch(
            `${MAPBOX_GEOCODING_API}/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=address,poi&country=br&limit=5`
        )
        const data = await response.json()
        return data.features.map((f: any) => ({
            id: f.id,
            place_name: f.place_name,
            center: f.center
        }))
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error)
        return []
    }
}

// Calculate route between two points (Directions API)
export const getRoute = async (start: [number, number], end: [number, number]) => {
    if (!MAPBOX_TOKEN) throw new Error('Mapbox token missing')

    try {
        const response = await fetch(
            `${MAPBOX_DIRECTIONS_API}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
        )
        const data = await response.json()
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0]
            return {
                distance: route.distance, // em metros
                duration: route.duration, // em segundos
                geometry: route.geometry  // GeoJSON LineString
            }
        }
        throw new Error('Route not found')
    } catch (error) {
        console.error('Error while calculating route:', error)
        throw error
    }
}
