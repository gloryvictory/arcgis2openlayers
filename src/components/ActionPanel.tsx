import { Info, Minus, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useArcgisStore } from '../stores/arcgisStore'
import { cn } from '../lib/utils'

export default function ActionPanel() {
  const selectedService = useArcgisStore((s) => s.selectedService)
  const selectedLayerId = useArcgisStore((s) => s.selectedLayerId)
  const activeLayers = useArcgisStore((s) => s.activeLayers)
  const addActiveLayer = useArcgisStore((s) => s.addActiveLayer)
  const removeActiveLayer = useArcgisStore((s) => s.removeActiveLayer)
  const clearActiveLayers = useArcgisStore((s) => s.clearActiveLayers)
  const openInfo = useArcgisStore((s) => s.openInfo)

  const activeId =
    selectedService && selectedLayerId != null
      ? `${selectedService.path}:${selectedLayerId}`
      : null
  const isActive = activeId != null && activeLayers.some((al) => al.id === activeId)

  const handleAdd = () => {
    if (selectedLayerId == null) {
      toast.error('Сначала выберите слой')
      return
    }
    addActiveLayer(selectedLayerId)
    toast.success('Слой добавлен на карту')
  }

  const handleRemove = () => {
    if (!activeId) {
      toast.error('Выберите активный слой')
      return
    }
    removeActiveLayer(activeId)
    toast.success('Слой удалён с карты')
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Действия
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={selectedLayerId == null || isActive}
          className={cn(
            'flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50',
          )}
        >
          <Plus className="h-4 w-4" /> Добавить
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={!isActive}
          className={cn(
            'flex items-center justify-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50',
          )}
        >
          <Minus className="h-4 w-4" /> Удалить
        </button>
      </div>
      <button
        type="button"
        onClick={() => selectedLayerId != null && openInfo(selectedLayerId)}
        disabled={selectedLayerId == null}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Info className="h-4 w-4" /> Информация о слое
      </button>
      <button
        type="button"
        onClick={clearActiveLayers}
        disabled={activeLayers.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Trash2 className="h-4 w-4" /> Очистить карту
      </button>
    </div>
  )
}
