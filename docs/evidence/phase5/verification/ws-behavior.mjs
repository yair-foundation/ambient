import { open } from './lib.mjs'
const base = 'http://127.0.0.1:5199/accounts/renewals'
const results = []
const rec = (name, ok, detail) => { results.push({ name, ok }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : '')) }
const tiles = async (page) => {
  const t = (await page.locator('main').innerText()).replace(/\n+/g, ' | ')
  const num = (re) => (t.match(re) || [])[1]
  return { renewing: num(/ARR renewing \| (\$[\d,]+)/), atRisk: num(/ARR at risk \| (\$[\d,]+)/), withPlan: num(/With a plan \| (\d+)/), without: num(/Without a plan \| (\d+)/) }
}
const row = (page, name) => page.getByRole('button', { name: new RegExp(name) }).first()
const plan = (page) => page.getByRole('region', { name: 'Renewal plan' })
const choose = async (page, label) => { await plan(page).getByRole('button', { name: /Choose an outcome|Renew|At risk|Expected to churn/ }).first().click(); await page.getByRole('menuitemradio', { name: label }).click(); await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
const save = (page) => plan(page).getByRole('button', { name: /Save plan|Save revision|Save/ }).last().click()

{ // ---- desktop rules + summary + undo + revise
  const { browser, page, errors } = await open({ viewport: { width: 1280, height: 900 } })
  await page.goto(base); await page.waitForSelector('text=ARR renewing'); await page.waitForTimeout(500)
  let t = await tiles(page)
  rec('14 accounts shown, summary matches data', (await page.getByRole('button', { name: /Renews in/ }).count()) === 14 && t.renewing === '$2,115,000' && t.atRisk === '$421,000' && t.withPlan === '0', JSON.stringify(t))

  // P1 rule: Brightwell has an open priority-one escalation
  await row(page, 'Brightwell').click(); await page.waitForTimeout(300)
  await choose(page, 'Renew as is'); await save(page); await page.waitForTimeout(700)
  t = await tiles(page)
  const txt1 = await plan(page).innerText()
  rec('P1 rule: "renew as is" blocked without acknowledging the escalation', t.withPlan === '0' && /acknowledge/i.test(txt1), 'plans=' + t.withPlan)
  await plan(page).getByRole('checkbox').click(); await save(page); await page.waitForSelector('text=Plan recorded for Brightwell Logistics', { timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(500); t = await tiles(page)
  rec('P1 rule: allowed once acknowledged; summary updates', t.withPlan === '1' && t.without === '13', JSON.stringify(t))
  // expected at-risk after Brightwell planned as "renew as is": 421k - 184k = 237k
  rec('ARR at risk drops when a high-risk account is planned as renew-as-is ($421k -> $237k)', t.atRisk === '$237,000', t.atRisk)

  // follow-up rule: at risk needs next step and date
  await row(page, 'Harborline').click(); await page.waitForTimeout(300)
  await choose(page, 'At risk'); await save(page); await page.waitForTimeout(600)
  t = await tiles(page)
  rec('Follow-up rule: "at risk" without next step and date is rejected', t.withPlan === '1', 'plans=' + t.withPlan + ' | ' + (await plan(page).innerText()).replace(/\n+/g, ' ').match(/(next step[^.|]*required[^.|]*|Name a next step[^.|]*|Enter[^.|]*)/i)?.[0])
  await plan(page).getByRole('textbox').first().fill('Executive call with the clinic group')
  await plan(page).locator('input[type=date]').fill('2026-10-30')
  await save(page); await page.waitForSelector('text=Plan recorded for Harborline Health', { timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(500); t = await tiles(page)
  // expected: 237k + 242k (Harborline now planned at risk) = 479k; plans 2
  rec('Summary stays accurate after a second plan (ARR at risk $479k, 2 plans)', t.withPlan === '2' && t.atRisk === '$479,000', JSON.stringify(t))
  const banner = (await page.locator('[role=status]').filter({ hasText: 'Plan recorded' }).innerText()).replace(/\n+/g, ' | ')
  rec('Shared notice shows what changed + live consequence + Undo', /Harborline Health/.test(banner) && /2 of 14 accounts have a plan/.test(banner) && /Undo/.test(banner), banner)

  // Undo restores plan AND summary
  await page.getByRole('button', { name: 'Undo', exact: true }).click(); await page.waitForTimeout(900)
  t = await tiles(page)
  rec('Undo genuinely restores the prior state (1 plan, $237k at risk), notice removed', t.withPlan === '1' && t.atRisk === '$237,000' && (await page.getByText('Plan recorded for Harborline').count()) === 0, JSON.stringify(t))
  await row(page, 'Harborline').click(); await page.waitForTimeout(300)
  rec('Undone account is plannable again (form is the empty "Record" form)', /Record a renewal plan/.test(await plan(page).innerText()))

  // revise + undo the revision
  await row(page, 'Brightwell').click(); await page.waitForTimeout(300)
  rec('A recorded plan opens as "Revise"', /Revise the renewal plan/.test(await plan(page).innerText()))
  await choose(page, 'Renew with expansion'); await save(page); await page.waitForSelector('text=Plan revised for Brightwell Logistics', { timeout: 5000 }).catch(() => {})
  rec('Revision saved with a "Plan revised" notice', (await page.getByText('Plan revised for Brightwell Logistics').count()) > 0)
  await page.getByRole('button', { name: 'Undo', exact: true }).click(); await page.waitForTimeout(900)
  await row(page, 'Brightwell').click(); await page.waitForTimeout(300)
  rec('Undo of a revision restores the earlier outcome (renew as is)', /Renew as is/.test(await plan(page).innerText()))
  rec('no console errors (desktop)', errors.filter(e => !/403/.test(e)).length === 0, JSON.stringify(errors.slice(0, 2)))
  await browser.close()
}
{ // ---- failed save keeps the form
  const { browser, page } = await open({ viewport: { width: 1280, height: 900 } })
  await page.goto(base + '?fail=save'); await page.waitForSelector('text=ARR renewing'); await page.waitForTimeout(400)
  await row(page, 'Sable').click(); await page.waitForTimeout(300)
  await choose(page, 'Renew as is'); await save(page); await page.waitForTimeout(900)
  const kept = /Renew as is/.test(await plan(page).innerText()); const err = /wasn't saved|try again/i.test(await page.locator('main').innerText())
  rec('Failed save: says so, keeps the form and chosen outcome, records nothing', kept && err && (await tiles(page)).withPlan === '0')
  await save(page); await page.waitForSelector('text=Plan recorded for Sable', { timeout: 5000 }).catch(() => {})
  rec('Retry after a failed save succeeds', (await tiles(page)).withPlan === '1')
  await browser.close()
}
for (const st of ['loading', 'empty', 'error']) { // ---- states
  const { browser, page } = await open({ viewport: { width: 1000, height: 700 } })
  await page.goto(`${base}?state=${st}`); await page.waitForTimeout(1500)
  const body = await page.locator('main').innerText()
  const ok = st === 'loading' ? /Loading/i.test(body) && !/Brightwell/.test(body) : st === 'empty' ? /no (accounts|renewals)|nothing|No accounts/i.test(body) && !/Brightwell/.test(body) : /Couldn't load/.test(body) && (await page.getByRole('button', { name: 'Retry' }).count()) === 1
  rec(`State: ${st}`, ok, body.replace(/\n+/g, ' | ').slice(0, 110))
  if (st === 'error') { await page.getByRole('button', { name: 'Retry' }).click(); await page.waitForTimeout(1200); rec('State: error recovers on Retry', /Brightwell/.test(await page.locator('main').innerText())) }
  await browser.close()
}
{ // ---- mobile
  const { browser, page, errors } = await open({ viewport: { width: 390, height: 844 } })
  await page.goto(base); await page.waitForSelector('text=ARR renewing'); await page.waitForTimeout(500)
  rec('Mobile: no horizontal overflow', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)))
  await row(page, 'Sable').click(); await page.waitForSelector('[role=dialog]'); await page.waitForTimeout(500)
  rec('Mobile: account opens in a sheet', (await page.getByRole('dialog').count()) === 1)
  await page.getByRole('dialog').getByRole('button', { name: /Choose an outcome/ }).click(); await page.getByRole('menuitemradio', { name: 'Renew as is' }).click(); await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await page.getByRole('dialog').getByRole('button', { name: /Save/ }).last().click(); await page.waitForSelector('text=Plan recorded for Sable', { timeout: 5000 }).catch(() => {}); await page.waitForTimeout(700)
  rec('Mobile: after saving, sheet closes and the notice with Undo is visible', (await page.getByRole('dialog').count()) === 0 && (await page.getByRole('button', { name: 'Undo', exact: true }).isVisible()))
  rec('Mobile: no horizontal overflow after save', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)))
  await browser.close()
}
console.log(`\n${results.filter(r => r.ok).length}/${results.length} checks passed`)
