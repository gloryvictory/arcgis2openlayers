import { Moon, Sun, X } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'
import { useArcgisStore } from '../stores/arcgisStore'
import { cn } from '../lib/utils'
import type { BasemapId } from '../types/arcgis'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const BASEMAPS: { id: BasemapId; label: string }[] = [
  { id: 'osm', label: 'OpenStreetMap' },
  { id: 'esri-imagery', label: 'Esri World Imagery' },
]

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const basemap = useArcgisStore((s) => s.basemap)
  const setBasemap = useArcgisStore((s) => s.setBasemap)
  const token = useArcgisStore((s) => s.token)
  const setToken = useArcgisStore((s) => s.setToken)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Настройки</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Тема</h4>
            <button
              type="button"
              onClick={toggleTheme}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Переключить на светлую' : 'Переключить на тёмную'}
            </button>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Базовая карта
            </h4>
            <div className="mt-2 space-y-1">
              {BASEMAPS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBasemap(item.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm',
                    basemap === item.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
                  )}
                >
                  {item.label}
                  {basemap === item.id && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Токен доступа (для будущих защищённых сервисов)
            </h4>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Токен"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Готово
        </button>
      </div>
    </div>
  )
}
