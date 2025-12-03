import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Fix for Mapbox transpilation issue with Vite
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = await import('mapbox-gl/dist/mapbox-gl-csp-worker').then(m => m.default)

type Coordinates = {
    lat: number
    lng: number
}

type MapProps = {
    origin?: Coordinates
    destination?: Coordinates
    routeGeometry?: any // GeoJSON object
    className?: string
}

const Map = ({ origin, destination, routeGeometry, className = "h-[400px] w-full rounded-lg" }: MapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [styleLoaded, setStyleLoaded] = useState(false)

    useEffect(() => {
        const token = import.meta.env.VITE_MAPBOX_TOKEN
        if (!token) {
            setError('Mapbox token not found. Please add VITE_MAPBOX_TOKEN to .env')
            return
        }

        if (map.current) return // initialize map only once

        mapboxgl.accessToken = token

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current!,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [-48.853017, -26.252005], // Av. Rolf Wiest, 277
                zoom: 13,
            })

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

            map.current.on('load', () => {
                setStyleLoaded(true)
            })

        } catch (err) {
            console.error("Error initializing map:", err)
            setError('Failed to initialize map')
        }

        return () => {
            map.current?.remove()
            map.current = null
        }
    }, [])

    // Update markers and route
    useEffect(() => {
        if (!map.current || !styleLoaded) return

        // Clear existing markers (naive approach, better to keep refs)
        const markers = document.getElementsByClassName('mapboxgl-marker')
        while (markers[0]) {
            markers[0].remove()
        }

        const bounds = new mapboxgl.LngLatBounds()

        if (origin) {
            new mapboxgl.Marker({ color: '#22c55e' }) // Green for origin
                .setLngLat([origin.lng, origin.lat])
                .setPopup(new mapboxgl.Popup().setHTML('<p class="text-black">Origin</p>'))
                .addTo(map.current)
            bounds.extend([origin.lng, origin.lat])
        }

        if (destination) {
            new mapboxgl.Marker({ color: '#ef4444' }) // Red for destination
                .setLngLat([destination.lng, destination.lat])
                .setPopup(new mapboxgl.Popup().setHTML('<p class="text-black">Destination</p>'))
                .addTo(map.current)
            bounds.extend([destination.lng, destination.lat])
        }

        // Fit bounds if we have points
        if (origin || destination) {
            map.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15
            })
        }

        // Draw route if geometry exists
        if (routeGeometry) {
            // Remove existing route layer and source if they exist
            if (map.current.getLayer('route')) {
                map.current.removeLayer('route')
            }
            if (map.current.getSource('route')) {
                map.current.removeSource('route')
            }

            // Add route source
            map.current.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: routeGeometry
                }
            })

            // Add route layer
            map.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3b82f6', // Blue color
                    'line-width': 4,
                    'line-opacity': 0.8
                }
            })
        }

    }, [origin, destination, routeGeometry, styleLoaded])

    if (error) {
        return (
            <div className={`${className} bg-slate-900 flex items-center justify-center text-rose-400 border border-rose-900/50`}>
                {error}
            </div>
        )
    }

    return <div ref={mapContainer} className={className} />
}

export default Map
