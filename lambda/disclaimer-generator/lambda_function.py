"""
TORON Epistemic Honesty Disclaimer Generator
=============================================

Detects domain context from user queries and generates appropriate
disclaimers to maintain epistemic honesty while providing information.

Philosophy: Provide information with sources and disclaimers,
not professional advice. Users should understand limitations.
"""

import re
import json
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


class Domain(Enum):
    """Detected domain categories for disclaimer generation."""
    EMERGENCY = "emergency"
    MEDICAL = "medical"
    FINANCIAL = "financial"
    LEGAL = "legal"
    GENERAL = "general"


@dataclass
class DomainDetectionResult:
    """Result of domain detection with confidence score."""
    domain: Domain
    confidence: float
    matched_keywords: List[str]
    is_emergency: bool = False


# Domain detection patterns with weighted keywords
DOMAIN_PATTERNS: Dict[Domain, Dict[str, List[str]]] = {
    Domain.EMERGENCY: {
        "high_priority": [
            r"\b(suicide|suicidal|kill myself|end my life|want to die)\b",
            r"\b(overdose|overdosing|took too many|poisoned)\b",
            r"\b(heart attack|stroke|seizure|can't breathe|choking)\b",
            r"\b(bleeding out|severe bleeding|won't stop bleeding)\b",
            r"\b(unconscious|unresponsive|not breathing)\b",
            r"\b(anaphylaxis|allergic reaction|throat swelling)\b",
        ],
        "medium_priority": [
            r"\b(emergency|urgent|critical|life threatening)\b",
            r"\b(911|ambulance|ER|emergency room)\b",
            r"\b(chest pain|severe pain|intense pain)\b",
        ]
    },
    Domain.MEDICAL: {
        "high_priority": [
            r"\b(symptom|symptoms|diagnosis|diagnose|disease|condition)\b",
            r"\b(medication|medicine|drug|prescription|dosage|dose)\b",
            r"\b(treatment|therapy|procedure|surgery|operation)\b",
            r"\b(doctor|physician|specialist|healthcare|medical)\b",
            r"\b(pain|ache|swelling|inflammation|infection)\b",
        ],
        "medium_priority": [
            r"\b(health|healthy|wellness|fitness|nutrition)\b",
            r"\b(vitamin|supplement|diet|exercise)\b",
            r"\b(cancer|diabetes|hypertension|depression|anxiety)\b",
            r"\b(pregnancy|pregnant|prenatal|fertility)\b",
        ],
        "low_priority": [
            r"\b(headache|fever|cold|flu|cough)\b",
            r"\b(tired|fatigue|sleep|insomnia)\b",
        ]
    },
    Domain.FINANCIAL: {
        "high_priority": [
            r"\b(invest|investment|investing|portfolio)\b",
            r"\b(stock|stocks|bond|bonds|mutual fund|ETF)\b",
            r"\b(retirement|401k|IRA|pension|savings)\b",
            r"\b(tax|taxes|taxation|deduction|IRS)\b",
            r"\b(mortgage|loan|debt|credit|interest rate)\b",
        ],
        "medium_priority": [
            r"\b(financial|finance|money|wealth|income)\b",
            r"\b(budget|budgeting|expense|spending)\b",
            r"\b(crypto|cryptocurrency|bitcoin|ethereum)\b",
            r"\b(insurance|coverage|premium|claim)\b",
        ],
        "low_priority": [
            r"\b(bank|banking|account|transfer)\b",
            r"\b(price|cost|fee|charge)\b",
        ]
    },
    Domain.LEGAL: {
        "high_priority": [
            r"\b(lawyer|attorney|legal counsel|litigation)\b",
            r"\b(lawsuit|sue|suing|court|trial|verdict)\b",
            r"\b(contract|agreement|terms|liability)\b",
            r"\b(rights|constitutional|amendment|statute)\b",
            r"\b(criminal|felony|misdemeanor|arrest|charges)\b",
        ],
        "medium_priority": [
            r"\b(legal|law|regulation|compliance)\b",
            r"\b(divorce|custody|alimony|estate|will)\b",
            r"\b(patent|trademark|copyright|intellectual property)\b",
            r"\b(employment|discrimination|wrongful termination)\b",
        ],
        "low_priority": [
            r"\b(policy|policies|rule|rules)\b",
            r"\b(permit|license|registration)\b",
        ]
    }
}

