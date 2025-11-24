import { buildAdaptivePlan } from "../engine/adaptiveResponseEngine";
import { classifyIntent } from "../engine/intentClassifier";
import { defaultPersona, evolvePersona } from "../engine/personaEngine";
import { initialState, updateState } from "../engine/stateMachine";
import { compileContext } from "./contextCompiler";
import { shapeContext } from "./contextShaper";
import { ToronContextWindow, deriveMeaningVector, summarizeInputSafely } from "./contextWindow";
import { ToronSanitizedTrace } from "./sanitizedTrace";
import {
  CompiledContext,
  ContextBundle,
  IntentClassification,
  PersonaProfile,
  ShapedContextMetadata,
  ToronState,
} from "./types";

export class ContextMediator {
  private readonly contextWindow = new ToronContextWindow();
  private readonly sanitizedTrace = new ToronSanitizedTrace();
  private persona: PersonaProfile = { ...defaultPersona };
  private state: ToronState = { ...initialState };
  private compiledContext: CompiledContext = {
    semanticContext: "",
    conversationPhase: "exploration",
    difficultyScore: 0,
    continuityScore: 0,
  };
  private shapedContext: ShapedContextMetadata = {
    llmHints: { reasoning: 0.5, creativity: 0.5, brevity: 0.5 },
    emotionalTemperature: 0.2,
    structuralStyle: "balanced",
    safetyBias: 0.5,
    metaConfidence: 0.5,
  };

  beginTurn(userInput: string): ContextBundle {
    const sanitizedInput = summarizeInputSafely(userInput);
    const intent = classifyIntent(sanitizedInput, this.sanitizedTrace.getSnapshot());

    const traceSnapshot = this.sanitizedTrace.updateTrace({
      intent: intent.intent,
      emotion: intent.emotion,
      topic: intent.intent,
    });

    this.contextWindow.addEntry({
      role: "user",
      intent: intent.intent,
      emotion: intent.emotion,
      meaningVector: deriveMeaningVector(sanitizedInput),
      summary: sanitizedInput,
      timestamp: Date.now(),
    });

    this.refreshContext(intent, traceSnapshot);
    return this.getContextMetadata();
  }

  updateAfterLLM(llmOutput: string): ContextBundle {
    const sanitizedOutput = summarizeInputSafely(llmOutput);
    const traceSnapshot = this.sanitizedTrace.updateTrace({
      topic: "assistant-response",
      llmAgreement: 0.8,
    });

    this.contextWindow.addEntry({
      role: "assistant",
      intent: "respond",
      emotion: "steady",
      meaningVector: deriveMeaningVector(sanitizedOutput),
      summary: sanitizedOutput,
      timestamp: Date.now(),
    });

    const syntheticIntent: IntentClassification = {
      intent: "respond",
      confidence: 0.6,
      emotion: "steady",
    };

    this.refreshContext(syntheticIntent, traceSnapshot);
    return this.getContextMetadata();
  }

  resetContext(): void {
    this.contextWindow.reset();
    this.sanitizedTrace.wipe();
    this.persona = { ...defaultPersona };
    this.state = { ...initialState };
    this.compiledContext = {
      semanticContext: "",
      conversationPhase: "exploration",
      difficultyScore: 0,
      continuityScore: 0,
    };
    this.shapedContext = {
      llmHints: { reasoning: 0.5, creativity: 0.5, brevity: 0.5 },
      emotionalTemperature: 0.2,
      structuralStyle: "balanced",
      safetyBias: 0.5,
      metaConfidence: 0.5,
    };
  }

  getContextMetadata(): ContextBundle {
    return {
      currentContext: this.compiledContext,
      metadataForVisualizer: {
        ...this.shapedContext,
        trace: this.sanitizedTrace.getSnapshot(),
        windowSize: this.contextWindow.getWindow().length,
        semanticDensity: this.contextWindow.getSemanticDensityScore(),
      },
      metadataForLLM: this.shapedContext,
      persona: this.persona,
      state: this.state,
    };
  }

  private refreshContext(
    intent: IntentClassification,
    traceSnapshot: ReturnType<ToronSanitizedTrace["getSnapshot"]>
  ): void {
    this.compiledContext = compileContext(
      this.contextWindow.getWindow(),
      this.persona,
      this.state,
      intent
    );

    this.shapedContext = shapeContext(this.compiledContext, traceSnapshot);
    this.persona = evolvePersona(this.persona, this.compiledContext, this.shapedContext);
    this.state = updateState(this.state, intent, this.compiledContext);

    buildAdaptivePlan(this.compiledContext, this.shapedContext, traceSnapshot);
  }
}
