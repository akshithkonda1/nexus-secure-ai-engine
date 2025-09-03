#What is Nexus?

#Nexus is a sophisticated AI engine designed to aggregate and analyze responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries.

#It integrates web scraping capabilities for real-time data retrieval, supports secure data encryption, and offers advanced response aggregation techniques to deliver the best possible answers.

#Nexus is built to be extensible and infinitely scalable, allowing for easy integration of new AI models and data sources, making it a versatile tool for developers and researchers alike, but it is also designed to be user-friendly, with a focus on providing clear and actionable insights.

#Nexus is not just a tool for AI enthusiasts; it is a powerful platform that can be used in various applications, from academic research to business intelligence, and it aims to democratize access to advanced AI capabilities by making Gen AI replies more accurate and more correct.

#Nexus is a cutting-edge AI engine that aggregates and analyzes responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries. 
# Nexus also includes powerful 256-bit AES encryption for secure data handling, ensuring that sensitive information is protected throughout the process.

#It combines the power of multiple AI models with the richness of web data, enabling users to gain deeper insights and make more informed decisions, using AI Modal Debating you will get the best possible answer to your question, by combining the strengths of multiple AI models and traditional search engines and media.

#Nexus was developed by Akshith Konda.


# nexus_engine.py
# Nexus Engine — strict schema + web verification (Google, Bing, Tavily, DuckDuckGo) - Do Not Edit the schema this changes functionality and Nexus may not work the same, adding search engines is okay but anything to the schema could change function.
# Adds BeautifulSoup scraping to enrich/verify sources and pull photos (og:image).
# Nexus Engine Debate — resilient model debate + verified web evidence + autonomous health checks - Allows for Core Debate with proofs, and allows for deep health verification 
# - Adapters: openai.chat, openai.responses, anthropic.messages, gemini.generate,
#             cohere.chat, cohere.generate, tgi.generate, generic.json - Nexus is compatible with these adapters. Nexus is designed that all you need is the cloud infrastucture and just add them to secrets manager this approach allows us to add basically infinite models.  
# - Web: Google CSE, Bing, Tavily, DuckDuckGo(HTML) + BeautifulSoup scraper - Nexus uses deep search and web scraping to validate AI Results.
# - Robustness: shared retry helper with backoff+jitter for all web calls - Nexus is built for reliability and robustness not for one time use or to be broken easily
# - Health: hourly (configurable) background checks for connectors, search, scraper, memory, node - Infrastructure is a core part of Nexus to that degree, Nexus is geared to ensure that the infra is healthy and can support operations. We run health checks and other operations.

from __future__ import annotations

import html
import json
import logging
import os
import random
import re
import time
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional, Tuple
from urllib.parse import quote_plus, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import shutil

import requests
from bs4 import BeautifulSoup

# =========================================================
# Logging
# =========================================================
log = logging.getLogger("nexus.engine")
if not log.handlers:
    h = logging.StreamHandler()
    h.setFormatter(logging.Formatter('[%(asctime)s] %(levelname)s %(name)s: %(message)s'))
    log.addHandler(h)
log.setLevel(logging.INFO)

# =========================================================
# Retry helper (used by search providers and scraper)
# =========================================================
def _retry_call(
    fn: Callable[[], Any],
    *,
    tries: int = 3,
    base_backoff: float = 0.25,
    max_backoff: float = 2.0,
    jitter: float = 0.2,
    exceptions: Tuple[type, ...] = (Exception,),
) -> Any:
    last = None
    for i in range(max(1, tries)):
        try:
            return fn()
        except exceptions as e:
            last = e
            if i == tries - 1:
                break
            sleep_s = min(max_backoff, base_backoff * (2 ** i)) + random.random() * jitter
            time.sleep(sleep_s)
    raise last  # pragma: no cover

def _is_https(url: str) -> bool:
    try:
        p = urlparse(url); return p.scheme == "https" and bool(p.netloc)
    except Exception:
        return False

