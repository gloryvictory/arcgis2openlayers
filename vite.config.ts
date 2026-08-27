import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const ARCGIS_PROXY_PREFIX = '/_arcgis/'

function describeProxyError(err: any): string {
  if (err && typeof err === 'object') {
    const codes = Array.isArray(err.errors)
      ? err.errors.map((e: any) => e?.code || e?.message || String(e)).join(', ')
      : ''
    if (codes) return codes
    if (err.code) return `${err.code}: ${err.message || ''}`
  }
  return String(err)
}

/**
 * Dev-прокси для локального ArcGIS Server. Запросы идут same-origin через
 * dev-сервер Vite, поэтому к ним не применяются ограничения CORS и
 * referrer-policy браузера (например, strict-origin-when-cross-origin).
 *
 * Формат URL: /_arcgis/<encoded origin>/<rest path>[?query]
 * Пример: /_arcgis/http%3A%2F%2Flocalhost%3A6080/arcgis/rest/services?f=pjson
 *
 * Для HTTPS с самоподписанным сертификатом проверка TLS отключена
 * (rejectUnauthorized: false).
 */
function arcgisProxyPlugin(): Plugin {
  return {
    name: 'arcgis-proxy',
    configureServer(server) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const rawUrl: string = req.url || ''
        if (!rawUrl.startsWith(ARCGIS_PROXY_PREFIX)) {
          next()
          return
        }

        let target: string
        try {
          const questionIndex = rawUrl.indexOf('?')
          const pathPart = questionIndex === -1 ? rawUrl : rawUrl.slice(0, questionIndex)
          const queryPart = questionIndex === -1 ? '' : rawUrl.slice(questionIndex)

          const afterPrefix = pathPart.slice(ARCGIS_PROXY_PREFIX.length)
          const firstSlash = afterPrefix.indexOf('/')

          let origin: string
          let rest: string
          if (firstSlash === -1) {
            origin = decodeURIComponent(afterPrefix)
            rest = ''
          } else {
            origin = decodeURIComponent(afterPrefix.slice(0, firstSlash))
            rest = afterPrefix.slice(firstSlash)
          }

          target = origin + rest + queryPart
        } catch (err) {
          res.statusCode = 400
          res.setHeader('content-type', 'text/plain; charset=utf-8')
          res.end('ArcGIS proxy: bad target URL: ' + String(err))
          return
        }

        try {
          const nodeProcess = (globalThis as any).process
          const mod = target.startsWith('https:')
            ? nodeProcess.getBuiltinModule('https')
            : nodeProcess.getBuiltinModule('http')

          const upstreamReq = mod.request(
            target,
            {
              method: req.method || 'GET',
              headers: { accept: req.headers.accept || '*/*' },
              rejectUnauthorized: false,
            },
            (upstreamRes: any) => {
              res.statusCode = upstreamRes.statusCode || 502
              const headers = upstreamRes.headers || {}
              for (const key of Object.keys(headers)) {
                const value = headers[key]
                if (value == null) continue
                const lower = key.toLowerCase()
                if (
                  lower === 'content-encoding' ||
                  lower === 'content-length' ||
                  lower === 'transfer-encoding'
                ) {
                  continue
                }
                res.setHeader(key, value)
              }
              upstreamRes.pipe(res)
            },
          )

          upstreamReq.on('error', (err: any) => {
            res.statusCode = 502
            res.setHeader('content-type', 'text/plain; charset=utf-8')
            res.end('ArcGIS proxy error: ' + describeProxyError(err))
          })
          upstreamReq.end()
        } catch (err) {
          res.statusCode = 502
          res.setHeader('content-type', 'text/plain; charset=utf-8')
          res.end('ArcGIS proxy error: ' + describeProxyError(err))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), arcgisProxyPlugin()],
  server: {
    port: 5173,
  },
})
