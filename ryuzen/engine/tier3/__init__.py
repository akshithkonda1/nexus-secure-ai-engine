"""
Tier 3: External Knowledge Sources for TORON v2.5h+

Provides 42 external knowledge sources with intelligent routing.

Categories:
- General Knowledge (5): Wikipedia, Britannica, Google, Bing, Wolfram Alpha
- Academic & Research (7): ArXiv, Semantic Scholar, CrossRef, PubMed, ClinicalTrials, OpenAlex, CORE
- Medical (3): MedicalLLM, WHO, CDC
- Technical (4): StackOverflow, GitHub, MDN, OpenSource Docs
- Government (2): Government Data, EU Legislation
- News (2): NewsAPI, GDELT
- Patents (2): PatentScope, USPTO
- Science (2): NASA, OpenWeather
- Philosophy (2): Philosophy Encyclopedia, Stanford SEP
- Social (1): Reddit
- Financial (2): SEC EDGAR, Financial Times

Performance Optimizations:
- Semantic caching (saves ~500ms per cached query)
- Speculative execution with redundancy (saves ~200ms)
- Adaptive source count based on query complexity (saves ~300ms)
- Rate limit enforcement with exponential backoff
"""

from .base import (
    Tier3Connector,
    KnowledgeSnippet,
    SourceCategory,
    QueryIntent,
)
from .manager import Tier3Manager

__all__ = [
    "Tier3Connector",
    "KnowledgeSnippet",
    "SourceCategory",
    "QueryIntent",
    "Tier3Manager",
]
