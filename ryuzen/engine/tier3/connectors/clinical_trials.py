"""ClinicalTrials.gov connector for clinical research."""

import logging
from typing import List
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class ClinicalTrialsConnector(Tier3Connector):
    """
    ClinicalTrials.gov API connector for clinical trial data.

    API docs: https://clinicaltrials.gov/data-api/api
    Free government API, no authentication required.
    """

    API_BASE = "https://clinicaltrials.gov/api/v2/studies"

    def __init__(self):
        super().__init__(
            source_name="ClinicalTrials-API",
            reliability=0.92,
            category=SourceCategory.MEDICAL,
            enabled=True,
            requires_api_key=False  # Free government API
        )
        self._session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15)
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        try:
            session = await self._get_session()

            params = {
                "query.term": query,
                "pageSize": min(max_results, 100),
                "format": "json",
                "fields": "NCTId,BriefTitle,OfficialTitle,BriefSummary,Condition,InterventionName,Phase,OverallStatus,StartDate,PrimaryCompletionDate,EnrollmentCount,LeadSponsorName"
            }

            async with session.get(self.API_BASE, params=params) as response:
                if response.status != 200:
                    logger.warning(f"ClinicalTrials.gov: {response.status}")
                    self._record_error()
                    return []

                data = await response.json()

            snippets = []
            studies = data.get("studies", [])

            for study in studies[:max_results]:
                protocol = study.get("protocolSection", {})
                id_module = protocol.get("identificationModule", {})
                description_module = protocol.get("descriptionModule", {})
                status_module = protocol.get("statusModule", {})
                design_module = protocol.get("designModule", {})
                sponsor_module = protocol.get("sponsorCollaboratorsModule", {})
                conditions_module = protocol.get("conditionsModule", {})
                interventions_module = protocol.get("armsInterventionsModule", {})

                # Extract data
                nct_id = id_module.get("nctId", "")
                brief_title = id_module.get("briefTitle", "")
                official_title = id_module.get("officialTitle", "")
                summary = description_module.get("briefSummary", "")
                overall_status = status_module.get("overallStatus", "")
                start_date = status_module.get("startDateStruct", {}).get("date", "")

                # Conditions
                conditions = conditions_module.get("conditions", [])
                conditions_str = ", ".join(conditions[:3])

                # Interventions
                interventions = interventions_module.get("interventions", [])
                intervention_names = [i.get("name", "") for i in interventions[:3]]
                intervention_str = ", ".join(intervention_names)

                # Phase
                phases = design_module.get("phases", [])
                phase_str = ", ".join(phases) if phases else "N/A"

                # Enrollment
                enrollment = design_module.get("enrollmentInfo", {})
                enrollment_count = enrollment.get("count", "")

                # Sponsor
                lead_sponsor = sponsor_module.get("leadSponsor", {})
                sponsor_name = lead_sponsor.get("name", "")

                # Build content
                content_parts = [brief_title or official_title]
                content_parts.append(f"NCT ID: {nct_id}")
                if overall_status:
                    content_parts.append(f"Status: {overall_status}")
                if phase_str:
                    content_parts.append(f"Phase: {phase_str}")
                if conditions_str:
                    content_parts.append(f"Conditions: {conditions_str}")
                if intervention_str:
                    content_parts.append(f"Interventions: {intervention_str}")
                if enrollment_count:
                    content_parts.append(f"Enrollment: {enrollment_count}")
                if sponsor_name:
                    content_parts.append(f"Sponsor: {sponsor_name}")
                if start_date:
                    content_parts.append(f"Start Date: {start_date}")
                if summary:
                    content_parts.append(f"\n{summary[:600]}")

                content = "\n".join(content_parts)

                if content.strip():
                    url = f"https://clinicaltrials.gov/study/{nct_id}"
                    snippet = KnowledgeSnippet(
                        source_name=self.source_name,
                        content=content[:1500],
                        reliability=self.reliability,
                        category=self.category,
                        url=url,
                        metadata={
                            "nct_id": nct_id,
                            "status": overall_status,
                            "phase": phase_str,
                            "conditions": conditions,
                            "type": "clinical_trial"
                        }
                    )
                    snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"ClinicalTrials.gov error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
