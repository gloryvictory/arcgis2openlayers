# arcgis2openlayers

Картографическое веб-приложение на **React 18 + TypeScript**, которое подключается к ArcGIS Server, получает список сервисов и слоёв и подключает выбранные слои на карту **OpenLayers**.

## Возможности

- Подключение к любому ArcGIS Server через нативный REST API (`?f=pjson`).
- Обход вложенных папок каталога сервисов.
- Выбор сервиса (MapServer / FeatureServer / ImageServer) и его слоёв.
- Сопоставление типов сервисов со слоями OpenLayers:
  - `MapServer` без кеша → `ImageLayer` + `ImageArcGISRest`
  - `MapServer` с `singleFusedMapCache: true` → `TileLayer` + `XYZ`
  - `FeatureServer` → `VectorLayer` + `VectorSource` (GeoJSON из `/query?f=geojson`)
  - `ImageServer` → `ImageLayer` + `ImageArcGISRest`
- Базовые карты: OpenStreetMap и Esri World Imagery.
- Светлая/тёмная тема с сохранением в `localStorage`.
- Диалог информации о слое (описание, поля, extent).
- Задел под токен доступа для будущих защищённых сервисов.

## Технологический стек

| Технология | Версия | Назначение |
|------------|--------|------------|
| React | 18.2.0 | UI фреймворк |
| TypeScript | 5.0.2 | Типобезопасная разработка |
| Vite | 4.4.5 | Сборщик и сервер разработки |
| TailwindCSS | 3.3.5 | Utility-first CSS фреймворк |
| Zustand | 4.4.0 | Управление состоянием |
| OpenLayers | ^10 | Библиотека для карт |
| lucide-react | 0.263.1 | Библиотека иконок |
| react-hot-toast | 2.6.0 | Всплывающие уведомления |
| clsx | 2.0.0 | Условное объединение имён классов |
| tailwind-merge | 1.14.0 | Объединение Tailwind-классов |

## Структура проекта

```
arcgis2openlayers/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── lib/
    │   └── utils.ts
    ├── types/
    │   └── arcgis.ts
    ├── stores/
    │   ├── arcgisStore.ts
    │   └── themeStore.ts
    ├── services/
    │   └── arcgisApi.ts
    ├── hooks/
    │   └── useMap.ts
    └── components/
        ├── ArcgisConfig.tsx
        ├── MapView.tsx
        ├── SectionSelector.tsx
        ├── ActionPanel.tsx
        ├── StatusBar.tsx
        ├── InfoDialog.tsx
        ├── BottomPanel.tsx
        ├── BasemapSelector.tsx
        └── SettingsModal.tsx
```

## Команды разработки

```bash
npm install          # Установка зависимостей
npm run dev          # Запуск сервера разработки (http://localhost:5173)
npm run build        # Сборка для продакшена
npm run preview      # Предпросмотр продакшен-сборки
```

## Использование

1. Введите URL ArcGIS Server (например, `http://host` или `https://host/arcgis/rest/services`) в поле «Подключение к ArcGIS Server».
2. Нажмите «Подключиться» — приложение загрузит каталог сервисов.
3. Выберите сервис, затем слой.
4. Нажмите «Добавить», чтобы отобразить слой на карте.
5. Для удаления используйте «Удалить» или «Очистить карту».

## Примечания

- Если ArcGIS Server не разрешает CORS-запросы, потребуется прокси или настройка CORS на сервере. Ошибки выводятся в нижней панели и через всплывающие уведомления.
- Поле токена заложено в интерфейсе заранее, но не используется, пока не будет добавлена поддержка защищённых сервисов.
