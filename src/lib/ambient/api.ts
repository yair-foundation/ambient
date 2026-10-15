// lib/ambient/api.ts — every request the assistant makes goes through here.
import { createAmbientApi } from "@/components/ambient/responder"

import { stubs } from "./stubs"

// STUBS until the backend exists. Set VITE_AMBIENT_STUBS=false to send every
// request to the server instead.
const USE_STUBS = import.meta.env.VITE_AMBIENT_STUBS !== "false"

const post =
  (path: string) =>
  async (body: unknown, { signal }: { signal: AbortSignal }) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    })
    if (!res.ok) throw new Error(`The assistant request failed (${res.status}).`)
    return res.json()
  }

export const ambientApi = createAmbientApi(
  USE_STUBS
    ? stubs
    : { ask: post("/ambient/ask"), suggestions: post("/ambient/suggestions") }
)