# =========================================================
# ModelConnector + Adapters
# =========================================================
class ModelConnector:
    """HTTP connector with pluggable adapters to normalize request/response shapes."""
    _ADAPTERS: Dict[str, Callable[["ModelConnector", str, Optional[List[Dict[str, str]]], Optional[str]], Tuple[str, Dict[str, Any]]]] = {}
    _ALIASES: Dict[str, str] = {
        # Gateways that use OpenAI-compatible shapes
        "mistral.chat": "openai.chat",
        "openrouter.chat": "openai.chat",
        "together.chat": "openai.chat",
        "groq.chat": "openai.chat",
        "deepseek.chat": "openai.chat",
        "perplexity.chat": "openai.chat",
        "pplx.chat": "openai.chat",
        "azure.openai.chat": "openai.chat",
        "github.models": "openai.chat",
    }

    def __init__(
        self,
        name: str,
        endpoint: str,
        headers: Optional[Dict[str, str]] = None,
        timeout: int = 12,
        max_retries: int = 3,
        adapter: str = "openai.chat",
        session: Optional[requests.Session] = None,
    ):
        self.name = name
        self.endpoint = endpoint
        self.headers = headers or {}
        self.timeout = int(timeout)
        self.max_retries = int(max_retries)
        self.adapter = (adapter or "openai.chat").lower()
        self._session = session or requests.Session()

    @classmethod
    def register_adapter(cls, key: str, fn: Callable[["ModelConnector", str, Optional[List[Dict[str, str]]], Optional[str]], Tuple[str, Dict[str, Any]]]) -> None:
        cls._ADAPTERS[key.lower()] = fn

    @classmethod
    def register_alias(cls, alias: str, target: str) -> None:
        cls._ALIASES[alias.lower()] = target.lower()

    def _resolve_adapter(self) -> str:
        a = (self.adapter or "").lower()
        return self._ALIASES.get(a, a)

    def _post(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        last_err = None
        for attempt in range(1, self.max_retries + 1):
            try:
                r = self._session.post(self.endpoint, json=payload, headers=self.headers, timeout=self.timeout)
                if r.status_code >= 400:
                    raise RuntimeError(f"{self.name} HTTP {r.status_code}: {r.text[:200]}")
                try:
                    return r.json()
                except Exception:
                    return {"text": r.text}
            except Exception as e:
                last_err = e
                time.sleep(min(0.25 * attempt, 1.5))
        raise RuntimeError(f"{self.name} request failed after {self.max_retries} retries: {last_err}")

    def health_check(self) -> bool:
        """Return True if degraded/unhealthy, False if healthy."""
        try:
            r = self._session.options(self.endpoint, headers=self.headers, timeout=min(self.timeout, 4))
            return r.status_code >= 400
        except Exception:
            return True

    def infer(self, prompt: str, *, history: Optional[List[Dict[str, str]]] = None, model_name: Optional[str] = None) -> Tuple[str, Dict[str, Any]]:
        key = self._resolve_adapter()
        fn = self._ADAPTERS.get(key) or self._ADAPTERS.get("generic.json")
        return fn(self, prompt, history, model_name)  # (text, meta)

# ---- utilities for adapters ----
def _first_str(d: Any, keys: Tuple[str, ...]) -> Optional[str]:
    if isinstance(d, dict):
        for k in keys:
            v = d.get(k)
            if isinstance(v, str) and v.strip():
                return v
    return None

# ---- adapters ----
def _adapt_openai_chat(self: ModelConnector, prompt, history, model_name):
    msgs = [{"role": m["role"], "content": m["content"]} for m in (history or []) if m.get("role") in {"system","user","assistant"} and "content" in m]
    msgs.append({"role":"user","content":prompt})
    payload = {"model": model_name or self.name, "messages": msgs, "temperature": 0.2}
    data = self._post(payload)
    text = ""
    try:
        text = data["choices"][0]["message"]["content"]
    except Exception:
        text = _first_str(data, ("text","output","answer","completion")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

def _adapt_openai_responses(self: ModelConnector, prompt, history, model_name):
    payload = {"model": model_name or self.name, "input":[{"role":"user","content":[{"type":"text","text":prompt}]}]}
    data = self._post(payload)
    text = data.get("output_text") or _first_str(data, ("text","answer","completion")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

def _adapt_anthropic_messages(self: ModelConnector, prompt, history, model_name):
    msgs = [{"role": m["role"], "content": m["content"]} for m in (history or []) if m.get("role") in {"user","assistant"} and "content" in m]
    if not msgs or msgs[-1]["role"] != "user":
        msgs.append({"role":"user","content":prompt})
    payload = {"model": model_name or self.name, "messages": msgs, "max_tokens": 512, "temperature": 0.2}
    data = self._post(payload)
    parts = data.get("content")
    if isinstance(parts, list) and parts and isinstance(parts[0], dict) and "text" in parts[0]:
        text = parts[0]["text"]
    else:
        text = data.get("text") or _first_str(data, ("answer","completion","output","text")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

def _adapt_gemini_generate(self: ModelConnector, prompt, history, model_name):
    contents = [{"role":"user","parts":[{"text":prompt}]}]
    payload = {"model": model_name or self.name, "contents": contents, "generationConfig":{"temperature":0.2}}
    data = self._post(payload)
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        text = _first_str(data, ("text","output","answer","completion")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

def _adapt_cohere_chat(self: ModelConnector, prompt, history, model_name):
    chat_hist=[]
    for m in (history or []):
        r,c=m.get("role"),m.get("content")
        if r in {"USER","user"}: chat_hist.append({"role":"USER","message":c})
        elif r in {"CHATBOT","assistant"}: chat_hist.append({"role":"CHATBOT","message":c})
    payload={"model":model_name or self.name,"message":prompt,"chat_history":chat_hist}
    data=self._post(payload)
    text=data.get("text") or data.get("reply") or data.get("answer") or json.dumps(data)[:1000]
    return text, {"usage": data.get("meta") or data.get("usage")}

def _adapt_cohere_generate(self: ModelConnector, prompt, history, model_name):
    payload={"model":model_name or self.name,"prompt":prompt}
    data=self._post(payload)
    try:
        text=data["generations"][0]["text"]
    except Exception:
        text=_first_str(data, ("text","output","answer","completion")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("meta") or data.get("usage")}

def _adapt_tgi_generate(self: ModelConnector, prompt, history, model_name):
    payload={"inputs":prompt,"parameters":{"temperature":0.2}}
    data=self._post(payload)
    if isinstance(data, dict):
        text = data.get("generated_text") or _first_str(data, ("text","output","answer","completion")) or json.dumps(data)[:1000]
    elif isinstance(data, list) and data:
        text = data[0].get("generated_text") or json.dumps(data[0])[:1000]
    else:
        text = json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

def _adapt_generic_json(self: ModelConnector, prompt, history, model_name):
    payload={"model":model_name or self.name,"prompt":prompt,"history":history or []}
    data=self._post(payload)
    text=_first_str(data, ("text","output","answer","completion")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

ModelConnector.register_adapter("openai.chat", _adapt_openai_chat)
ModelConnector.register_adapter("openai.responses", _adapt_openai_responses)
ModelConnector.register_adapter("anthropic.messages", _adapt_anthropic_messages)
ModelConnector.register_adapter("gemini.generate", _adapt_gemini_generate)
ModelConnector.register_adapter("cohere.chat", _adapt_cohere_chat)
ModelConnector.register_adapter("cohere.generate", _adapt_cohere_generate)
ModelConnector.register_adapter("tgi.generate", _adapt_tgi_generate)
ModelConnector.register_adapter("generic.json", _adapt_generic_json)

# =========================================================
# Web retrieval (+ BeautifulSoup enrichment with retries)
# =========================================================
@dataclass
class WebSource:
    url: str
    title: Optional[str] = None
    snippet: Optional[str] = None
    image: Optional[str] = None
    score: Optional[float] = None

class SearchProvider:
    name: str = "base"
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        raise NotImplementedError

class _BaseHTTPProvider(SearchProvider):
    def __init__(self, timeout: int = 10, session: Optional[requests.Session] = None):
        self.timeout = int(timeout)
        self._session = session or requests.Session()

# Generic JSON gateway
class GenericJSONSearch(_BaseHTTPProvider):
    name = "generic.json"
    def __init__(self, endpoint: str, headers: Optional[Dict[str,str]] = None, timeout: int = 10, session: Optional[requests.Session] = None):
        super().__init__(timeout=timeout, session=session)
        if not _is_https(endpoint):
            raise ValueError("Search endpoint must be HTTPS")
        self.endpoint, self.headers = endpoint, (headers or {})
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        def _do():
            r = self._session.post(self.endpoint, json={"q": query, "k": int(k), "images": bool(images)},
                                   headers=self.headers, timeout=self.timeout)
            r.raise_for_status()
            return r
        r = _retry_call(_do)
        data = r.json() if r.headers.get("content-type","").startswith("application/json") else {}
        out=[]
        for it in data.get("results", []):
            u = it.get("url")
            if isinstance(u, str) and _is_https(u):
                out.append(WebSource(url=u, title=it.get("title"), snippet=it.get("snippet"),
                                     image=(it.get("image") if images else None), score=it.get("score")))
        return out[:k]

# Tavily
class TavilySearch(_BaseHTTPProvider):
    name = "tavily"
    def __init__(self, api_key: str, timeout: int = 10, session: Optional[requests.Session] = None):
        super().__init__(timeout=timeout, session=session)
        self.api_key = api_key
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        url = "https://api.tavily.com/search"
        payload = {"api_key": self.api_key, "query": query, "max_results": int(k), "include_images": bool(images)}
        def _do():
            r = self._session.post(url, json=payload, timeout=self.timeout)
            r.raise_for_status(); return r
        r = _retry_call(_do)
        data = r.json(); out=[]
        for it in data.get("results", []):
            u = it.get("url")
            if isinstance(u, str) and _is_https(u):
                out.append(WebSource(url=u, title=it.get("title"), snippet=it.get("content"), image=it.get("image")))
        return out[:k]

# Bing
class BingWebSearch(_BaseHTTPProvider):
    name = "bing"
    def __init__(self, api_key: str, timeout: int = 10, session: Optional[requests.Session] = None):
        super().__init__(timeout=timeout, session=session)
        self.api_key = api_key
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        def _do_web():
            url = f"https://api.bing.microsoft.com/v7.0/search?q={requests.utils.quote(query)}&count={int(k)}"
            r = self._session.get(url, headers={"Ocp-Apim-Subscription-Key": self.api_key}, timeout=self.timeout)
            r.raise_for_status(); return r
        r = _retry_call(_do_web)
        data = r.json()
        items = (data.get("webPages") or {}).get("value", []); out=[]
        for it in items:
            u = it.get("url")
            if isinstance(u, str) and _is_https(u):
                out.append(WebSource(url=u, title=it.get("name"), snippet=it.get("snippet")))
        if images:
            def _do_img():
                iu = f"https://api.bing.microsoft.com/v7.0/images/search?q={requests.utils.quote(query)}&count={int(k)}"
                ir = self._session.get(iu, headers={"Ocp-Apim-Subscription-Key": self.api_key}, timeout=self.timeout)
                ir.raise_for_status(); return ir
            ir = _retry_call(_do_img)
            idata = ir.json()
            for i in (idata.get("value") or [])[:k]:
                cu = i.get("contentUrl"); hp = i.get("hostPageUrl")
                if isinstance(cu, str) and _is_https(cu) and isinstance(hp, str) and _is_https(hp):
                    out.append(WebSource(url=hp, title=i.get("name"), image=cu))
        return out[:max(k, len(out))]

# Google Custom Search
class GoogleCSESearch(_BaseHTTPProvider):
    name = "google.cse"
    def __init__(self, api_key: str, cx: str, timeout: int = 10, session: Optional[requests.Session] = None):
        super().__init__(timeout=timeout, session=session)
        self.key, self.cx = api_key, cx
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        base = "https://www.googleapis.com/customsearch/v1"
        def _do_search():
            params = {"key": self.key, "cx": self.cx, "q": query, "num": int(min(10, k))}
            r = self._session.get(base, params=params, timeout=self.timeout); r.raise_for_status(); return r
        r = _retry_call(_do_search)
        data = r.json(); out=[]
        for it in data.get("items", [])[:k]:
            link = it.get("link")
            if isinstance(link, str) and _is_https(link):
                out.append(WebSource(url=link, title=it.get("title"), snippet=it.get("snippet")))
        if images:
            def _do_img():
                params_img = {"key": self.key, "cx": self.cx, "q": query, "searchType":"image", "num": int(min(10, k))}
                ir = self._session.get(base, params=params_img, timeout=self.timeout); ir.raise_for_status(); return ir
            ir = _retry_call(_do_img)
            idata = ir.json()
            for i in idata.get("items", [])[:k]:
                link = (i.get("image", {}) or {}).get("contextLink") or i.get("link")
                if isinstance(link, str) and _is_https(link):
                    out.append(WebSource(url=link, title=i.get("title"), image=i.get("link")))
        return out[:max(k, len(out))]

# DuckDuckGo (HTML) via BeautifulSoup
class DuckDuckGoHTMLSearch(_BaseHTTPProvider):
    name = "duckduckgo.html"
    UA = "Mozilla/5.0 (X11; Linux x86_64) NexusEngine/1.0"
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        def _do():
            url = f"https://duckduckgo.com/html/?q={quote_plus(query)}"
            r = self._session.get(url, headers={"User-Agent": self.UA}, timeout=self.timeout)
            r.raise_for_status(); return r
        r = _retry_call(_do)
        soup = BeautifulSoup(r.text, "html.parser")
        out: List[WebSource] = []
        for res in soup.select("div.result"):
            a = res.select_one("a.result__a")
            if not a:
                a = res.find("a", attrs={"class": lambda c: c and "result__a" in c})
            if not a or not a.get("href"):
                continue
            href = a.get("href")
            if not isinstance(href, str) or not href.startswith("http"):
                continue
            if not _is_https(href):
                continue
            title = a.get_text(" ", strip=True)
            sn = res.select_one("a.result__snippet") or res.select_one("div.result__snippet")
            snippet = sn.get_text(" ", strip=True) if sn else None
            out.append(WebSource(url=href, title=title, snippet=snippet))
            if len(out) >= k:
                break
        return out

# Minimal HTML scraper (with retry) to enrich pages
class HtmlScraper:
    UA = "Mozilla/5.0 (X11; Linux x86_64) NexusEngine/1.0"
    def __init__(self, timeout: int = 8, session: Optional[requests.Session] = None):
        self.timeout = int(timeout)
        self._session = session or requests.Session()
    def enrich(self, src: WebSource) -> WebSource:
        def _do():
            return self._session.get(src.url, headers={"User-Agent": self.UA}, timeout=self.timeout)
        try:
            r = _retry_call(_do)
            if not r.ok:
                return src
            soup = BeautifulSoup(r.text, "html.parser")
            title = src.title or (soup.title.get_text(strip=True) if soup.title else None)
            meta_desc = soup.find("meta", attrs={"name":"description"}) or soup.find("meta", attrs={"property":"og:description"})
            desc = src.snippet or (meta_desc.get("content").strip() if meta_desc and meta_desc.get("content") else None)
            if not desc:
                p = soup.find("p")
                if p:
                    desc = p.get_text(" ", strip=True)
            og_img = (soup.find("meta", attrs={"property":"og:image"})
                      or soup.find("meta", attrs={"name":"og:image"})
                      or soup.find("meta", attrs={"name":"twitter:image"}))
            image = src.image or (og_img.get("content") if og_img and og_img.get("content") else None)
            return WebSource(url=src.url, title=title, snippet=desc, image=image, score=src.score)
        except Exception:
            return src

# Orchestrator
class WebRetriever:
    def __init__(self, providers: List[SearchProvider], scraper: Optional[HtmlScraper] = None):
        if not providers: raise RuntimeError("At least one search provider is required")
        self.providers = providers
        self.scraper = scraper
    def search_all(self, query: str, *, k_per_provider: int = 5, want_images: bool = False, max_total: int = 12) -> List[WebSource]:
        results: List[WebSource] = []
        with ThreadPoolExecutor(max_workers=min(8, len(self.providers))) as pool:
            futs = [pool.submit(p.search, query, k=k_per_provider, images=want_images) for p in self.providers]
            for f in as_completed(futs):
                try: results.extend(f.result() or [])
                except Exception as e: log.warning("search provider failed: %s", e)
        uniq: List[WebSource] = []
        seen = set()
        for s in results:
            if s.url not in seen:
                seen.add(s.url)
                uniq.append(self.scraper.enrich(s) if self.scraper else s)
        return uniq[:max_total]

# =========================================================
# Result policies
# =========================================================
class ResultPolicy:
    name: str = "base"
    def aggregate(self, prompt: str, *, answers: Dict[str, str], latencies: Dict[str, float],
                  errors: Dict[str, str], metas: Dict[str, Dict[str, Any]],
                  context: Optional[List[Dict[str, str]]] = None, params: Optional[Dict[str, Any]] = None
                  ) -> Dict[str, Any]:
        raise NotImplementedError

class FastestPolicy(ResultPolicy):
    name = "fastest"
    def aggregate(self, prompt, *, answers, latencies, errors, metas, context=None, params=None):
        if not answers: return {"result":"", "winner":None, "policy":self.name, "reason":"no answer"}
        winner = min(answers.keys(), key=lambda k: latencies.get(k, 9e9))
        return {"result": answers[winner], "winner": winner, "policy": self.name}

class ConsensusSimplePolicy(ResultPolicy):
    name = "consensus.simple"
    @staticmethod
    def _tokset(s: str) -> set: return set((s or "").lower().split())
    @staticmethod
    def _jac(a: set, b: set) -> float:
        if not a and not b: return 0.0
        return len(a & b) / float(len(a | b) or 1)
    def aggregate(self, prompt, *, answers, latencies, errors, metas, context=None, params=None):
        if not answers: return {"result":"", "winner":None, "policy":self.name, "reason":"no answer"}
        toks = {k: self._tokset(v) for k, v in answers.items()}
        scores = {}
        for k in answers.keys():
            others = [self._jac(toks[k], toks[o]) for o in toks.keys() if o != k]
            scores[k] = sum(others)/len(others) if others else 0.0
        winner = max(scores, key=scores.get)
        return {"result": answers[winner], "winner": winner, "policy": self.name}

_POLICIES: Dict[str, ResultPolicy] = {
    FastestPolicy.name: FastestPolicy(),
    ConsensusSimplePolicy.name: ConsensusSimplePolicy(),
}
def get_policy(name: Optional[str]) -> ResultPolicy:
    return _POLICIES.get((name or "").lower(), _POLICIES["consensus.simple"])

# =========================================================
# Config + helpers
# =========================================================
@dataclass
class EngineConfig:
    max_context_messages: int = 8
    max_parallel: Optional[int] = None
    default_policy: str = os.getenv("NEXUS_RESULT_POLICY", "consensus.simple")
    min_sources_required: int = max(1, int(os.getenv("NEXUS_MIN_SOURCES", "2")))
    search_k_per_provider: int = 5
    search_max_total: int = 12
    scrape_timeout: int = 8

_CODE_RE = re.compile(r"```(?P<lang>[a-zA-Z0-9_\-+. ]*)\n(?P<body>[\s\S]*?)```", re.MULTILINE)

def _extract_code_blocks(text: str) -> List[Dict[str, str]]:
    blocks: List[Dict[str, str]] = []
    for m in _CODE_RE.finditer(text or ""):
        lang = (m.group("lang") or "").strip() or None
        body = (m.group("body") or "").strip()
        if body: blocks.append({"language": lang, "code": body})
    return blocks

_STOP = set("""
a an the and or but if while then of in on for with without about across against between into through during before after above below to from up down under over again further
is are was were be been being do does did doing have has had having i you he she it we they them me my your our their this that these those as at by can could should would will may might
""".split())

def _keywords(s: str, k: int = 24) -> List[str]:
    toks = re.findall(r"[A-Za-z0-9_]{3,}", (s or "").lower())
    toks = [t for t in toks if t not in _STOP]
    seen, out = set(), []
    for t in toks:
        if t not in seen:
            seen.add(t); out.append(t)
        if len(out) >= k:
            break
    return out

def _evidence_score(answer_text: str, title: Optional[str], snippet: Optional[str]) -> float:
    if not (title or snippet):
        return 0.0
    keys = _keywords(answer_text)
    hay = f"{title or ''} {snippet or ''}".lower()
    matches = sum(1 for k in keys if k in hay)
    return matches / float(max(1, len(keys)))

# =========================================================
# Engine — strict schema + verified sources
# =========================================================
class Engine:
    """
    Returns payload with ALL non-optional keys:
      {
        "answer": str,
        "winner": str,
        "winner_ref": { "name": str, "adapter": str, "endpoint": str },
        "participants": [str, ...],
        "code": [ {language, code}, ... ],
        "sources": [ {url, title, snippet}, ... ],  # verified ≥ min_sources_required
        "photos": [ {url, caption}, ... ]
      }
    """
    def __init__(self, connectors: Dict[str, ModelConnector], *,
                 memory=None, web: WebRetriever, config: Optional[EngineConfig] = None):
        if not connectors:
            raise RuntimeError("No connectors configured.")
        if web is None:
            raise RuntimeError("WebRetriever is required (verification sources are mandatory).")
        self.connectors = connectors
        self.memory = memory
        self.web = web
        self.config = config or EngineConfig()
        if self.config.max_parallel is None:
            self.config.max_parallel = min(16, max(1, len(connectors)))
        self.scraper = HtmlScraper(timeout=self.config.scrape_timeout)

        # --- Autonomous health monitor (optional auto-start) ---
        self._health_monitor: Optional[HealthMonitor] = None
        if os.getenv("NEXUS_HEALTH_AUTORUN", "1") not in {"0", "false", "False"}:
            interval = int(os.getenv("NEXUS_HEALTH_INTERVAL_SEC", "3600"))
            self.start_health_monitor(interval_seconds=interval)

    # ---- Health monitor control/snapshots ----
    def start_health_monitor(self, interval_seconds: int = 3600) -> None:
        if self._health_monitor and self._health_monitor.is_running:
            return
        self._health_monitor = HealthMonitor(self, interval_seconds=interval_seconds)
        self._health_monitor.start()

    def stop_health_monitor(self) -> None:
        if self._health_monitor:
            self._health_monitor.stop()
            self._health_monitor = None

    def health_snapshot(self) -> Dict[str, Any]:
        if self._health_monitor:
            return self._health_monitor.snapshot()
        # One-off compute if monitor is not running
        mon = HealthMonitor(self, interval_seconds=10, autostart=False)
        return mon.run_once()

    def run_health_check_once(self) -> Dict[str, Any]:
        if self._health_monitor:
            return self._health_monitor.run_once()
        return self.health_snapshot()

    # ---- Engine core ----
    def _history_for(self, session_id: str) -> List[Dict[str, str]]:
        try:
            if not self.memory: return []
            msgs = self.memory.recent(session_id, limit=self.config.max_context_messages)
            out=[]
            for m in msgs:
                r,t=m.get("role"),m.get("text")
                if r in {"system","user","assistant"} and isinstance(t,str):
                    out.append({"role": r, "content": t})
            return out
        except Exception:
            return []

    def _infer_one(self, name: str, conn: ModelConnector, prompt: str, history: List[Dict[str, str]]) -> Tuple[str, str, float]:
        t0 = time.time()
        try:
            text, _meta = conn.infer(prompt, history=history, model_name=name)
            return name, text, round(time.time()-t0, 3)
        except Exception:
            return name, "", round(time.time()-t0, 3)

    def _collect_sources(self, queries: List[str], *, want_images: bool, k_per_provider: int, max_total: int) -> List[WebSource]:
        results: List[WebSource] = []
        for q in queries:
            if len(results) >= max_total: break
            try:
                batch = self.web.search_all(q, k_per_provider=k_per_provider, want_images=want_images, max_total=max_total)
                seen = {s.url for s in results}
                for s in batch:
                    if s.url not in seen:
                        results.append(self.scraper.enrich(s))
                        seen.add(s.url)
            except Exception as e:
                log.warning("web search failed: %s", e)
        return results[:max_total]

    def _rank_and_verify(self, answer_text: str, sources: List[WebSource], need: int) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        scored: List[Tuple[float, WebSource]] = []
        for s in sources:
            sc = _evidence_score(answer_text, s.title, s.snippet)
            scored.append((sc, s))
        scored.sort(key=lambda x: x[0], reverse=True)

        web_refs: List[Dict[str, Any]] = []
        photos: List[Dict[str, Any]] = []
        for sc, s in scored:
            if s.url and (s.title or s.snippet):
                web_refs.append({"url": s.url, "title": s.title, "snippet": s.snippet})
                if s.image:
                    photos.append({"url": s.image, "caption": s.title})
            if len(web_refs) >= need:
                break
        return web_refs, photos

    def run(self, session_id: str, query: str, *,
            policy_name: Optional[str] = None,
            want_photos: bool = False) -> Dict[str, Any]:

        if self.memory:
            try: self.memory.save(session_id, "user", query, {"ephemeral": False})
            except Exception: log.warning("memory save failed", exc_info=True)

        history = self._history_for(session_id)
        participants = list(self.connectors.keys())

        # 1) Run models in parallel
        answers: Dict[str, str] = {}
        latencies: Dict[str, float] = {}
        with ThreadPoolExecutor(max_workers=int(self.config.max_parallel or 4)) as pool:
            futs = [pool.submit(self._infer_one, n, c, query, history) for n, c in self.connectors.items()]
            for f in as_completed(futs):
                name, text, dt = f.result()
                latencies[name] = dt
                if text: answers[name] = text
        if not answers:
            raise RuntimeError("No model produced an answer.")

        # 2) Policy
        policy = get_policy(policy_name or self.config.default_policy)
        agg = policy.aggregate(query, answers=answers, latencies=latencies, errors={}, metas={}, context=history, params=None)
        winner = agg.get("winner") or min(answers.keys(), key=lambda k: latencies.get(k, 9e9))
        answer_text = (agg.get("result") or answers[winner]).strip()

        # 3) Web verification (mandatory)
        sources = self._collect_sources(
            queries=[query, answer_text],
            want_images=want_photos,
            k_per_provider=self.config.search_k_per_provider,
            max_total=self.config.search_max_total,
        )
        web_refs, photos = self._rank_and_verify(answer_text, sources, self.config.min_sources_required)

        if len(web_refs) < self.config.min_sources_required:
            salient = answer_text.split(".")[0].strip()
            if salient:
                extra = self._collect_sources(
                    queries=[f"\"{salient}\""],
                    want_images=False,
                    k_per_provider=max(2, self.config.search_k_per_provider//2),
                    max_total=self.config.search_max_total,
                )
                extra_refs, _ = self._rank_and_verify(answer_text, extra, self.config.min_sources_required - len(web_refs))
                for r in extra_refs:
                    if all(r["url"] != e["url"] for e in web_refs):
                        web_refs.append(r)
                        if len(web_refs) >= self.config.min_sources_required:
                            break

        if len(web_refs) < self.config.min_sources_required:
            raise RuntimeError(f"Insufficient verification sources (need ≥ {self.config.min_sources_required}).")

        # 4) Extract code
        code_blocks = _extract_code_blocks(answer_text)

        # 5) Persist assistant
        if self.memory:
            try: self.memory.save(session_id, "assistant", answer_text, {"ephemeral": False})
            except Exception: log.warning("memory save (assistant) failed", exc_info=True)

        # 6) Winner ref
        wconn = self.connectors.get(winner)
        winner_ref = {
            "name": winner,
            "adapter": getattr(wconn, "adapter", None),
            "endpoint": getattr(wconn, "endpoint", None),
        }

        # 7) Strict schema
        return {
            "answer": answer_text,
            "winner": winner,
            "winner_ref": winner_ref,
            "participants": participants,
            "code": code_blocks,
            "sources": web_refs,                 # verified (>= min_sources_required)
            "photos": photos if want_photos else [],
        }

# =========================================================
# Health Monitor (autonomous backend checks)
# =========================================================
@dataclass
class HealthConfig:
    interval_seconds: int = int(os.getenv("NEXUS_HEALTH_INTERVAL_SEC", "3600"))  # default: 1 hour
    search_probe: str = os.getenv("NEXUS_HEALTH_SEARCH_QUERY", "nexus health check")
    include_memory_check: bool = True

class HealthMonitor:
    def __init__(self, engine: Engine, interval_seconds: int = 3600, autostart: bool = True):
        self.engine = engine
        self.cfg = HealthConfig(interval_seconds=interval_seconds)
        self._thread: Optional[threading.Thread] = None
        self._stop = threading.Event()
        self._lock = threading.Lock()
        self._last: Dict[str, Any] = {"ts": 0, "ok": False, "components": {}}
        self.is_running = False
        if autostart:
            self.start()

    def start(self) -> None:
        if self.is_running:
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._loop, name="NexusHealthMonitor", daemon=True)
        self._thread.start()
        self.is_running = True
        log.info("Health monitor started (interval=%ss)", self.cfg.interval_seconds)

    def stop(self) -> None:
        if not self.is_running:
            return
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=5.0)
        self.is_running = False
        log.info("Health monitor stopped")

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            return json.loads(json.dumps(self._last))  # deep copy

    # One-off health run
    def run_once(self) -> Dict[str, Any]:
        result = self._compute()
        with self._lock:
            self._last = result
        return result

    # Internal loop
    def _loop(self) -> None:
        while not self._stop.is_set():
            t0 = time.time()
            try:
                self.run_once()
            except Exception as e:
                log.warning("health monitor failed: %s", e)
            # sleep until next interval (respecting time spent)
            elapsed = time.time() - t0
            to_sleep = max(10.0, self.cfg.interval_seconds - elapsed)
            self._stop.wait(to_sleep)

    # Compute current health
    def _compute(self) -> Dict[str, Any]:
        ts = int(time.time())
        components: Dict[str, Any] = {}

        # Node stats
        components["node"] = self._node_health()

        # Connectors
        connectors: Dict[str, Any] = {}
        for name, conn in self.engine.connectors.items():
            t0 = time.time()
            degraded = True
            err = None
            try:
                degraded = conn.health_check()
            except Exception as e:
                err = str(e)
            connectors[name] = {
                "degraded": bool(degraded),
                "latency_ms": int((time.time()-t0)*1000),
                "adapter": getattr(conn, "adapter", None),
                "endpoint": getattr(conn, "endpoint", None),
                "error": err,
            }
        components["connectors"] = connectors

        # Web providers probe (search + optional scrape of first result)
        web: Dict[str, Any] = {}
        if self.engine.web:
            for p in self.engine.web.providers:
                t0 = time.time()
                ok = False
                err = None
                enriched = False
                try:
                    results = p.search(self.cfg.search_probe, k=1, images=False) or []
                    ok = len(results) > 0
                    if ok and self.engine.scraper:
                        s0 = time.time()
                        _ = self.engine.scraper.enrich(results[0])
                        enriched = True
                        _ = (time.time() - s0)
                except Exception as e:
                    err = str(e)
                web[p.name] = {
                    "ok": bool(ok),
                    "enriched": bool(enriched),
                    "latency_ms": int((time.time()-t0)*1000),
                    "error": err,
                }
        components["web"] = web

        # Memory check (non-destructive, ephemeral)
        mem = {}
        if self.cfg.include_memory_check and self.engine.memory is not None:
            t0 = time.time()
            try:
                sid = "__health__"
                self.engine.memory.save(sid, "system", "__ping__", {"ephemeral": True})
                got = self.engine.memory.recent(sid, limit=1)
                mem = {"ok": bool(got), "latency_ms": int((time.time()-t0)*1000)}
            except Exception as e:
                mem = {"ok": False, "error": str(e)}
        components["memory"] = mem

        ok_overall = self._overall_ok(components)
        return {"ts": ts, "ok": ok_overall, "components": components}

    @staticmethod
    def _overall_ok(components: Dict[str, Any]) -> bool:
        # Healthy if: all connectors not degraded AND at least one web provider ok AND memory ok (if present)
        conns = components.get("connectors", {})
        web = components.get("web", {})
        mem = components.get("memory", {"ok": True})  # if none, don't fail here
        all_conns_ok = all(not v.get("degraded", True) for v in conns.values()) if conns else True
        any_web_ok = any(v.get("ok") for v in web.values()) if web else True
        mem_ok = bool(mem.get("ok", True))
        return all_conns_ok and any_web_ok and mem_ok

    @staticmethod
    def _node_health() -> Dict[str, Any]:
        info: Dict[str, Any] = {"pid": os.getpid(), "time": int(time.time())}
        # CPU
        try:
            import psutil  # type: ignore
            info["cpu_percent"] = psutil.cpu_percent(interval=0.0)
            vm = psutil.virtual_memory()
            info["memory"] = {"total": vm.total, "available": vm.available, "used": vm.used, "percent": vm.percent}
        except Exception:
            info["cpu_percent"] = None
            # memory fallback
            info["memory"] = {"total": None, "available": None, "used": None, "percent": None}
        # Load avg
        try:
            la1, la5, la15 = os.getloadavg()
            info["load"] = {"1": la1, "5": la5, "15": la15}
        except Exception:
            info["load"] = {"1": None, "5": None, "15": None}
        # Disk
        try:
            total, used, free = shutil.disk_usage(os.getcwd())
            info["disk"] = {"total": total, "used": used, "free": free, "percent": round(used/total*100, 2) if total else None}
        except Exception:
            info["disk"] = {"total": None, "used": None, "free": None, "percent": None}
        return info

# =========================================================
# Secrets-aware web retriever builder
# =========================================================
try:
    from nexus_config import SecretResolver  # your existing resolver
except Exception:
    SecretResolver = None  # type: ignore

def _ensure_resolver(resolver: Optional["SecretResolver"]) -> "SecretResolver":
    if resolver:
        return resolver
    if SecretResolver is None:
        raise RuntimeError("SecretResolver not available; ensure nexus_config.py is on PYTHONPATH.")
    providers = [s.strip().lower() for s in os.getenv("NEXUS_SECRETS_PROVIDERS", "aws,azure,gcp").split(",") if s.strip()]
    overrides: Dict[str, str] = {k: v for k, v in os.environ.items() if k.startswith("NEXUS_SECRET_")}
    for k in ("AZURE_KEYVAULT_URL", "GCP_PROJECT"):
        v = os.getenv(k)
        if v:
            overrides[k] = v
    ttl = int(os.getenv("NEXUS_SECRET_TTL_SECONDS", "600"))
    return SecretResolver(providers=providers, overrides=overrides, ttl_seconds=ttl)

def build_web_retriever_from_env(
    headers: Optional[Dict[str, str]] = None,
    resolver: Optional["SecretResolver"] = None,
) -> Optional[WebRetriever]:
    """
    All API keys/tokens are resolved via cloud secrets (SecretResolver). No hardcoded secrets.
    Logical secret names supported (configured via NEXUS_SECRET_<NAME> indirection):
      - SEARCH_GATEWAY_ENDPOINT (optional; may be secret-managed)
      - SEARCH_GATEWAY_KEY
      - TAVILY_API_KEY
      - BING_SEARCH_KEY
      - GOOGLE_CSE_KEY
      - GOOGLE_CSE_CX
    """
    r = _ensure_resolver(resolver)
    providers: List[SearchProvider] = []
    base_headers = dict(headers or {})
    sess = requests.Session()

    # Generic JSON gateway (optional)
    gen_ep = r.get("SEARCH_GATEWAY_ENDPOINT") or os.getenv("NEXUS_SEARCH_ENDPOINT")
    gen_key = r.get("SEARCH_GATEWAY_KEY")
    if gen_ep:
        hdrs = dict(base_headers)
        if gen_key:
            hdrs["Authorization"] = f"Bearer {gen_key}"
        providers.append(GenericJSONSearch(gen_ep, headers=hdrs, session=sess))

    # Tavily
    tav_key = r.get("TAVILY_API_KEY")
    if tav_key:
        providers.append(TavilySearch(tav_key, session=sess))

    # Bing
    bing_key = r.get("BING_SEARCH_KEY")
    if bing_key:
        providers.append(BingWebSearch(bing_key, session=sess))

    # Google CSE
    g_key = r.get("GOOGLE_CSE_KEY")
    g_cx  = r.get("GOOGLE_CSE_CX")
    if g_key and g_cx:
        providers.append(GoogleCSESearch(g_key, g_cx, session=sess))

    # DuckDuckGo HTML (no key)
    if os.getenv("NEXUS_ENABLE_DDG", "1") not in {"0", "false", "False"}:
        providers.append(DuckDuckGoHTMLSearch(session=sess))

    if not providers:
        return None

    scraper = HtmlScraper(timeout=int(os.getenv("NEXUS_SCRAPE_TIMEOUT", "8")), session=sess)
    return WebRetriever(providers, scraper=scraper)


#End of Engine code# 
#Nexus is an advanced orchestration engine for LLMs and memory stores across AWS, Azure, and GCP, designed for secure, scalable AI applications.
# #It supports dynamic secret resolution, multi-cloud memory management, and flexible model connectors.




