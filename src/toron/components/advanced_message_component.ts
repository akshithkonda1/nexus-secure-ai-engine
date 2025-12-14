// src/toron/components/advanced_message_component.ts

export type AdvancedToronMessagePayload = {
  final_answer: string
  confidence_score?: number
  agreement_level?: number
  evidence_density?: number
  escalation_explanation?: string
  warnings?: string[]
}

export function renderAdvancedToronMessage(
  payload: AdvancedToronMessagePayload
): string {
  let output = payload.final_answer

  const metadata: string[] = []

  if (payload.confidence_score !== undefined) {
    metadata.push(`Confidence: ${payload.confidence_score}%`)
  }

  if (payload.agreement_level !== undefined) {
    metadata.push(`Agreement: ${payload.agreement_level}%`)
  }

  if (payload.evidence_density !== undefined) {
    metadata.push(`Evidence density: ${payload.evidence_density}`)
  }

  if (metadata.length > 0) {
    output += `\n\n—\n${metadata.join(" • ")}`
  }

  if (payload.warnings?.length) {
    output += `\n\n⚠️ ${payload.warnings.join(" ")}`
  }

  return output
}
