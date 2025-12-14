// src/toron/renderers/multimodal_renderer.ts

export type RenderFormat =
  | "text"
  | "markdown"
  | "code"
  | "json"
  | "table"

export type RenderPayload = {
  content: string
  format?: RenderFormat
  language?: string
}

export function renderContent(payload: RenderPayload): string {
  const { content, format, language } = payload

  switch (format) {
    case "code":
      return `\`\`\`${language ?? ""}\n${content}\n\`\`\``

    case "json":
      try {
        const parsed = JSON.parse(content)
        return `\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\``
      } catch {
        return content
      }

    case "markdown":
    case "table":
    case "text":
    default:
      return content
  }
}
