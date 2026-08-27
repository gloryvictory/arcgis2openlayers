import type {
  ArcgisLayer,
  ArcgisService,
  ArcgisServiceDetails,
  ServiceEntry,
  ServicesCatalog,
  ServiceType,
  SourceType,
} from '../types/arcgis'

const SERVICE_TYPES: ServiceType[] = ['MapServer', 'FeatureServer', 'ImageServer']

/** Приводит введённый пользователем адрес к корню REST-каталога сервисов */
export function normalizeServerUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '')
  if (/\/arcgis\/rest\/services$/i.test(trimmed)) return trimmed
  if (/\/arcgis\/rest$/i.test(trimmed)) return `${trimmed}/services`
  return `${trimmed}/arcgis/rest/services`
}

async function fetchJson<T>(url: string, token?: string): Promise<T> {
  const params = new URLSearchParams({ f: 'pjson' })
  if (token) params.set('token', token)
  const response = await fetch(`${url}?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  const data = (await response.json()) as { error?: { message?: string } }
  if (data.error) {
    throw new Error(data.error.message ?? 'Ошибка ArcGIS Server')
  }
  return data as T
}

/** Нормализует запись каталога: тип берётся из поля `type`, путь строится из `name` */
function toArcgisService(folderPath: string | null, entry: ServiceEntry): ArcgisService | null {
  const type = (entry.type ?? '').trim() as ServiceType
  if (!SERVICE_TYPES.includes(type)) return null

  let path = (entry.name ?? '').trim()
  if (!path) return null

  // Если в имени уже есть суффикс типа («Culture/MapServer»), убираем его
  if (path.endsWith(`/${type}`)) {
    path = path.slice(0, -(type.length + 1))
  }

  // Некоторые серверы (например, ArcGIS 10.4) в каталоге папки возвращают имя
  // уже с путём к папке («OpenData/Culture»). Не дублируем папку в этом случае.
  if (folderPath && !path.startsWith(`${folderPath}/`)) {
    path = `${folderPath}/${path}`
  }

  const segments = path.split('/')
  const name = segments.pop() ?? path
  const folder = segments.length > 0 ? segments.join('/') : null

  return {
    name,
    type,
    folder,
    path: `${path}/${type}`,
  }
}

/** Рекурсивно обходит каталог сервисов и вложенные папки */
async function walkCatalog(
  base: string,
  folderPath: string | null,
  token?: string,
): Promise<ArcgisService[]> {
  const url = folderPath ? `${base}/${folderPath}` : base
  const catalog = await fetchJson<ServicesCatalog>(url, token)

  const result: ArcgisService[] = []
  for (const entry of catalog.services ?? []) {
    const service = toArcgisService(folderPath, entry)
    if (service) result.push(service)
  }

  const nestedLists = await Promise.all(
    (catalog.folders ?? []).map(async (subfolder) => {
      const nextPath = folderPath ? `${folderPath}/${subfolder}` : subfolder
      try {
        return await walkCatalog(base, nextPath, token)
      } catch {
        // Недоступную папку пропускаем — её сервисы просто не попадут в список
        return []
      }
    }),
  )
  for (const nested of nestedLists) {
    result.push(...nested)
  }

  return result
}

/** Загружает каталог сервисов с обходом вложенных папок */
export async function fetchServicesCatalog(
  serverUrl: string,
  token?: string,
): Promise<ArcgisService[]> {
  const base = normalizeServerUrl(serverUrl)
  return walkCatalog(base, null, token)
}

/** Загружает детали выбранного сервиса */
export async function fetchServiceDetails(
  serverUrl: string,
  service: ArcgisService,
  token?: string,
): Promise<ArcgisServiceDetails> {
  const base = normalizeServerUrl(serverUrl)
  return fetchJson<ArcgisServiceDetails>(`${base}/${service.path}`, token)
}

/** Определяет тип источника OpenLayers по типу сервиса и его параметрам */
export function determineSourceType(
  serviceType: ServiceType,
  details: ArcgisServiceDetails,
): SourceType {
  if (serviceType === 'FeatureServer') return 'feature'
  if (serviceType === 'MapServer' && details.singleFusedMapCache) return 'tile'
  return 'image'
}

/** Возвращает список слоёв сервиса; если список пуст — подставляет псевдослой */
export function getVisibleLayers(details: ArcgisServiceDetails): ArcgisLayer[] {
  const layers = details.layers ?? []
  if (layers.length > 0) return layers
  return [{ id: 0, name: 'Слой сервиса' }]
}
