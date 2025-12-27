"""
Tier 3 Manager with intelligent query routing across 40 sources.

Routes queries to 5-10 most relevant sources based on:
- Context (formal/real-time/social/political/technical/casual)
- Domain keywords (medical, legal, code, science, etc.)
- Query intent (research, fact-check, how-to, opinion, etc.)
"""

from __future__ import annotations

import asyncio
import logging
import re
from typing import List, Dict, Set, Any

from .base import Tier3Connector, KnowledgeSnippet, SourceCategory, QueryIntent

logger = logging.getLogger(__name__)


class Tier3Manager:
    """
    Manages intelligent selection and querying of 40 knowledge sources.
    """

    # Domain keyword patterns for routing
    DOMAIN_PATTERNS = {
        "medical": [
            r"\b(medical|health|disease|treatment|symptom|diagnosis|covid|cancer|"
            r"medicine|doctor|patient|clinical|therapy|drug|vaccine|healthcare|"
            r"hospital|surgery|pharmaceutical|nursing|epidemic|pandemic)\b"
        ],
        "legal": [
            r"\b(legal|law|regulation|statute|contract|court|patent|copyright|"
            r"legislation|regulatory|compliance|policy|lawsuit|attorney|lawyer|"
            r"litigation|jurisdiction|verdict|tribunal)\b"
        ],
        "code": [
            r"\b(code|python|javascript|java|bug|error|function|api|programming|"
            r"debug|async|class|library|framework|typescript|rust|golang|sql|"
            r"database|algorithm|data.structure|software|developer)\b"
        ],
        "science": [
            r"\b(physics|chemistry|biology|astronomy|quantum|molecular|atom|"
            r"space|nasa|experiment|scientific|research|hypothesis|theory|"
            r"laboratory|particle|genetics|evolution|ecology)\b"
        ],
        "finance": [
            r"\b(stock|invest|finance|market|trading|sec|edgar|earnings|"
            r"revenue|portfolio|dividend|cryptocurrency|bitcoin|bonds|"
            r"banking|mortgage|insurance|fiscal|monetary)\b"
        ],
        "philosophy": [
            r"\b(philosophy|epistemology|ethics|moral|metaphysics|logic|"
            r"philosophical|kant|plato|aristotle|existential|ontology|"
            r"consciousness|free.will|determinism)\b"
        ],
        "academic": [
            r"\b(research|study|paper|journal|arxiv|pubmed|scholar|citation|"
            r"peer.review|academic|thesis|dissertation|methodology|hypothesis|"
            r"empirical|literature.review)\b"
        ],
        "news": [
            r"\b(news|current|recent|today|latest|breaking|happened|trend|"
            r"reported|announced|election|politics|government|economy)\b"
        ],
    }

    # Intent patterns
    INTENT_PATTERNS = {
        QueryIntent.RESEARCH: [
            r"\b(research|study|studies|evidence|findings|literature)\b",
            r"^what (are|is) the (latest|current|recent)"
        ],
        QueryIntent.FACT_CHECK: [
            r"\b(true|false|fact|verify|check|accurate|correct)\b",
            r"^is it true that"
        ],
        QueryIntent.HOW_TO: [
            r"\b(how to|how do|how can|tutorial|guide|step)\b",
            r"^how (do|can) (i|you|we)"
        ],
        QueryIntent.DEFINITION: [
            r"\b(what is|what are|define|definition|meaning|explain)\b",
            r"^(what|who) (is|are|was|were)"
        ],
        QueryIntent.COMPUTATION: [
            r"\b(calculate|compute|solve|equation|formula|math)\b",
            r"[0-9]+\s*[\+\-\*\/\^]\s*[0-9]+"  # Math expressions
        ],
        QueryIntent.OPINION: [
            r"\b(think|opinion|view|perspective|should|best|worst)\b",
            r"^(should|do you think|what do people)"
        ],
        QueryIntent.CURRENT_EVENTS: [
            r"\b(today|yesterday|this week|recently|now|current)\b",
            r"^what (happened|is happening)"
        ],
    }

    def __init__(self):
        self.connectors: Dict[str, Tier3Connector] = {}
        self._initialized = False

    def register_connector(self, connector: Tier3Connector) -> None:
        """Register a knowledge source connector."""
        self.connectors[connector.source_name] = connector
        logger.debug(f"Registered: {connector.source_name} (enabled={connector.enabled})")

    def initialize(self) -> None:
        """Initialize all 40 connectors."""
        if self._initialized:
            return

        # Import all connectors
        from .connectors import (
            # General (5)
            WikipediaConnector, BritannicaConnector, GoogleSearchConnector,
            BingSearchConnector, WolframAlphaConnector,
            # Academic (7)
            ArxivConnector, SemanticScholarConnector, CrossRefConnector,
            PubMedConnector, ClinicalTrialsConnector, OpenAlexConnector, COREConnector,
            # Medical (1)
            MedicalLLMConnector,
            # Technical (4)
            StackOverflowConnector, GitHubSearchConnector, MDNDocsConnector,
            OpenSourceDocsConnector,
            # Government (2)
            GovernmentDataConnector, EULegislationConnector,
            # News (2)
            NewsAPIConnector, GDELTConnector,
            # Patents (2)
            PatentScopeConnector, USPTOConnector,
            # Science (2)
            NASAConnector, OpenWeatherConnector,
            # Philosophy (2)
            PhilosophyEncyclopediaConnector, StanfordSEPConnector,
            # Social (1)
            RedditConnector,
            # Financial (2)
            SECEdgarConnector, FinancialTimesConnector,
        )

        # Register all 40 connectors
        connectors = [
            # General (5)
            WikipediaConnector(), BritannicaConnector(), GoogleSearchConnector(),
            BingSearchConnector(), WolframAlphaConnector(),
            # Academic (7)
            ArxivConnector(), SemanticScholarConnector(), CrossRefConnector(),
            PubMedConnector(), ClinicalTrialsConnector(), OpenAlexConnector(),
            COREConnector(),
            # Medical (1)
            MedicalLLMConnector(),
            # Technical (4)
            StackOverflowConnector(), GitHubSearchConnector(), MDNDocsConnector(),
            OpenSourceDocsConnector(),
            # Government (2)
            GovernmentDataConnector(), EULegislationConnector(),
            # News (2)
            NewsAPIConnector(), GDELTConnector(),
            # Patents (2)
            PatentScopeConnector(), USPTOConnector(),
            # Science (2)
            NASAConnector(), OpenWeatherConnector(),
            # Philosophy (2)
            PhilosophyEncyclopediaConnector(), StanfordSEPConnector(),
            # Social (1)
            RedditConnector(),
            # Financial (2)
            SECEdgarConnector(), FinancialTimesConnector(),
        ]

        for connector in connectors:
            self.register_connector(connector)

        self._initialized = True

        enabled_count = sum(1 for c in self.connectors.values() if c.enabled)
        logger.info(
            f"Tier 3 Manager initialized: {len(self.connectors)} total sources, "
            f"{enabled_count} enabled"
        )

    async def fetch_relevant_sources(
        self,
        query: str,
        context: str,
        max_sources: int = 6
    ) -> List[KnowledgeSnippet]:
        """
        Intelligently select and query the most relevant sources.

        Args:
            query: User query
            context: Detected context (formal/real-time/social/technical/political/casual)
            max_sources: Maximum number of sources to query

        Returns:
            List of KnowledgeSnippet objects from selected sources
        """
        if not self._initialized:
            self.initialize()

        # Detect domain and intent
        domains = self._detect_domains(query)
        intent = self._detect_intent(query)

        logger.info(
            f"Query routing: context={context}, domains={domains}, intent={intent.value}"
        )

        # Select relevant connectors
        selected_connectors = self._select_connectors(
            context=context,
            domains=domains,
            intent=intent,
            max_sources=max_sources
        )

        if not selected_connectors:
            logger.warning(f"No connectors selected for: {query[:50]}...")
            return []

        logger.info(
            f"Querying {len(selected_connectors)} sources: "
            f"{[c.source_name for c in selected_connectors]}"
        )

        # Query all selected sources in parallel
        tasks = [
            self._safe_fetch(connector, query, max_results=2)
            for connector in selected_connectors
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Flatten and filter results
        snippets: List[KnowledgeSnippet] = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Connector error: {result}")
                continue
            if isinstance(result, list):
                snippets.extend(result)

        # Sort by reliability (highest first)
        snippets.sort(key=lambda s: s.reliability, reverse=True)

        # Return top snippets
        final_count = min(len(snippets), max_sources * 2)
        unique_sources = len(set(s.source_name for s in snippets[:final_count]))
        logger.info(f"Tier 3: Returning {final_count} snippets from {unique_sources} sources")

        return snippets[:final_count]

    async def _safe_fetch(
        self,
        connector: Tier3Connector,
        query: str,
        max_results: int
    ) -> List[KnowledgeSnippet]:
        """Safely fetch from a connector with error handling."""
        try:
            snippets = await connector.fetch(query, max_results)
            return snippets
        except Exception as e:
            logger.error(f"Connector {connector.source_name} failed: {e}")
            return []

    def _detect_domains(self, query: str) -> Set[str]:
        """Detect domain(s) from query text."""
        query_lower = query.lower()
        domains = set()

        for domain, patterns in self.DOMAIN_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, query_lower, re.IGNORECASE):
                    domains.add(domain)
                    break

        return domains

    def _detect_intent(self, query: str) -> QueryIntent:
        """Detect primary query intent."""
        query_lower = query.lower()

        # Score each intent
        scores = {intent: 0 for intent in QueryIntent}

        for intent, patterns in self.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, query_lower, re.IGNORECASE):
                    scores[intent] += 1

        # Return highest-scoring intent (or DEFINITION as default)
        max_intent = max(scores.items(), key=lambda x: x[1])
        return max_intent[0] if max_intent[1] > 0 else QueryIntent.DEFINITION

    def _select_connectors(
        self,
        context: str,
        domains: Set[str],
        intent: QueryIntent,
        max_sources: int
    ) -> List[Tier3Connector]:
        """
        Select the most relevant connectors based on context, domains, and intent.

        Returns top N enabled connectors.
        """
        # Base context routing
        context_sources = {
            "formal": [
                "Wikipedia-API", "Britannica-API", "Arxiv-API",
                "SemanticScholar-API", "Stanford-SEP", "PubMed-API"
            ],
            "real-time": [
                "NewsAPI", "Reddit-API", "GDELT", "Google-Search"
            ],
            "social": [
                "Reddit-API", "NewsAPI", "GDELT", "Wikipedia-API"
            ],
            "political": [
                "Wikipedia-API", "NewsAPI", "Government-Data-API",
                "EU-Legislation-API", "Reddit-API"
            ],
            "technical": [
                "StackOverflow-API", "GitHub-Code-Search", "MDN-Web-Docs",
                "OpenSource-Docs", "Wikipedia-API"
            ],
            "casual": [
                "Wikipedia-API", "Reddit-API", "Google-Search", "Bing-Search"
            ],
        }

        # Domain-specific routing
        domain_sources = {
            "medical": [
                "PubMed-API", "ClinicalTrials-API", "MedicalLLM",
                "SemanticScholar-API", "Wikipedia-API"
            ],
            "legal": [
                "EU-Legislation-API", "Government-Data-API",
                "Wikipedia-API", "Google-Search"
            ],
            "code": [
                "StackOverflow-API", "GitHub-Code-Search",
                "MDN-Web-Docs", "OpenSource-Docs"
            ],
            "science": [
                "Arxiv-API", "SemanticScholar-API", "NASA-API",
                "Wikipedia-API", "Britannica-API"
            ],
            "finance": [
                "SEC-EDGAR", "FinancialTimes-API", "NewsAPI",
                "Reddit-API", "Google-Search"
            ],
            "philosophy": [
                "Stanford-SEP", "Philosophy-Encyclopedia",
                "Wikipedia-API", "Arxiv-API"
            ],
            "academic": [
                "Arxiv-API", "SemanticScholar-API", "PubMed-API",
                "CrossRef-API", "OpenAlex-API", "CORE-API"
            ],
            "news": [
                "NewsAPI", "GDELT", "FinancialTimes-API",
                "Reddit-API", "Google-Search"
            ],
        }

        # Intent-specific routing
        intent_sources = {
            QueryIntent.RESEARCH: [
                "Arxiv-API", "SemanticScholar-API", "PubMed-API",
                "CrossRef-API", "OpenAlex-API"
            ],
            QueryIntent.FACT_CHECK: [
                "Wikipedia-API", "Britannica-API", "PubMed-API",
                "NewsAPI", "Google-Search"
            ],
            QueryIntent.HOW_TO: [
                "StackOverflow-API", "GitHub-Code-Search",
                "MDN-Web-Docs", "Reddit-API", "Google-Search"
            ],
            QueryIntent.DEFINITION: [
                "Wikipedia-API", "Britannica-API", "WolframAlpha-API",
                "Stanford-SEP"
            ],
            QueryIntent.COMPUTATION: [
                "WolframAlpha-API", "Wikipedia-API", "StackOverflow-API"
            ],
            QueryIntent.OPINION: [
                "Reddit-API", "NewsAPI", "GDELT", "Google-Search"
            ],
            QueryIntent.CURRENT_EVENTS: [
                "NewsAPI", "GDELT", "Reddit-API", "Google-Search", "Bing-Search"
            ],
        }

        # Aggregate source names
        candidate_names = set()

        # Add context-based sources
        candidate_names.update(context_sources.get(context, []))

        # Add domain-based sources
        for domain in domains:
            candidate_names.update(domain_sources.get(domain, []))

        # Add intent-based sources
        candidate_names.update(intent_sources.get(intent, []))

        # If no specific sources, add defaults
        if not candidate_names:
            candidate_names = {"Wikipedia-API", "Google-Search", "Reddit-API"}

        # Get enabled connectors
        selected = [
            self.connectors[name]
            for name in candidate_names
            if name in self.connectors and self.connectors[name].enabled
        ]

        # Sort by reliability (highest first)
        selected.sort(key=lambda c: c.reliability, reverse=True)

        # Limit to max_sources
        return selected[:max_sources]

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics for all connectors."""
        enabled_by_category: Dict[str, Dict[str, int]] = {}
        for connector in self.connectors.values():
            cat = connector.category.value
            if cat not in enabled_by_category:
                enabled_by_category[cat] = {"total": 0, "enabled": 0}
            enabled_by_category[cat]["total"] += 1
            if connector.enabled:
                enabled_by_category[cat]["enabled"] += 1

        return {
            "total_connectors": len(self.connectors),
            "enabled_connectors": sum(1 for c in self.connectors.values() if c.enabled),
            "by_category": enabled_by_category,
            "connector_stats": {
                name: conn.get_stats()
                for name, conn in self.connectors.items()
            }
        }

    async def close_all(self) -> None:
        """Close all connector sessions."""
        for connector in self.connectors.values():
            try:
                await connector.close()
            except Exception as e:
                logger.error(f"Error closing {connector.source_name}: {e}")
