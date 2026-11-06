import { defineConfig, loadEnv, type Plugin, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleAnalysisRequest } from './server/analysis.ts'

// Serves POST /api/analysis during `npm run dev` / `npm run preview` (Vercel uses api/analysis.ts)
const analysisApi = (): Plugin => {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (req.url !== '/api/analysis' || req.method !== 'POST') return next()
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', async () => {
      const { status, json } = await handleAnalysisRequest(body)
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(json))
    })
  }
  return {
    name: 'analysis-api',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ANTHROPIC_API_KEY from .env.local for the local API (not exposed to the browser: no VITE_ prefix)
  const env = loadEnv(mode, process.cwd(), '')
  if (env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
  return {
    plugins: [react(), tailwindcss(), analysisApi()],
  }
})
