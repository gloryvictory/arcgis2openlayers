import { useState, type FormEvent } from 'react'
import { Loader2, Plug } from 'lucide-react'
import toast from 'react-hot-toast'
import { useArcgisStore } from '../stores/arcgisStore'
import { cn } from '../lib/utils'

export default function ArcgisConfig() {
  const serverUrl = useArcgisStore((s) => s.serverUrl)
  const token = useArcgisStore((s) => s.token)
  const isLoadingCatalog = useArcgisStore((s) => s.isLoadingCatalog)
  const setServerUrl = useArcgisStore((s) => s.setServerUrl)
  const setToken = useArcgisStore((s) => s.setToken)
  const loadCatalog = useArcgisStore((s) => s.loadCatalog)
  const [showToken, setShowToken] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!serverUrl.trim()) {
      toast.error('Введите URL ArcGIS Server')
      return
    }
    try {
      await loadCatalog()
      const count = useArcgisStore.getState().services.length
      if (count === 0) {
        toast.error('Сервисы карт (Map/Feature/Image) не найдены на сервере')
      } else {
        toast.success(`Каталог сервисов загружен: ${count} сервис(ов)`)
      }
    } catch {
      toast.error('Не удалось подключиться к ArcGIS Server')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Подключение к ArcGIS Server
      </h2>
      <input
        type="text"
        value={serverUrl}
        onChange={(e) => setServerUrl(e.target.value)}
        placeholder="https://host/arcgis/rest/services"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
      />
      <button
        type="button"
        onClick={() => setShowToken((v) => !v)}
        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
      >
        {showToken ? 'Скрыть токен' : 'Указать токен (опционально)'}
      </button>
      {showToken && (
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Токен доступа"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
        />
      )}
      <button
        type="submit"
        disabled={isLoadingCatalog}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50',
        )}
      >
        {isLoadingCatalog ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plug className="h-4 w-4" />
        )}
        {isLoadingCatalog ? 'Загрузка…' : 'Подключиться'}
      </button>
    </form>
  )
}
