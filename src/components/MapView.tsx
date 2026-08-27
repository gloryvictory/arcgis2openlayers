import { useRef } from 'react'
import { useMap } from '../hooks/useMap'
import { useArcgisStore } from '../stores/arcgisStore'

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const activeLayers = useArcgisStore((s) => s.activeLayers)
  const basemap = useArcgisStore((s) => s.basemap)
  const serverUrl = useArcgisStore((s) => s.serverUrl)
  const token = useArcgisStore((s) => s.token)

  useMap(mapRef, activeLayers, basemap, serverUrl, token)

  return <div ref={mapRef} className="h-full w-full" />
}
