"""All 40 Tier 3 knowledge source connectors."""

# General (5)
from .wikipedia import WikipediaConnector
from .britannica import BritannicaConnector
from .google_search import GoogleSearchConnector
from .bing_search import BingSearchConnector
from .wolfram_alpha import WolframAlphaConnector

# Academic (7)
from .arxiv import ArxivConnector
from .semantic_scholar import SemanticScholarConnector
from .crossref import CrossRefConnector
from .pubmed import PubMedConnector
from .clinical_trials import ClinicalTrialsConnector
from .openalex import OpenAlexConnector
from .core import COREConnector

# Medical (1)
from .medical_llm import MedicalLLMConnector

# Technical (4)
from .stackoverflow import StackOverflowConnector
from .github_search import GitHubSearchConnector
from .mdn_docs import MDNDocsConnector
from .opensource_docs import OpenSourceDocsConnector

# Government (2)
from .government_data import GovernmentDataConnector
from .eu_legislation import EULegislationConnector

# News (2)
from .newsapi import NewsAPIConnector
from .gdelt import GDELTConnector

# Patents (2)
from .patentscope import PatentScopeConnector
from .uspto import USPTOConnector

# Science (2)
from .nasa import NASAConnector
from .openweather import OpenWeatherConnector

# Philosophy (2)
from .philosophy_encyclopedia import PhilosophyEncyclopediaConnector
from .stanford_sep import StanfordSEPConnector

# Social (1)
from .reddit import RedditConnector

# Financial (2)
from .sec_edgar import SECEdgarConnector
from .financial_times import FinancialTimesConnector

__all__ = [
    # General (5)
    "WikipediaConnector", "BritannicaConnector", "GoogleSearchConnector",
    "BingSearchConnector", "WolframAlphaConnector",
    # Academic (7)
    "ArxivConnector", "SemanticScholarConnector", "CrossRefConnector",
    "PubMedConnector", "ClinicalTrialsConnector", "OpenAlexConnector", "COREConnector",
    # Medical (1)
    "MedicalLLMConnector",
    # Technical (4)
    "StackOverflowConnector", "GitHubSearchConnector", "MDNDocsConnector",
    "OpenSourceDocsConnector",
    # Government (2)
    "GovernmentDataConnector", "EULegislationConnector",
    # News (2)
    "NewsAPIConnector", "GDELTConnector",
    # Patents (2)
    "PatentScopeConnector", "USPTOConnector",
    # Science (2)
    "NASAConnector", "OpenWeatherConnector",
    # Philosophy (2)
    "PhilosophyEncyclopediaConnector", "StanfordSEPConnector",
    # Social (1)
    "RedditConnector",
    # Financial (2)
    "SECEdgarConnector", "FinancialTimesConnector",
]
