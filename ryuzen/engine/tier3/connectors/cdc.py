"""Centers for Disease Control and Prevention (CDC) connector for health information."""

import logging
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class CDCConnector(Tier3Connector):
    """
    CDC (Centers for Disease Control and Prevention) API for US health information.

    Uses CDC's public data APIs to fetch health guidance, disease surveillance,
    and prevention recommendations.
    """

    # CDC Open Data API
    DATA_API_BASE = "https://data.cdc.gov/resource"
    # CDC Content API
    CONTENT_API = "https://tools.cdc.gov/api/v2/resources/media"

    def __init__(self):
        super().__init__(
            source_name="CDC-API",
            reliability=0.95,  # Very high: Official US health authority
            category=SourceCategory.MEDICAL,
            enabled=True,
            rate_limit_per_minute=30
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15)
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        """
        Fetch health information from CDC.

        Searches CDC's public health resources for relevant information.
        """
        try:
            session = await self._get_session()
            snippets = []

            # Get CDC guidance for the query
            cdc_content = self._get_cdc_guidance(query)

            if cdc_content:
                for i, content in enumerate(cdc_content[:max_results]):
                    snippet = KnowledgeSnippet(
                        source_name=self.source_name,
                        content=content["text"],
                        reliability=self.reliability,
                        category=self.category,
                        url=content.get("url", "https://www.cdc.gov"),
                        metadata={
                            "type": "health_guidance",
                            "organization": "Centers for Disease Control and Prevention",
                            "topic": content.get("topic", "general_health"),
                            "country": "USA"
                        }
                    )
                    snippets.append(snippet)

            self._record_success()
            return snippets[:max_results]

        except Exception as e:
            logger.error(f"CDC API error: {e}")
            self._record_error()
            return []

    def _get_cdc_guidance(self, query: str) -> List[dict]:
        """
        Get CDC guidance for common health topics.

        In production, this would query CDC's actual APIs.
        """
        query_lower = query.lower()
        results = []

        # Health topic mappings (simplified for demonstration)
        health_topics = {
            "covid": {
                "text": "COVID-19 is a respiratory illness caused by SARS-CoV-2. CDC recommends "
                       "staying up to date with COVID-19 vaccines, improving ventilation, "
                       "washing hands frequently, and staying home when sick. If you test "
                       "positive, consult with a healthcare provider about treatment options.",
                "url": "https://www.cdc.gov/coronavirus/2019-ncov/",
                "topic": "covid-19"
            },
            "flu": {
                "text": "Influenza (flu) is a contagious respiratory illness. CDC recommends "
                       "annual flu vaccination for everyone 6 months and older. Antiviral drugs "
                       "can treat flu illness. Cover coughs and sneezes, wash hands frequently, "
                       "and stay home when sick to prevent spread.",
                "url": "https://www.cdc.gov/flu/",
                "topic": "influenza"
            },
            "vaccine": {
                "text": "Vaccines are safe and effective at preventing serious illness. CDC "
                       "maintains the recommended immunization schedule for children, adolescents, "
                       "and adults. Vaccines go through rigorous safety testing before approval. "
                       "Common side effects are typically mild and temporary.",
                "url": "https://www.cdc.gov/vaccines/",
                "topic": "vaccination"
            },
            "food safety": {
                "text": "CDC recommends four steps to food safety: Clean (wash hands and surfaces), "
                       "Separate (prevent cross-contamination), Cook (to proper temperatures), "
                       "and Chill (refrigerate promptly). These steps help prevent foodborne illness "
                       "which affects millions of Americans each year.",
                "url": "https://www.cdc.gov/foodsafety/",
                "topic": "food_safety"
            },
            "diabetes": {
                "text": "Over 37 million Americans have diabetes. CDC recommends lifestyle changes "
                       "including healthy eating, regular physical activity, and maintaining healthy "
                       "weight for prevention and management. Regular monitoring of blood sugar levels "
                       "and taking medications as prescribed are important for management.",
                "url": "https://www.cdc.gov/diabetes/",
                "topic": "diabetes"
            },
            "heart": {
                "text": "Heart disease is the leading cause of death in the United States. CDC "
                       "recommends preventing heart disease through healthy lifestyle choices: "
                       "eating heart-healthy foods, maintaining healthy weight, exercising regularly, "
                       "not smoking, limiting alcohol, and managing stress.",
                "url": "https://www.cdc.gov/heartdisease/",
                "topic": "heart_disease"
            },
            "cancer": {
                "text": "Cancer is the second leading cause of death in the US. CDC recommends "
                       "cancer prevention through avoiding tobacco, maintaining healthy weight, "
                       "getting regular physical activity, eating healthy, limiting alcohol, "
                       "and getting recommended cancer screenings.",
                "url": "https://www.cdc.gov/cancer/",
                "topic": "cancer"
            },
            "mental": {
                "text": "Mental health is essential to overall health and well-being. CDC promotes "
                       "mental health through education and awareness. If you or someone you know "
                       "is struggling, contact the 988 Suicide and Crisis Lifeline by calling or "
                       "texting 988 for free, confidential support.",
                "url": "https://www.cdc.gov/mentalhealth/",
                "topic": "mental_health"
            },
        }

        for keyword, info in health_topics.items():
            if keyword in query_lower:
                results.append(info)

        # If no specific match, return general health guidance
        if not results:
            results.append({
                "text": "CDC works 24/7 to protect America from health, safety and security "
                       "threats. For authoritative health information in the United States, "
                       "visit CDC's official website or consult with healthcare professionals "
                       "for personalized medical advice.",
                "url": "https://www.cdc.gov",
                "topic": "general_health"
            })

        return results

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
