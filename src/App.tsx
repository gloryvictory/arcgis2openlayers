import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Settings } from 'lucide-react'
import ArcgisConfig from './components/ArcgisConfig'
import SectionSelector from './components/SectionSelector'
import ActionPanel from './components/ActionPanel'
import StatusBar from './components/StatusBar'
import MapView from './components/MapView'
import BottomPanel from './components/BottomPanel'
import InfoDialog from './components/InfoDialog'
import BasemapSelector from './components/BasemapSelector'
import SettingsModal from './components/SettingsModal'
import { useThemeStore } from './stores/themeStore'

export default function App() {
  const theme = useThemeStore((s) => s.theme)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-sm font-semibold">arcgis2openlayers</h1>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Настройки"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto border-r border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <ArcgisConfig />
          <SectionSelector />
          <ActionPanel />
          <StatusBar />
        </aside>

        <main className="relative min-w-0 flex-1 overflow-hidden">
          <MapView />
          <BasemapSelector />
        </main>
      </div>

      <BottomPanel />
      <InfoDialog />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toaster position="top-right" />
    </div>
  )
}
