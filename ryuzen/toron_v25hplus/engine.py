"""Deterministic building blocks for the Ryuzen Toron v2.5H+ CI suite."""

from __future__ import annotations

from collections import OrderedDict
from dataclasses import asdict, dataclass, field
from hashlib import sha256
from typing import Callable, Dict, Generic, Iterable, List, Mapping, MutableMapping, Sequence, Tuple, TypeVar, TypedDict, cast


class StructuredPSL(TypedDict):
    claims: Tuple["Premise", ...]
    token_count: int


class TierOneEntry(TypedDict):
    model: str
    claim: str
    label: str
    score: float


class TierTwoResult(TypedDict):
    accepted: bool
    contradictions: Tuple[str, ...]
    score: float


TierOneResults = Dict[str, Tuple[TierOneEntry, ...]]
SerializedPSL = TypedDict("SerializedPSL", {"claims": Tuple[Dict[str, str], ...], "token_count": int})
GraphSummary = TypedDict(
    "GraphSummary",
    {"nodes": Tuple[str, ...], "edges": Tuple[Tuple[str, str], ...], "connected": bool},
)
RealityPacket = TypedDict(
    "RealityPacket",
    {
        "version": str,
        "claims": List[Dict[str, str]],
        "graph": GraphSummary,
        "consensus_score": float,
        "adjudicated": bool,
    },
)
JudicialDecision = TypedDict(
    "JudicialDecision",
    {"verdict": str, "rationale": str, "precedents": Tuple[str, ...]},
)
Witness = TypedDict("Witness", {"name": str, "reliability": float})
SnapshotPayload = TypedDict(
    "SnapshotPayload",
    {
        "psl": SerializedPSL,
        "tier1": TierOneResults,
        "tier2": TierTwoResult,
        "reality_packet": RealityPacket,
        "judicial": JudicialDecision,
        "consensus_score": float,
        "execution_plan": Dict[str, object],
        "timestamp": int,
    },
)
T = TypeVar("T")


@dataclass(frozen=True)
class Premise:
    """A structured claim extracted from unstructured input."""

    text: str
    label: str


class DeterministicCache(Generic[T]):
    """A minimal cache to keep deterministic computations stable."""

    def __init__(self) -> None:
        self._store: Dict[str, T] = {}

    def get_or_create(self, key: str, factory: Callable[[], T]) -> T:
        if key not in self._store:
            self._store[key] = factory()
        return self._store[key]

    def __len__(self) -> int:  # pragma: no cover - trivial proxy
        return len(self._store)


class PremiseStructureLayer:
    """Break text into labeled premises in a deterministic way."""

    def __init__(self) -> None:
        self._cache: DeterministicCache[StructuredPSL] = DeterministicCache()

    def structure(self, passage: str) -> StructuredPSL:
        return self._cache.get_or_create(passage, lambda: self._build_structure(passage))

    def _build_structure(self, passage: str) -> StructuredPSL:
        claims = [chunk.strip() for chunk in passage.split(".") if chunk.strip()]
        labeled_claims: List[Premise] = []
        for claim in claims:
            lowered = claim.lower()
            if "never" in lowered:
                label = "false"
            elif "maybe" in lowered or "uncertain" in lowered:
                label = "uncertain"
            else:
                label = "true"
            labeled_claims.append(Premise(text=claim, label=label))
        return {"claims": tuple(labeled_claims), "token_count": len(passage.split())}


class ModelExecutionTier:
    """Tier 1 execution that deterministically scores each claim per model."""

    def __init__(self, models: Sequence[str] | None = None) -> None:
        self.models = tuple(models or ("synthetic-t1", "synthetic-t2"))

    def run(self, psl: StructuredPSL) -> TierOneResults:
        claims: Iterable[Premise] = psl["claims"]
        tier_results: TierOneResults = {}
        for model in self.models:
            per_model: List[TierOneEntry] = []
            for premise in claims:
                digest = sha256(f"{model}:{premise.text}".encode()).digest()
                confidence = 50 + (digest[0] % 45)
                per_model.append(
                    {
                        "model": model,
                        "claim": premise.text,
                        "label": premise.label,
                        "score": float(confidence),
                    }
                )
            tier_results[model] = tuple(per_model)
        return tier_results


class CausalDirectedGraph:
    """Minimal CDG that links claims in order to provide traceability."""

    def __init__(self, claims: Sequence[Premise]) -> None:
        self.nodes: Tuple[str, ...] = tuple(premise.text for premise in claims)
        self.edges: Tuple[Tuple[str, str], ...] = self._build_edges()

    def _build_edges(self) -> Tuple[Tuple[str, str], ...]:
        edges: List[Tuple[str, str]] = []
        for idx in range(len(self.nodes) - 1):
            edges.append((self.nodes[idx], self.nodes[idx + 1]))
        return tuple(edges)

    def summary(self) -> GraphSummary:
        return {"nodes": self.nodes, "edges": self.edges, "connected": bool(self.nodes)}


