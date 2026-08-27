import { Layers } from 'lucide-react'
import { useArcgisStore } from '../stores/arcgisStore'
import { cn } from '../lib/utils'
import type { BasemapId } from '../types/arcgis'

const BASEMAPS: { id: BasemapId; label: string }[] = [
  { id: 'osm', label: 'OSM' },
  { id: 'esri-imagery', label: 'Esri Спутник' },
]

export default function BasemapSelector() {
  const basemap = useArcgisStore((s) => s.basemap)
  const setBasemap = useArcgisStore((s) => s.setBasemap)

  return (
    <div className="absolute right-2 top-2 z-10 flex flex-col gap-1 rounded-md bg-white p-1 shadow dark:bg-slate-900">
      <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Layers className="h-3.5 w-3.5" /> Подложка
      </span>
      {BASEMAPS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setBasemap(item.id)}
          className={cn(
            'rounded px-2 py-1 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800',
            basemap === item.id &&
              'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