# Disclaimer templates by domain
DISCLAIMERS: Dict[Domain, str] = {
    Domain.EMERGENCY: """
**IMPORTANT - EMERGENCY DETECTED**

If you or someone else is experiencing a medical emergency, please:
- Call 911 (US) or your local emergency number immediately
- Go to the nearest emergency room
- Contact a crisis hotline:
  - National Suicide Prevention Lifeline: 988 (US)
  - Crisis Text Line: Text HOME to 741741

This AI cannot provide emergency medical assistance. Professional help is critical.

---
""",

    Domain.MEDICAL: """
**Medical Information Disclaimer**

The information provided is for educational and informational purposes only. It is NOT intended to be a substitute for professional medical advice, diagnosis, or treatment.

- Always seek the advice of a qualified healthcare provider
- Never disregard professional medical advice because of something you read here
- If you think you may have a medical emergency, call your doctor or 911 immediately

The AI provides general health information but cannot diagnose conditions or prescribe treatments.

---
""",

    Domain.FINANCIAL: """
**Financial Information Disclaimer**

This information is provided for educational purposes only and does not constitute financial advice, investment recommendations, or tax guidance.

- Consult a licensed financial advisor before making investment decisions
- Past performance does not guarantee future results
- Individual financial situations vary; what works for others may not work for you
- Tax laws vary by jurisdiction and change frequently

The AI provides general financial information but is not a registered investment advisor.

---
""",

    Domain.LEGAL: """
**Legal Information Disclaimer**

This information is provided for general educational purposes only and does not constitute legal advice or create an attorney-client relationship.

- Laws vary by jurisdiction and are subject to change
- For specific legal matters, consult a licensed attorney in your jurisdiction
- This information may not reflect the most current legal developments
- Legal outcomes depend on specific facts and circumstances

The AI provides general legal information but cannot represent you in legal matters.

---
""",

    Domain.GENERAL: ""  # No disclaimer needed for general queries
}

# Source citation templates
SOURCE_CITATION_TEMPLATE = """
**Sources & Confidence**

Epistemic Grade: {grade}
Agreement Level: {agreement_percentage}%

{sources_text}

*Note: This response synthesizes information from multiple sources. Always verify critical information.*
"""


def detect_domain(query: str) -> DomainDetectionResult:
    """
    Detect the domain of a user query for disclaimer generation.

    Args:
        query: The user's input query

    Returns:
        DomainDetectionResult with detected domain and confidence
    """
    query_lower = query.lower()
    domain_scores: Dict[Domain, Tuple[float, List[str]]] = {}

    # Check for emergency first (highest priority)
    emergency_patterns = DOMAIN_PATTERNS[Domain.EMERGENCY]
    emergency_matches = []

    for pattern in emergency_patterns.get("high_priority", []):
        if re.search(pattern, query_lower, re.IGNORECASE):
            emergency_matches.append(pattern)

    if emergency_matches:
        return DomainDetectionResult(
            domain=Domain.EMERGENCY,
            confidence=1.0,
            matched_keywords=emergency_matches,
            is_emergency=True
        )

    # Check medium priority emergency patterns
    for pattern in emergency_patterns.get("medium_priority", []):
        if re.search(pattern, query_lower, re.IGNORECASE):
            emergency_matches.append(pattern)

    if len(emergency_matches) >= 2:
        return DomainDetectionResult(
            domain=Domain.EMERGENCY,
            confidence=0.8,
            matched_keywords=emergency_matches,
            is_emergency=True
        )

    # Score other domains
    for domain in [Domain.MEDICAL, Domain.FINANCIAL, Domain.LEGAL]:
        patterns = DOMAIN_PATTERNS[domain]
        score = 0.0
        matches = []

        for pattern in patterns.get("high_priority", []):
            if re.search(pattern, query_lower, re.IGNORECASE):
                score += 0.4
                matches.append(pattern)

        for pattern in patterns.get("medium_priority", []):
            if re.search(pattern, query_lower, re.IGNORECASE):
                score += 0.2
                matches.append(pattern)

        for pattern in patterns.get("low_priority", []):
            if re.search(pattern, query_lower, re.IGNORECASE):
                score += 0.1
                matches.append(pattern)

        domain_scores[domain] = (min(score, 1.0), matches)

    # Find highest scoring domain
    best_domain = Domain.GENERAL
    best_score = 0.0
    best_matches: List[str] = []

    for domain, (score, matches) in domain_scores.items():
        if score > best_score:
            best_domain = domain
            best_score = score
            best_matches = matches

    # Only return domain if confidence is above threshold
    if best_score >= 0.3:
        return DomainDetectionResult(
            domain=best_domain,
            confidence=best_score,
            matched_keywords=best_matches,
            is_emergency=False
        )

    return DomainDetectionResult(
        domain=Domain.GENERAL,
        confidence=1.0,
        matched_keywords=[],
        is_emergency=False
    )


