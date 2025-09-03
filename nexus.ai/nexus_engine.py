#What is Nexus?

#Nexus is a sophisticated AI engine designed to aggregate and analyze responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries.

#It integrates web scraping capabilities for real-time data retrieval, supports secure data encryption, and offers advanced response aggregation techniques to deliver the best possible answers.

#Nexus is built to be extensible and infinitely scalable, allowing for easy integration of new AI models and data sources, making it a versatile tool for developers and researchers alike, but it is also designed to be user-friendly, with a focus on providing clear and actionable insights.

#Nexus is not just a tool for AI enthusiasts; it is a powerful platform that can be used in various applications, from academic research to business intelligence, and it aims to democratize access to advanced AI capabilities by making Gen AI replies more accurate and more correct.

#Nexus is a cutting-edge AI engine that aggregates and analyzes responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries. 
# Nexus also includes powerful 256-bit AES encryption for secure data handling, ensuring that sensitive information is protected throughout the process.

#It combines the power of multiple AI models with the richness of web data, enabling users to gain deeper insights and make more informed decisions, using AI Modal Debating you will get the best possible answer to your question, by combining the strengths of multiple AI models and traditional search engines and media.

#Nexus was developed by Akshith Konda.

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
# engine.py
# Nexus Engine — strict schema + web verification (Google, Bing, Tavily, DuckDuckGo)
# Adds BeautifulSoup scraping to enrich/verify sources and pull photos (og:image).

from __future__ import annotations

import json, logging, os, re, time, html
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple, Callable
from urllib.parse import urlparse, quote_plus
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup  # NEW

log = logging.getLogger("nexus.engine")
if not log.handlers:
    h = logging.StreamHandler()
    h.setFormatter(logging.Formatter('[%(asctime)s] %(levelname)s %(name)s: %(message)s'))
    log.addHandler(h)
log.setLevel(logging.INFO)

# =============================
# ModelConnector + Adapters
# =============================

class ModelConnector:
    """HTTP connector with pluggable 'adapters' to normalize request/response shapes."""
    _ADAPTERS: Dict[str, Callable[["ModelConnector", str, Optional[List[Dict[str, str]]], Optional[str]], Tuple[str, Dict[str, Any]]]] = {}
    _ALIASES: Dict[str, str] = {
        "mistral.chat":"openai.chat",
        "openrouter.chat":"openai.chat",
        "together.chat":"openai.chat",
        "groq.chat":"openai.chat",
        "deepseek.chat":"openai.chat",
        "perplexity.chat":"openai.chat",
        "pplx.chat":"openai.chat",
        "azure.openai.chat":"openai.chat",
        "github.models":"openai.chat",
    }

    def __init__(self, name: str, endpoint: str, headers: Optional[Dict[str, str]] = None,
                 timeout: int = 12, max_retries: int = 3, adapter: str = "openai.chat"):
        self.name = name
        self.endpoint = endpoint
        self.headers = headers or {}
        self.timeout = int(timeout)
        self.max_retries = int(max_retries)
        self.adapter = (adapter or "openai.chat").lower()

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
                r = requests.post(self.endpoint, json=payload, headers=self.headers, timeout=self.timeout)
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
        try:
            r = requests.options(self.endpoint, headers=self.headers, timeout=min(self.timeout, 4))
            return r.status_code >= 400
        except Exception:
            return True

    def infer(self, prompt: str, *, history: Optional[List[Dict[str, str]]] = None, model_name: Optional[str] = None) -> Tuple[str, Dict[str, Any]]:
        key = self._resolve_adapter()
        fn = self._ADAPTERS.get(key) or self._ADAPTERS.get("generic.json")
        return fn(self, prompt, history, model_name)  # (text, meta)

# ---- adapters (unchanged from prior answer; trimmed for brevity) ----

def _first_str(d: Any, keys: Tuple[str, ...]) -> Optional[str]:
    if isinstance(d, dict):
        for k in keys:
            v = d.get(k)
            if isinstance(v, str) and v.strip():
                return v
    return None

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

# =============================
# Web retrieval (+ BeautifulSoup enrichment)
# =============================

def _is_https(url: str) -> bool:
    try:
        p = urlparse(url); return p.scheme == "https" and bool(p.netloc)
    except Exception: return False

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

class GenericJSONSearch(SearchProvider):
    name = "generic.json"
    def __init__(self, endpoint: str, headers: Optional[Dict[str,str]] = None, timeout: int = 10):
        if not _is_https(endpoint):
            raise ValueError("Search endpoint must be HTTPS")
        self.endpoint, self.headers, self.timeout = endpoint, (headers or {}), int(timeout)
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        r = requests.post(self.endpoint, json={"q": query, "k": int(k), "images": bool(images)},
                          headers=self.headers, timeout=self.timeout)
        r.raise_for_status()
        data = r.json() if r.headers.get("content-type","").startswith("application/json") else {}
        out=[]
        for it in data.get("results", []):
            u = it.get("url")
            if isinstance(u, str) and _is_https(u):
                out.append(WebSource(url=u, title=it.get("title"), snippet=it.get("snippet"),
                                     image=(it.get("image") if images else None), score=it.get("score")))
        return out[:k]

