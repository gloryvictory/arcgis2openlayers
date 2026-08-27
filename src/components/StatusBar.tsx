import { useArcgisStore } from '../stores/arcgisStore'

export default function StatusBar() {
  const layers = useArcgisStore((s) => s.layers)
  const activeLayers = useArcgisStore((s) => s.activeLayers)

  return (
    <div className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      Активных слоёв: {activeLayers.length} / всего в сервисе: {layers.length}
    </div>
  )
}
