import { AlertCircle, Info, X } from 'lucide-react'
import { useArcgisStore } from '../stores/arcgisStore'

export default function BottomPanel() {
  const error = useArcgisStore((s) => s.error)
  const message = useArcgisStore((s) => s.message)
  const clearError = useArcgisStore((s) => s.clearError)
  const clearMessage = useArcgisStore((s) => s.clearMessage)

  if (!error && !message) return null

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
      {error && (
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="rounded p-0.5 hover:bg-rose-50 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {message && (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Info className="h-4 w-4 shrink-0" />
          <span className="flex-1">{message}</span>
          <button
            type="button"
            onClick={clearMessage}
            className="rounded p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
