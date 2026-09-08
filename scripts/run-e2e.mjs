import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const previewUrl = 'http://127.0.0.1:4173/ask-the-right-questions/'
const preview = spawn(process.execPath, ['scripts/preview-docs.mjs'], {
  cwd: process.cwd(),
  stdio: 'inherit',
})

async function waitForPreview() {
  const deadline = Date.now() + 120_000
  while (Date.now() < deadline) {
    if (preview.exitCode !== null) throw new Error(`Production preview exited with ${preview.exitCode}`)
    try {
      const response = await fetch(previewUrl)
      if (response.ok) return
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 200))
  }
  throw new Error(`Timed out waiting for ${previewUrl}`)
}

async function stopPreview() {
  if (preview.exitCode !== null) return
  preview.kill()
  const forced = setTimeout(() => preview.kill('SIGKILL'), 3_000)
  await new Promise((resolveClose) => preview.once('close', resolveClose))
  clearTimeout(forced)
}

let exitCode = 1
try {
  await waitForPreview()
  const playwrightCli = resolve('node_modules', '@playwright', 'test', 'cli.js')
  const runner = spawn(process.execPath, [playwrightCli, 'test'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  })
  exitCode = await new Promise((resolveExit, rejectExit) => {
    runner.once('error', rejectExit)
    runner.once('close', (code) => resolveExit(code ?? 1))
  })
} finally {
  await stopPreview()
}

process.exitCode = exitCode
