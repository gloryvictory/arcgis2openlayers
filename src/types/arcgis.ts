export type ServiceType = 'MapServer' | 'FeatureServer' | 'ImageServer'

export type SourceType = 'image' | 'tile' | 'feature'

export type BasemapId = 'osm' | 'esri-imagery'

/** Элемент каталога сервисов: сервис или папка */
export interface ServiceEntry {
  name: string
  type: string
}

/** Ответ каталога сервисов ArcGIS Server */
export interface ServicesCatalog {
  currentVersion?: number
  folders?: string[]
  services?: ServiceEntry[]
}

/** Сервис после обхода каталога (с учётом вложенных папок) */
export interface ArcgisService {
  /** Имя сервиса без типа, например «MyService» */
  name: string
  type: ServiceType
  /** Папка сервиса или null для корневых сервисов */
  folder: string | null
  /** Путь для REST-запроса, например «MyService/MapServer» или «folder/MyService/MapServer» */
  path: string
}

/** Поле атрибутивной таблицы слоя */
export interface ArcgisField {
  name: string
  alias?: string
  type?: string
}

/** Пространственный экстент */
export interface ArcgisExtent {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
  spatialReference?: { wkid?: number; latestWkid?: number }
}

/** Слой (подслой) сервиса */
export interface ArcgisLayer {
  id: number
  name: string
  type?: string
  description?: string
  parentLayerId?: number
  subLayerIds?: number[] | null
  defaultVisibility?: boolean
  minScale?: number
  maxScale?: number
  fields?: ArcgisField[]
  geometryType?: string
}

/** Детали сервиса, полученные из ?f=pjson */
export interface ArcgisServiceDetails {
  serviceDescription?: string
  mapName?: string
  description?: string
  copyrightText?: string
  singleFusedMapCache?: boolean
  initialExtent?: ArcgisExtent
  fullExtent?: ArcgisExtent
  capabilities?: string
  layers?: ArcgisLayer[]
  maxRecordCount?: number
  spatialReference?: { wkid?: number; latestWkid?: number }
}

/** Слой, добавленный на карту */
export interface ActiveLayer {
  /** Уникальный ключ: `{service.path}:{layerId}` */
  id: string
  service: ArcgisService
  layer: ArcgisLayer
  sourceType: SourceType
}

/** Описание базовой карты */
export interface Basemap {
  id: BasemapId
  name: string
  description: string
}
