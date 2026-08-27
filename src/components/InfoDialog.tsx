import { X } from 'lucide-react'
import { useArcgisStore } from '../stores/arcgisStore'

export default function InfoDialog() {
  const infoLayerId = useArcgisStore((s) => s.infoLayerId)
  const layers = useArcgisStore((s) => s.layers)
  const serviceDetails = useArcgisStore((s) => s.serviceDetails)
  const closeInfo = useArcgisStore((s) => s.closeInfo)

  const layer = layers.find((l) => l.id === infoLayerId)

  if (infoLayerId == null || !layer) return null

  const extent = serviceDetails?.fullExtent

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 shadow-xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">{layer.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ID слоя: {layer.id}
              {layer.geometryType ? ` · Геометрия: ${layer.geometryType}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={closeInfo}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {layer.description && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{layer.description}</p>
        )}

        {extent && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Extent</h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              X: {extent.xmin.toFixed(1)} … {extent.xmax.toFixed(1)}
              <br />
              Y: {extent.ymin.toFixed(1)} … {extent.ymax.toFixed(1)}
            </p>
          </div>
        )}

        {layer.fields && layer.fields.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Поля ({layer.fields.length})
            </h4>
            <div className="mt-1 max-h-48 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-2 py-1 font-medium">Поле</th>
                    <th className="px-2 py-1 font-medium">Алиас</th>
                    <th className="px-2 py-1 font-medium">Тип</th>
                  </tr>
                </thead>
                <tbody>
                  {layer.fields.map((field) => (
                    <tr key={field.name} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-2 py-1">{field.name}</td>
                      <td className="px-2 py-1">{field.alias ?? '—'}</td>
                      <td className="px-2 py-1">{field.type ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={closeInfo}
          className="mt-4 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}
