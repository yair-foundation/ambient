import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"
import { FoundationAmbientBridge } from "@/components/foundation-ambient-bridge"
import { FoundationProvider } from "@/components/foundation-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./index.css"
import { applyStoredAppearance } from "@/lib/appearance"

applyStoredAppearance()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FoundationProvider>
      <FoundationAmbientBridge>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </FoundationAmbientBridge>
    </FoundationProvider>
  </StrictMode>
)
