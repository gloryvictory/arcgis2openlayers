import { type ChangeEvent } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useArcgisStore } from '../stores/arcgisStore'
import type { ArcgisService } from '../types/arcgis'

interface GroupedServices {
  label: string
  services: ArcgisService[]
}

function groupServices(services: ArcgisService[]): GroupedServices[] {
  const root = services.filter((s) => s.folder === null)
  const folders = new Map<string, ArcgisService[]>()
  for (const service of services) {
    if (service.folder === null) continue
    const list = folders.get(service.folder) ?? []
    list.push(service)
    folders.set(service.folder, list)
  }

  const groups: GroupedServices[] = []
  if (root.length > 0) groups.push({ label: 'Корень', services: root })
  for (const [folder, list] of folders) {
    groups.push({ label: folder, services: list })
  }
  return groups
}

export default function SectionSelector() {
  const services = useArcgisStore((s) => s.services)
  const selectedService = useArcgisStore((s) => s.selectedService)
  const layers = useArcgisStore((s) => s.layers)
  const selectedLayerId = useArcgisStore((s) => s.selectedLayerId)
  const isLoadingDetails = useArcgisStore((s) => s.isLoadingDetails)
  const selectService = useArcgisStore((s) => s.selectService)
  const selectLayer = useArcgisStore((s) => s.selectLayer)

  const groups = groupServices(services)

  const handleServiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const path = e.target.value
    const service = services.find((s) => s.path === path)
    if (!service) {
      selectLayer(null)
      return
    }
    selectService(service).catch(() => {
      toast.error('Не удалось загрузить детали сервиса')
    })
  }

  const handleLayerChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    selectLayer(value === '' ? null : Number(value))
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Сервисы и слои
      </h2>

      <select
        value={selectedService?.path ?? ''}
        onChange={handleServiceChange}
        disabled={services.length === 0}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">
          {services.length === 0 ? 'Нет сервисов — подключитесь к серверу' : 'Выберите сервис'}
        </option>
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.services.map((service) => (
              <option key={service.path} value={service.path}>
                {service.name} ({service.type})
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {selectedService && (
        <div className="space-y-2">
          {isLoadingDetails ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Загрузка слоёв…
            </div>
          ) : (
            <select
              value={selectedLayerId ?? ''}
              onChange={handleLayerChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Выберите слой</option>
              {layers.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name} (ID {layer.id})
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  )
}
