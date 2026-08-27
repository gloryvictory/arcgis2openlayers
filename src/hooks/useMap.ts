import { useEffect, useRef, useState, type RefObject } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import BaseLayer from 'ol/layer/Base'
import TileLayer from 'ol/layer/Tile'
import ImageLayer from 'ol/layer/Image'
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import ImageArcGISRest from 'ol/source/ImageArcGISRest'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { fromLonLat } from 'ol/proj'
import { defaults as defaultControls } from 'ol/control/defaults'
import type { ActiveLayer, BasemapId } from '../types/arcgis'
import { normalizeServerUrl } from '../services/arcgisApi'

function createBasemapLayer(basemap: BasemapId): BaseLayer {
  if (basemap === 'esri-imagery') {
    return new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles © Esri, Esri World Imagery',
        crossOrigin: 'anonymous',
      }),
    })
  }
  return new TileLayer({
    source: new OSM({ attributions: '© OpenStreetMap contributors' }),
  })
}

function createArcgisLayer(active: ActiveLayer, serverUrl: string, token?: string): BaseLayer {
  const base = normalizeServerUrl(serverUrl)
  const serviceUrl = `${base}/${active.service.path}`

  switch (active.sourceType) {
    case 'tile': {
      let tileUrl = `${serviceUrl}/tile/{z}/{y}/{x}`
      if (token) tileUrl = `${tileUrl}?token=${encodeURIComponent(token)}`
      return new TileLayer({
        source: new XYZ({ url: tileUrl, crossOrigin: 'anonymous' }),
      })
    }

    case 'feature': {
      const params = new URLSearchParams()
      params.set('f', 'geojson')
      params.set('where', '1=1')
      params.set('outFields', '*')
      params.set('returnGeometry', 'true')
      params.set('outSR', '4326')
      if (token) params.set('token', token)
      return new VectorLayer({
        source: new VectorSource({
          format: new GeoJSON(),
          url: `${serviceUrl}/${active.layer.id}/query?${params.toString()}`,
        }),
      })
    }

    case 'image':
    default: {
      const params: Record<string, string> = {}
      if (active.service.type === 'MapServer') {
        params.LAYERS = `show:${active.layer.id}`
      }
      if (token) params.token = token
      return new ImageLayer({
        source: new ImageArcGISRest({
          url: serviceUrl,
          params,
          crossOrigin: 'anonymous',
        }),
      })
    }
  }
}

export function useMap(
  targetRef: RefObject<HTMLDivElement | null>,
  activeLayers: ActiveLayer[],
  basemap: BasemapId,
  serverUrl: string,
  token?: string,
): void {
  const mapRef = useRef<Map | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!targetRef.current) return
    const map = new Map({
      target: targetRef.current,
      layers: [createBasemapLayer(basemap)],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
      controls: defaultControls({ attribution: true, zoom: true }),
    })
    mapRef.current = map
    setReady(true)

    return () => {
      map.setTarget(undefined)
      mapRef.current = null
      setReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.getLayers().setAt(0, createBasemapLayer(basemap))
  }, [basemap, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    const desired = new Set(activeLayers.map((al) => al.id))

    map.getLayers().forEach((layer) => {
      const id = layer.get('arcgisId') as string | undefined
      if (id && !desired.has(id)) {
        map.removeLayer(layer)
      }
    })

    for (const active of activeLayers) {
      const exists = map
        .getLayers()
        .getArray()
        .some((layer) => layer.get('arcgisId') === active.id)
      if (exists) continue
      const olLayer = createArcgisLayer(active, serverUrl, token)
      olLayer.set('arcgisId', active.id)
      map.addLayer(olLayer)
    }
  }, [activeLayers, serverUrl, token, ready])
}
