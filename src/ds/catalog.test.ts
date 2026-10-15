import { readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { CATALOG } from "./catalog"
import { DEMOS } from "./demos"

const root = join(import.meta.dirname, "..")
const files = (dir: string): string[] => {
  try {
    return readdirSync(join(root, dir)).filter((f) => f.endsWith(".tsx")).map((f) => f.replace(/\.tsx$/, ""))
  } catch {
    return [] // the folder does not exist yet: nothing to document
  }
}

describe("component registry coverage", () => {
  it("documents every file under components/ui", () => {
    const ids = new Set(CATALOG.map((c) => c.id))
    const missing = files("components/ui").filter((f) => !ids.has(f))
    expect(missing, `components/ui files with no catalog entry: ${missing.join(", ")}`).toEqual([])
  })

  it("documents every shared feature component", () => {
    const ids = new Set(CATALOG.map((c) => c.id))
    const missing = files("components/shared").filter((f) => !ids.has(f))
    expect(missing, `components/shared files with no catalog entry: ${missing.join(", ")}`).toEqual([])
  })

  it("gives every entry usage guidance and a demo", () => {
    for (const c of CATALOG) {
      expect(c.summary, c.id).not.toBe("")
      expect(c.behavior.length, `${c.id} behavior`).toBeGreaterThan(0)
      expect(c.whenToUse.length, `${c.id} whenToUse`).toBeGreaterThan(0)
      expect(c.whenNotToUse.length, `${c.id} whenNotToUse`).toBeGreaterThan(0)
      expect(DEMOS[c.id], `${c.id} demo`).toBeTypeOf("function")
    }
  })

  it("has unique ids", () => {
    const ids = CATALOG.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