def generate_disclaimer(domain_result: DomainDetectionResult) -> str:
    """
    Generate an appropriate disclaimer based on detected domain.

    Args:
        domain_result: Result from detect_domain()

    Returns:
        Disclaimer string to prepend to AI response
    """
    return DISCLAIMERS.get(domain_result.domain, "")


def generate_source_citation(
    sources: List[Dict[str, str]],
    epistemic_grade: str,
    agreement_percentage: float
) -> str:
    """
    Generate source citation block with epistemic grading.

    Args:
        sources: List of source dictionaries with 'title' and 'url' keys
        epistemic_grade: TORON epistemic grade (A/B/C/D/F)
        agreement_percentage: Model agreement percentage (0-100)

    Returns:
        Formatted source citation string
    """
    if not sources:
        sources_text = "- No external sources cited for this response"
    else:
        sources_text = "\n".join([
            f"- [{s.get('title', 'Unknown')}]({s.get('url', '#')})"
            for s in sources[:5]  # Limit to 5 sources
        ])

    return SOURCE_CITATION_TEMPLATE.format(
        grade=epistemic_grade,
        agreement_percentage=round(agreement_percentage, 1),
        sources_text=sources_text
    )


def process_response(
    query: str,
    response: str,
    sources: Optional[List[Dict[str, str]]] = None,
    epistemic_grade: str = "B",
    agreement_percentage: float = 85.0
) -> Dict[str, any]:
    """
    Process a TORON response with appropriate disclaimers and citations.

    Args:
        query: Original user query
        response: AI-generated response
        sources: Optional list of sources
        epistemic_grade: TORON epistemic grade
        agreement_percentage: Model agreement percentage

    Returns:
        Dictionary with processed response and metadata
    """
    # Detect domain
    domain_result = detect_domain(query)

    # Generate disclaimer
    disclaimer = generate_disclaimer(domain_result)

    # Generate source citation
    citation = generate_source_citation(
        sources or [],
        epistemic_grade,
        agreement_percentage
    )

    # Combine response
    processed_response = f"{disclaimer}{response}\n\n{citation}"

    return {
        "processed_response": processed_response,
        "domain": domain_result.domain.value,
        "confidence": domain_result.confidence,
        "is_emergency": domain_result.is_emergency,
        "epistemic_grade": epistemic_grade,
        "agreement_percentage": agreement_percentage,
        "disclaimer_added": bool(disclaimer)
    }


def lambda_handler(event: Dict, context) -> Dict:
    """
    AWS Lambda handler for disclaimer generation.

    Event structure:
    {
        "query": "user query string",
        "response": "AI response to process",
        "sources": [{"title": "...", "url": "..."}],
        "epistemic_grade": "A/B/C/D/F",
        "agreement_percentage": 0-100
    }

    Returns:
    {
        "statusCode": 200,
        "body": {
            "processed_response": "...",
            "domain": "medical/financial/legal/emergency/general",
            "confidence": 0.0-1.0,
            "is_emergency": true/false,
            "epistemic_grade": "A/B/C/D/F",
            "agreement_percentage": 0-100,
            "disclaimer_added": true/false
        }
    }
    """
    try:
        # Parse input
        body = event.get("body")
        if isinstance(body, str):
            body = json.loads(body)
        elif body is None:
            body = event

        query = body.get("query", "")
        response = body.get("response", "")
        sources = body.get("sources", [])
        epistemic_grade = body.get("epistemic_grade", "B")
        agreement_percentage = body.get("agreement_percentage", 85.0)

        # Validate required fields
        if not query:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required field: query"})
            }

        if not response:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required field: response"})
            }

        # Process response
        result = process_response(
            query=query,
            response=response,
            sources=sources,
            epistemic_grade=epistemic_grade,
            agreement_percentage=agreement_percentage
        )

        # Log for monitoring
        logger.info(json.dumps({
            "action": "disclaimer_generated",
            "domain": result["domain"],
            "is_emergency": result["is_emergency"],
            "confidence": result["confidence"],
            "epistemic_grade": result["epistemic_grade"]
        }))

        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"Invalid JSON: {str(e)}"})
        }
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"Internal error: {str(e)}"})
        }


# For direct invocation testing
if __name__ == "__main__":
    # Test cases
    test_queries = [
        "I'm having chest pain and can't breathe",
        "What are the symptoms of diabetes?",
        "How should I invest my 401k?",
        "Can I sue my landlord for not fixing the heat?",
        "What's the weather like today?",
    ]

    for query in test_queries:
        result = detect_domain(query)
        print(f"\nQuery: {query}")
        print(f"Domain: {result.domain.value}")
        print(f"Confidence: {result.confidence}")
        print(f"Emergency: {result.is_emergency}")
