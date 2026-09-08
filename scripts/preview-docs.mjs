import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_PATH = '/ask-the-right-questions'
const DOCS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'docs')
const PORT = Number(process.env.PORT ?? 4173)

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function sendFile(filePath, response) {
  response.statusCode = 200
  response.setHeader('Content-Type', MIME_TYPES[extname(filePath)] ?? 'application/octet-stream')
  createReadStream(filePath).pipe(response)
}

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname)

  if (pathname === '/') {
    response.statusCode = 302
    response.setHeader('Location', `${BASE_PATH}/`)
    response.end()
    return
  }

  if (pathname !== BASE_PATH && !pathname.startsWith(`${BASE_PATH}/`)) {
    response.statusCode = 404
    response.end('Not found')
    return
  }

  const relativePath = pathname.slice(BASE_PATH.length).replace(/^\/+/, '') || 'index.html'
  const requestedPath = resolve(DOCS_ROOT, relativePath)
  if (requestedPath !== DOCS_ROOT && !requestedPath.startsWith(`${DOCS_ROOT}${sep}`)) {
    response.statusCode = 403
    response.end('Forbidden')
    return
  }

  try {
    const fileStat = await stat(requestedPath)
    if (!fileStat.isFile()) throw new Error('Not a file')
    sendFile(requestedPath, response)
  } catch {
    // HashRouter 的路由不会到达服务器；缺失资产必须真实返回 404，不能回退成 HTML。
    response.statusCode = 404
    response.end('Not found')
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Production preview: http://127.0.0.1:${PORT}${BASE_PATH}/`)
})
