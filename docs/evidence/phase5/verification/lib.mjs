import { chromium } from 'playwright-core'
import fs from 'node:fs'
const candidates = ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium-1194/chrome-linux64/chrome']
export const exe = candidates.find((p) => { try { return fs.statSync(p).isFile() } catch { return false } })
export async function open(opts = {}) {
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] })
  const ctx = await browser.newContext({ viewport: opts.viewport ?? { width: 1280, height: 800 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  return { browser, ctx, page, errors }
}