class TavilySearch(SearchProvider):
    name = "tavily"
    def __init__(self, api_key: str, timeout: int = 10):
        self.api_key, self.timeout = api_key, int(timeout)
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        url = "https://api.tavily.com/search"
        payload = {"api_key": self.api_key, "query": query, "max_results": int(k), "include_images": bool(images)}
        r = requests.post(url, json=payload, timeout=self.timeout); r.raise_for_status()
        data = r.json(); out=[]
        for it in data.get("results", []):
            u = it.get("url")
            if isinstance(u, str) and _is_https(u):
                out.append(WebSource(url=u, title=it.get("title"), snippet=it.get("content"), image=it.get("image")))
        return out[:k]

class BingWebSearch(SearchProvider):
    name = "bing"
    def __init__(self, api_key: str, timeout: int = 10):
        self.api_key, self.timeout = api_key, int(timeout)
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        url = f"https://api.bing.microsoft.com/v7.0/search?q={requests.utils.quote(query)}&count={int(k)}"
        r = requests.get(url, headers={"Ocp-Apim-Subscription-Key": self.api_key}, timeout=self.timeout)
        r.raise_for_status(); data = r.json()
        items = (data.get("webPages") or {}).get("value", []); out=[]
        for it in items:
            u = it.get("url")
            if isinstance(u, str) and _is_https(u):
                out.append(WebSource(url=u, title=it.get("name"), snippet=it.get("snippet")))
        if images:
            iu = f"https://api.bing.microsoft.com/v7.0/images/search?q={requests.utils.quote(query)}&count={int(k)}"
            ir = requests.get(iu, headers={"Ocp-Apim-Subscription-Key": self.api_key}, timeout=self.timeout)
            if ir.ok:
                idata = ir.json()
                for i in (idata.get("value") or [])[:k]:
                    cu = i.get("contentUrl"); hp = i.get("hostPageUrl")
                    if isinstance(cu, str) and _is_https(cu) and isinstance(hp, str) and _is_https(hp):
                        out.append(WebSource(url=hp, title=i.get("name"), image=cu))
        return out[:max(k, len(out))]

# NEW: Google Custom Search
class GoogleCSESearch(SearchProvider):
    name = "google.cse"
    def __init__(self, api_key: str, cx: str, timeout: int = 10):
        self.key, self.cx, self.timeout = api_key, cx, int(timeout)
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        base = "https://www.googleapis.com/customsearch/v1"
        params = {"key": self.key, "cx": self.cx, "q": query, "num": int(min(10, k))}
        r = requests.get(base, params=params, timeout=self.timeout); r.raise_for_status()
        data = r.json(); out=[]
        for it in data.get("items", [])[:k]:
            link = it.get("link")
            if isinstance(link, str) and _is_https(link):
                out.append(WebSource(url=link, title=it.get("title"), snippet=it.get("snippet")))
        if images:
            params_img = {"key": self.key, "cx": self.cx, "q": query, "searchType":"image", "num": int(min(10, k))}
            ir = requests.get(base, params=params_img, timeout=self.timeout)
            if ir.ok:
                idata = ir.json()
                for i in idata.get("items", [])[:k]:
                    link = i.get("image", {}).get("contextLink") or i.get("link")
                    if isinstance(link, str) and _is_https(link):
                        out.append(WebSource(url=link, title=i.get("title"), image=i.get("link")))
        return out[:max(k, len(out))]

# NEW: DuckDuckGo (HTML) via BeautifulSoup parsing
class DuckDuckGoHTMLSearch(SearchProvider):
    name = "duckduckgo.html"
    UA = "Mozilla/5.0 (X11; Linux x86_64) NexusEngine/1.0"
    def __init__(self, timeout: int = 10):
        self.timeout = int(timeout)
    def search(self, query: str, *, k: int = 5, images: bool = False) -> List[WebSource]:
        # Lightweight HTML endpoint; parses titles/links/snippets.
        url = f"https://duckduckgo.com/html/?q={quote_plus(query)}"
        r = requests.get(url, headers={"User-Agent": self.UA}, timeout=self.timeout)
        r.raise_for_status()
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
            # DDG may include non-https; filter to https
            if not _is_https(href):
                continue
            title = a.get_text(" ", strip=True)
            sn = res.select_one("a.result__snippet") or res.select_one("div.result__snippet")
            snippet = sn.get_text(" ", strip=True) if sn else None
            out.append(WebSource(url=href, title=title, snippet=snippet))
            if len(out) >= k:
                break
        # Images: we do not use DDG images endpoint here; scraper (below) will pull og:image
        return out

