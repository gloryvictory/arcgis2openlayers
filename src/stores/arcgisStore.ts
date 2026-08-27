import { create } from 'zustand'
import type {
  ActiveLayer,
  ArcgisLayer,
  ArcgisService,
  ArcgisServiceDetails,
  BasemapId,
  SourceType,
} from '../types/arcgis'
import {
  determineSourceType,
  fetchServiceDetails,
  fetchServicesCatalog,
  getVisibleLayers,
} from '../services/arcgisApi'

interface ArcgisState {
  serverUrl: string
  token: string
  services: ArcgisService[]
  selectedService: ArcgisService | null
  serviceDetails: ArcgisServiceDetails | null
  layers: ArcgisLayer[]
  selectedLayerId: number | null
  activeLayers: ActiveLayer[]
  basemap: BasemapId
  infoLayerId: number | null
  isLoadingCatalog: boolean
  isLoadingDetails: boolean
  error: string | null
  message: string | null

  setServerUrl: (url: string) => void
  setToken: (token: string) => void
  loadCatalog: () => Promise<void>
  selectService: (service: ArcgisService) => Promise<void>
  selectLayer: (id: number | null) => void
  addActiveLayer: (layerId: number) => void
  removeActiveLayer: (activeLayerId: string) => void
  clearActiveLayers: () => void
  setBasemap: (basemap: BasemapId) => void
  openInfo: (layerId: number) => void
  closeInfo: () => void
  clearError: () => void
  clearMessage: () => void
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export const useArcgisStore = create<ArcgisState>((set, get) => ({
  serverUrl: '',
  token: '',
  services: [],
  selectedService: null,
  serviceDetails: null,
  layers: [],
  selectedLayerId: null,
  activeLayers: [],
  basemap: 'osm',
  infoLayerId: null,
  isLoadingCatalog: false,
  isLoadingDetails: false,
  error: null,
  message: null,

  setServerUrl: (url) => set({ serverUrl: url }),

  setToken: (token) => set({ token }),

  loadCatalog: async () => {
    const { serverUrl, token } = get()
    set({ isLoadingCatalog: true, error: null, message: null })
    try {
      const services = await fetchServicesCatalog(serverUrl, token)
      set({
        services,
        selectedService: null,
        serviceDetails: null,
        layers: [],
        selectedLayerId: null,
        isLoadingCatalog: false,
        message: `Загружено сервисов: ${services.length}`,
      })
    } catch (err) {
      set({
        isLoadingCatalog: false,
        error: errorMessage(err, 'Не удалось загрузить каталог сервисов'),
      })
      throw err
    }
  },

  selectService: async (service) => {
    const { serverUrl, token } = get()
    set({
      selectedService: service,
      isLoadingDetails: true,
      error: null,
      message: null,
      serviceDetails: null,
      layers: [],
      selectedLayerId: null,
    })
    try {
      const details = await fetchServiceDetails(serverUrl, service, token)
      set({
        serviceDetails: details,
        layers: getVisibleLayers(details),
        isLoadingDetails: false,
      })
    } catch (err) {
      set({
        isLoadingDetails: false,
        error: errorMessage(err, 'Не удалось загрузить детали сервиса'),
      })
      throw err
    }
  },

  selectLayer: (id) => set({ selectedLayerId: id }),

  addActiveLayer: (layerId) => {
    const { selectedService, serviceDetails, layers, activeLayers } = get()
    if (!selectedService) return
    const layer = layers.find((l) => l.id === layerId)
    if (!layer) return
    const sourceType: SourceType = determineSourceType(selectedService.type, serviceDetails ?? {})
    const id = `${selectedService.path}:${layerId}`
    if (activeLayers.some((al) => al.id === id)) return
    const active: ActiveLayer = {
      id,
      service: selectedService,
      layer,
      sourceType,
      extent: serviceDetails?.fullExtent,
    }
    set({ activeLayers: [...activeLayers, active] })
  },

  removeActiveLayer: (activeLayerId) => {
    set({ activeLayers: get().activeLayers.filter((al) => al.id !== activeLayerId) })
  },

  clearActiveLayers: () => set({ activeLayers: [] }),

  setBasemap: (basemap) => set({ basemap }),

  openInfo: (layerId) => set({ infoLayerId: layerId }),

  closeInfo: () => set({ infoLayerId: null }),

  clearError: () => set({ error: null }),

  clearMessage: () => set({ message: null }),
}))
