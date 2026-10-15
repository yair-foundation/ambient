import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())

// jsdom lacks these; the app reads them for responsive layout and menus.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }) as MediaQueryList
}
class RO { observe() {} unobserve() {} disconnect() {} }
if (!('ResizeObserver' in window)) (window as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO
