export * from "./ambient-runtime"
export * from "./assistant"
export * from "./assistant-context"
export * from "./messages"
export * from "./orb"
export * from "./orb-character"
export * from "./composer"
export * from "./attach-menu"
export * from "./use-attach-menu"
export * from "./ambient-marks"
export * from "./staging"
export * from "./streaming-text"

// The response seam: the kits an answer is composed from, and the queue that
// decides the order it arrives in.
export * from "./response-kit"
export * from "./message-kit"
export * from "./tool-kit"
export * from "./knowledge-kit"
export * from "./kit-vocabulary"
export * from "./responder"
export * from "./responder-schemas"
export * from "./stub-audit"
export * from "./stage-queue"
export * from "./use-staged-reveal"

// The host's own components, inside the layer.
export * from "./tool-host"

// NOT HERE: the chat-stack adapters (stack-ai-sdk, stack-assistant-ui,
// stack-ag-ui). A product has one stack, so each is its own import
// (`ambientui/stack-ai-sdk`) and its own registry door.
