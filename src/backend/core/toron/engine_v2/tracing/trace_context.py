"""Trace context propagation helpers."""

from __future__ import annotations

from typing import Any, Dict

from opentelemetry import trace
from opentelemetry.propagate import inject, extract
from opentelemetry.trace import SpanKind


class TraceContext:
    @staticmethod
    def propagate(carrier: Dict[str, Any]):
        inject(carrier)
        return carrier

    @staticmethod
    def link_child(name: str, attributes: Dict[str, Any] | None = None):
        tracer = trace.get_tracer(__name__)
        parent_ctx = trace.get_current_span().get_span_context()
        return tracer.start_as_current_span(
            name,
            context=trace.set_span_in_context(trace.get_current_span()),
            kind=SpanKind.INTERNAL,
            attributes=attributes,
            links=[trace.Link(parent_ctx)],
        )

    @staticmethod
    def extract(carrier: Dict[str, Any]):
        return extract(carrier)

    @staticmethod
    def annotate_request(span, model_used: str | None = None, cache_hit: bool | None = None, latency_ms: float | None = None):
        if span is None:
            return
        if model_used:
            span.set_attribute("model_used", model_used)
        if cache_hit is not None:
            span.set_attribute("cache_hit", cache_hit)
        if latency_ms is not None:
            span.set_attribute("latency_ms", latency_ms)