# NEW: Minimal HTML scraper to enrich + verify
class HtmlScraper:
    UA = "Mozilla/5.0 (X11; Linux x86_64) NexusEngine/1.0"
    def __init__(self, timeout: int = 8):
        self.timeout = int(timeout)

    def enrich(self, src: WebSource) -> WebSource:
        try:
            r = requests.get(src.url, headers={"User-Agent": self.UA}, timeout=self.timeout)
            if not r.ok:
                return src
            soup = BeautifulSoup(r.text, "html.parser")
            # title
            title = src.title or (soup.title.get_text(strip=True) if soup.title else None)
            # description
            meta_desc = soup.find("meta", attrs={"name":"description"}) or soup.find("meta", attrs={"property":"og:description"})
            desc = src.snippet or (meta_desc.get("content").strip() if meta_desc and meta_desc.get("content") else None)
            if not desc:
                # fall back to first meaningful paragraph
                p = soup.find("p")
                if p:
                    desc = p.get_text(" ", strip=True)
            # image
            og_img = soup.find("meta", attrs={"property":"og:image"}) or soup.find("meta", attrs={"name":"og:image"})
            image = src.image or (og_img.get("content") if og_img and og_img.get("content") else None)
            return WebSource(url=src.url, title=title, snippet=desc, image=image, score=src.score)
        except Exception:
            return src

# Retriever orchestrator
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
        # de-dup & enrich
        uniq: List[WebSource] = []
        seen = set()
        for s in results:
            if s.url not in seen:
                seen.add(s.url)
                uniq.append(self.scraper.enrich(s) if self.scraper else s)
        return uniq[:max_total]

# =============================
# Result Policies (unchanged)
# =============================

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

# =============================
# Config + helpers
# =============================

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
    # keep top-K unique in order of appearance
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

# =============================
# Engine — strict schema output (+ scrape/verify)
# =============================

class Engine:
    """
    Returns payload with ALL non-optional keys:
      {
        "answer": str,
        "winner": str,
        "participants": [str, ...],
        "code": [ {language, code}, ... ],
        "sources": [ {url, title, snippet}, ... ],  # verified >= min_sources_required
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
                        # ensure enriched via scraper (in case retriever had no scraper)
                        results.append(self.scraper.enrich(s))
                        seen.add(s.url)
            except Exception as e:
                log.warning("web search failed: %s", e)
        return results[:max_total]

    def _rank_and_verify(self, answer_text: str, sources: List[WebSource], need: int) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        # Score by evidence overlap (title+snippet vs answer keywords)
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

        # 1) Run models
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
            # Try a salient sentence quote
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

        # 6) Strict schema
        return {
            "answer": answer_text,
            "winner": winner,
            "participants": participants,
            "code": code_blocks,
            "sources": web_refs,                 # verified (>= min_sources_required)
            "photos": photos if want_photos else [],
        }

# =============================
# Builder: WebRetriever from env
# =============================

def build_web_retriever_from_env(headers: Optional[Dict[str, str]] = None) -> Optional[WebRetriever]:
    providers: List[SearchProvider] = []
    hdrs = dict(headers or {})

    # Generic JSON search gateway (optional)
    gen_ep = os.getenv("NEXUS_SEARCH_ENDPOINT")
    gen_key = os.getenv("NEXUS_SEARCH_KEY")
    if gen_ep:
        if gen_key: hdrs["Authorization"] = f"Bearer {gen_key}"
        providers.append(GenericJSONSearch(gen_ep, headers=hdrs))

    # Tavily (optional)
    tav_key = os.getenv("TAVILY_API_KEY")
    if tav_key: providers.append(TavilySearch(tav_key))

    # Bing (optional)
    bing_key = os.getenv("BING_SEARCH_KEY")
    if bing_key: providers.append(BingWebSearch(bing_key))

    # Google CSE (NEW; official)
    g_key = os.getenv("GOOGLE_CSE_KEY")
    g_cx  = os.getenv("GOOGLE_CSE_CX")
    if g_key and g_cx:
        providers.append(GoogleCSESearch(g_key, g_cx))

    # DuckDuckGo HTML (NEW; no key)
    if os.getenv("NEXUS_ENABLE_DDG", "1") not in {"0", "false", "False"}:
        providers.append(DuckDuckGoHTMLSearch())

    scraper = HtmlScraper(timeout=int(os.getenv("NEXUS_SCRAPE_TIMEOUT", "8")))
    return WebRetriever(providers, scraper=scraper) if providers else None



#End of Engine code# 
#Nexus is an advanced orchestration engine for LLMs and memory stores across AWS, Azure, and GCP, designed for secure, scalable AI applications.
# #It supports dynamic secret resolution, multi-cloud memory management, and flexible model connectors.

