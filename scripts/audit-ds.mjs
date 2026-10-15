#!/usr/bin/env node
/**
 * audit:ds is the MECHANICAL part of the ds-manager compliance audit (.claude/skills/ds-manager/SKILL.md).
 * It checks what a script can know: tokens, icons, motion, hand-rolled dialogs, assistant page stubs.
 * Judgement (promote / keep local / reject, near-miss components, copy, UX) stays with the three skills.
 *
 * node scripts/audit-ds.mjs [--root <dir>]   exit 1 on any error; warnings never fail
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const root = process.argv.includes("--root") ? process.argv[process.argv.indexOf("--root") + 1] : process.cwd()
const SRC = join(root, "src")

// Vendored / generated: the system itself, not product code. Product code is everything else under src/.
const EXEMPT = [
  /^src\/components\/ui\//, /^src\/components\/ambient\//, /^src\/components\/foundation-/, /^src\/lib\/foundation\//,
  /^src\/lib\/icon-library\.ts$/, /^src\/styles\//, /^src\/index\.css$/, /^src\/hooks\//, /\.test\.tsx?$/, /^src\/test-setup\.ts$/,
]

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}
const files = walk(SRC)
  .map((p) => ({ p, rel: relative(root, p).replaceAll("\\", "/") }))
  .filter((f) => /\.(tsx?|css)$/.test(f.rel) && !EXEMPT.some((r) => r.test(f.rel)))

const errors = []
const warnings = []
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:"'`])\/\/.*$/gm, "$1")

const RULES = [
  ["tokens: colour literal (use a semantic role)", /(?<![\w&/])#[0-9a-fA-F]{3,8}\b(?![-\w])|\b(?:rgba?|hsla?|oklch|oklab)\(/g],
  ["tokens: arbitrary value (use a scale step)", /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|gap|space-[xy]|text|rounded|top|left|right|bottom|size|min-w|max-w|min-h|max-h|bg|border|shadow|leading|tracking)-\[[^\]]+\]/g],
  ["tokens: inline style attribute", /\bstyle=\{\{/g],
  ["icons: direct icon-library import (use <Icon name>)", /from\s+["'](?:lucide-react|@tabler\/[^"']+|@hugeicons\/[^"']+|@phosphor-icons\/[^"']+|@remixicon\/[^"']+)["']/g],
  ["motion: literal timing, keyframes or animation library (use a motion role)", /\bduration-(?:\d|\[)|\bease-\[|\banimate-\[|@keyframes|from\s+["'](?:framer-motion|motion|gsap|react-spring)["']/g],
  ["components: hand-rolled dialog (use Sheet)", /role=["'](?:dialog|alertdialog)["']/g],
]
const NEAR_MISS = /<(button|input|select|textarea)\b/g // warn only: a human decides whether it re-implements a vocabulary component

for (const { p, rel } of files) {
  const text = stripComments(readFileSync(p, "utf8"))
  const lines = text.split("\n")
  for (const [name, re] of RULES) {
    lines.forEach((line, i) => {
      re.lastIndex = 0
      if (re.test(line)) errors.push(`${rel}:${i + 1}  ${name}\n    ${line.trim().slice(0, 140)}`)
    })
  }
  if (/\.tsx$/.test(rel)) {
    lines.forEach((line, i) => {
      NEAR_MISS.lastIndex = 0
      if (NEAR_MISS.test(line)) warnings.push(`${rel}:${i + 1}  raw <${line.match(/<(button|input|select|textarea)\b/)[1]}>: confirm it does not re-implement a vocabulary component\n    ${line.trim().slice(0, 120)}`)
    })
  }
}

// assistant page stubs: every page in nav.ts must have answers keyed by its id (page checklist in CLAUDE.md)
try {
  const nav = readFileSync(join(SRC, "nav.ts"), "utf8")
  const stubs = readFileSync(join(SRC, "lib/ambient/stubs/index.ts"), "utf8")
  const ids = [...nav.matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1])
  const pagesDecl = stubs.match(/const PAGES\s*=\s*\{([^}]*)\}/)?.[1] ?? ""
  const keys = pagesDecl.split(",").map((k) => k.trim().replace(/^"|"$/g, "").split(":")[0].replace(/^"|"$/g, "").trim()).filter(Boolean)
  for (const id of ids) if (!keys.includes(id)) errors.push(`src/nav.ts  page "${id}" has no assistant stubs in src/lib/ambient/stubs/index.ts (PAGES)`)
  if (!/setPageChip/.test(readFileSync(join(SRC, "App.tsx"), "utf8"))) errors.push("src/App.tsx  pages are not announced to the assistant (setPageChip)")
} catch (e) {
  errors.push(`assistant page check could not run: ${e.message}`)
}

const rules = RULES.length + 2
console.log(`audit:ds: ${files.length} product files, ${rules} rules`)
if (warnings.length) console.log(`\n${warnings.length} warning(s) to review (not failures):\n` + warnings.map((w) => "  ! " + w).join("\n"))
if (errors.length) {
  console.log(`\n${errors.length} error(s):\n` + errors.map((e) => "  x " + e).join("\n"))
  process.exit(1)
}
console.log("\naudit:ds passed")