class TierTwoValidator:
    """Tier 2 logic that checks for contradictions across models."""

    def evaluate(self, tier1: TierOneResults) -> TierTwoResult:
        contradictions: List[str] = []
        for entries in tier1.values():
            for entry in entries:
                if entry["label"] == "true" and entry["claim"].lower().startswith("not "):
                    contradictions.append(entry["claim"])
        accepted = not contradictions
        score = max(0.0, 100.0 - (len(contradictions) * 12.5))
        return {"accepted": accepted, "contradictions": tuple(contradictions), "score": score}


class ReliableWitnessLocator:
    """Select the most reliable witness in a deterministic order."""

    def select(self, witnesses: Sequence[Witness]) -> Witness:
        if not witnesses:
            return {"name": "synthetic", "reliability": 1.0}
        ordered = sorted(witnesses, key=lambda item: (-float(item.get("reliability", 0.0)), str(item["name"])))
        return ordered[0]


class ConsensusComputer:
    """Combine model results with witness reliability to yield a consensus."""

    def score(self, tier1: TierOneResults, witness: Witness) -> float:
        scores: List[float] = []
        for entries in tier1.values():
            scores.extend(entry["score"] for entry in entries)
        average = sum(scores) / len(scores) if scores else 0.0
        weighted = average * float(witness.get("reliability", 1.0))
        return max(0.0, min(100.0, round(weighted, 2)))


class RealityPacketBuilder:
    """Build a synthetic but structured reality packet."""

    def build(
        self,
        psl: StructuredPSL,
        cdg: CausalDirectedGraph,
        tier2: TierTwoResult,
        consensus_score: float,
    ) -> RealityPacket:
        return {
            "version": "v2.5H+",
            "claims": [asdict(premise) for premise in psl["claims"]],
            "graph": cdg.summary(),
            "consensus_score": consensus_score,
            "adjudicated": bool(tier2.get("accepted")),
        }


class JudicialLogic:
    """Deterministic judicial review for the packet."""

    REQUIRED_KEYS = ("verdict", "rationale", "precedents")

    def deliberate(self, tier2: TierTwoResult, packet: RealityPacket) -> JudicialDecision:
        verdict = "accepted" if tier2.get("accepted") else "rejected"
        rationale = "No contradictions detected." if verdict == "accepted" else "Contradictions detected."
        precedents = tuple(packet.get("graph", {}).get("nodes", ()))[:2]
        return {"verdict": verdict, "rationale": rationale, "precedents": precedents}


@dataclass(frozen=True)
class ExecutionPlan:
    stages: Tuple[str, ...]
    version: str
    parameters: MutableMapping[str, object] = field(default_factory=dict)

    def describe(self) -> Dict[str, object]:
        return {"stages": self.stages, "version": self.version, "parameters": dict(self.parameters)}


@dataclass(frozen=True)
class StateSnapshot:
    psl: StructuredPSL
    tier1: TierOneResults
    tier2: TierTwoResult
    reality_packet: RealityPacket
    judicial: JudicialDecision
    consensus_score: float
    execution_plan: ExecutionPlan
    timestamp: int = 0

    def _serialise_psl(self) -> SerializedPSL:
        claims = tuple(asdict(premise) for premise in self.psl["claims"])
        return {"claims": claims, "token_count": self.psl["token_count"]}

    def to_ordered_dict(self) -> "OrderedDict[str, object]":
        ordered: "OrderedDict[str, object]" = OrderedDict()
        ordered["psl"] = self._serialise_psl()
        ordered["tier1"] = self.tier1
        ordered["tier2"] = self.tier2
        ordered["reality_packet"] = self.reality_packet
        ordered["judicial"] = self.judicial
        ordered["consensus_score"] = self.consensus_score
        ordered["execution_plan"] = self.execution_plan.describe()
        ordered["timestamp"] = self.timestamp
        return ordered

    def as_dict(self) -> SnapshotPayload:
        return cast(SnapshotPayload, dict(self.to_ordered_dict()))


class RyuzenEngine:
    """End-to-end deterministic execution orchestrator."""

    def __init__(self) -> None:
        self.psl = PremiseStructureLayer()
        self.tier1 = ModelExecutionTier()
        self.validator = TierTwoValidator()
        self.rwl = ReliableWitnessLocator()
        self.consensus = ConsensusComputer()
        self.packet_builder = RealityPacketBuilder()
        self.judicial = JudicialLogic()

    def execute(self, passage: str, witnesses: Sequence[Witness]) -> StateSnapshot:
        psl = self.psl.structure(passage)
        cdg = CausalDirectedGraph(psl["claims"])
        tier1 = self.tier1.run(psl)
        witness = self.rwl.select(witnesses)
        consensus_score = self.consensus.score(tier1, witness)
        tier2 = self.validator.evaluate(tier1)
        packet = self.packet_builder.build(psl, cdg, tier2, consensus_score)
        judicial = self.judicial.deliberate(tier2, packet)
        plan = ExecutionPlan(
            stages=("psl", "tier1", "tier2", "reality_packet", "judicial"),
            version="v2.5H+",
            parameters={"witness": witness["name"]},
        )
        return StateSnapshot(
            psl=psl,
            tier1=tier1,
            tier2=tier2,
            reality_packet=packet,
            judicial=judicial,
            consensus_score=consensus_score,
            execution_plan=plan,
            timestamp=0,
        )
