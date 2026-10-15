import { open } from './lib.mjs'
import fs from 'node:fs'
const axeSrc = fs.readFileSync('./node_modules/axe-core/axe.min.js', 'utf8')
const base = 'http://127.0.0.1:5199/accounts/renewals'
const axe = async (page, label) => {
  await page.addScriptTag({ content: axeSrc }).catch(() => {})
  const v = await page.evaluate(async () => (await window.axe.run(document)).violations.map(x => ({ id: x.id, impact: x.impact, n: x.nodes.length, msg: (x.nodes[0].any[0] || x.nodes[0].all[0] || {}).message?.slice(0, 110), html: x.nodes[0].html.slice(0, 80) })))
  console.log(label.padEnd(44), v.length ? JSON.stringify(v) : 'clean')
}
for (const [w, h, dark] of [[1280, 900, false], [1280, 900, true], [390, 844, false], [390, 844, true]]) {
  const { browser, page, errors } = await open({ viewport: { width: w, height: h } })
  await page.addInitScript((d) => localStorage.setItem('clientops-appearance', d ? 'dark' : 'light'), dark)
  const tag = `${w}${dark ? 'd' : 'l'}`
  for (const st of ['', '?state=empty', '?state=error', '?state=loading']) { await page.goto(base + st); await page.waitForTimeout(1500); await axe(page, `${tag} ${st || 'list'}`) }
  await page.goto(base); await page.waitForSelector('text=ARR renewing'); await page.waitForTimeout(500)
  const mobile = w < 500
  await page.getByRole('button', { name: /Brightwell/ }).first().click(); await page.waitForTimeout(600)
  await axe(page, `${tag} account open${mobile ? ' (sheet)' : ''}`)
  const scope = mobile ? page.getByRole('dialog') : page.getByRole('region', { name: 'Renewal plan' })
  await scope.getByRole('button', { name: /Choose an outcome/ }).click(); await page.getByRole('menuitemradio', { name: 'At risk' }).click(); await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await scope.getByRole('button', { name: /Save/ }).last().click(); await page.waitForTimeout(700)
  await axe(page, `${tag} form with validation errors`)
  await scope.getByRole('textbox').first().fill('Executive call'); await scope.locator('input[type=date]').fill('2026-10-25')
  await scope.getByRole('button', { name: /Save/ }).last().click(); await page.waitForSelector('text=Plan recorded for Brightwell', { timeout: 5000 }); await page.waitForTimeout(700)
  await axe(page, `${tag} after save (notice shown)`)
  if (errors.filter(e => !/403/.test(e)).length) console.log('console errors', errors)
  await browser.close()
}
