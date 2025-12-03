import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { lineString } from '@turf/helpers'
import length from '@turf/length'
import along from '@turf/along'
import { Spinner } from '../../../components/ui'
import type { LoadDocument } from '../../../types'

type LoadRouteMapProps = {
    load: LoadDocument
}

const LoadRouteMap = ({ load }: LoadRouteMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const marker = useRef<mapboxgl.Marker | null>(null)
    const [isMapReady, setIsMapReady] = useState(false)
    const animationRef = useRef<number>(0)
    const simulationStartRef = useRef<number>(Date.now())

    useEffect(() => {
        if (!mapContainer.current || !load?.routeInfo?.geometry) return

        if (!mapContainer.current) return

        simulationStartRef.current = Date.now()

        let geometry: any
        try {
            geometry = typeof load.routeInfo.geometry === 'string'
                ? JSON.parse(load.routeInfo.geometry)
                : load.routeInfo.geometry
        } catch (e) {
            console.error('Error processing route geometry:', e)
            return
        }

        const path = lineString(geometry.coordinates)
        const totalLength = length(path)

        const animate = () => {
            if (load.status !== 'in-route') {
                if (load.status === 'delivered') {
                    marker.current?.setLngLat(load.routeInfo!.destinationCoords)
                } else {
                    marker.current?.setLngLat(load.routeInfo!.originCoords)
                }
                return
            }

            const now = Date.now()
            const elapsedTimeSeconds = (now - simulationStartRef.current) / 1000
            const totalDuration = load.routeInfo!.duration

            let currentProgress = elapsedTimeSeconds / totalDuration
            if (currentProgress > 1) currentProgress = 1
            if (currentProgress < 0) currentProgress = 0

            const distanceTraveled = totalLength * currentProgress
            const currentPoint = along(path, distanceTraveled)
            const [lng, lat] = currentPoint.geometry.coordinates

            marker.current?.setLngLat([lng, lat])

            if (currentProgress < 1) {
                animationRef.current = requestAnimationFrame(animate)
            }
        }

        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: load.routeInfo.originCoords,
                zoom: 9,
                pitch: 45, // Tilt the map for 3D effect
                bearing: -17.6,
                antialias: true, // Create smoother lines
                accessToken: import.meta.env.VITE_MAPBOX_TOKEN
            })

            map.current.on('load', () => {
                if (!map.current) return
                setIsMapReady(true)

                // Add 3D buildings layer
                const layers = map.current!.getStyle().layers
                const labelLayerId = layers?.find(
                    (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
                )?.id

                map.current!.addLayer(
                    {
                        'id': 'add-3d-buildings',
                        'source': 'composite',
                        'source-layer': 'building',
                        'filter': ['==', 'extrude', 'true'],
                        'type': 'fill-extrusion',
                        'minzoom': 15,
                        'paint': {
                            'fill-extrusion-color': '#aaa',
                            'fill-extrusion-height': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                15,
                                0,
                                15.05,
                                ['get', 'height']
                            ],
                            'fill-extrusion-base': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                15,
                                0,
                                15.05,
                                ['get', 'min_height']
                            ],
                            'fill-extrusion-opacity': 0.6
                        }
                    },
                    labelLayerId
                )

                // Add Sky Layer for realistic atmosphere
                map.current!.addLayer({
                    'id': 'sky',
                    'type': 'sky',
                    'paint': {
                        'sky-type': 'atmosphere',
                        'sky-atmosphere-sun': [0.0, 0.0],
                        'sky-atmosphere-sun-intensity': 15
                    }
                })

                map.current!.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: geometry,
                    },
                })

                map.current!.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': '#3b82f6',
                        'line-width': 6,
                        'line-opacity': 0.8
                    },
                })

                new mapboxgl.Marker({ color: '#22c55e' })
                    .setLngLat(load.routeInfo!.originCoords)
                    .setPopup(new mapboxgl.Popup().setHTML(`<p class="text-sm font-bold">Origin</p><p class="text-xs">${load.origin}</p>`))
                    .addTo(map.current!)

                new mapboxgl.Marker({ color: '#ef4444' })
                    .setLngLat(load.routeInfo!.destinationCoords)
                    .setPopup(new mapboxgl.Popup().setHTML(`<p class="text-sm font-bold">Destination</p><p class="text-xs">${load.destination}</p>`))
                    .addTo(map.current!)

                const coordinates = geometry.coordinates
                const bounds = coordinates.reduce((bounds: any, coord: any) => {
                    return bounds.extend(coord)
                }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

                map.current!.fitBounds(bounds, {
                    padding: { top: 100, bottom: 100, left: 100, right: 100 },
                    pitch: 45,
                })

                const el = document.createElement('div')
                el.className = 'truck-marker'
                el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/2888/2888724.png)'
                el.style.width = '48px'
                el.style.height = '48px'
                el.style.backgroundSize = 'contain'
                el.style.backgroundRepeat = 'no-repeat'
                el.style.filter = 'drop-shadow(0px 4px 8px rgba(0,0,0,0.4))'
                el.style.zIndex = '10'

                marker.current = new mapboxgl.Marker(el)
                    .setLngLat(load.routeInfo!.originCoords)
                    .addTo(map.current!)

                animate()
            })
        } else {
            if (map.current.loaded()) {
                animate()
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [load])

    if (!load?.routeInfo?.geometry) {
        return (
            <div className="lg:col-span-2 h-[400px] lg:h-[500px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                <div className="text-center p-6">
                    <div className="bg-slate-100 p-4 rounded-full inline-flex mb-3">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </div>
                    <p className="text-slate-500 font-medium">Route information not available</p>
                    <p className="text-slate-400 text-sm mt-1">The route hasn't been calculated yet.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="lg:col-span-2 h-[400px] lg:h-[500px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
            {!isMapReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                    <Spinner />
                </div>
            )}
            <div ref={mapContainer} className="h-full w-full" />
        </div>
    )
}

export default LoadRouteMap
