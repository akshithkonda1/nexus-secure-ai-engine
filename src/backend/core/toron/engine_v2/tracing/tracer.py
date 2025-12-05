"""Toron OpenTelemetry tracer provider and helpers."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Dict, Optional

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from .instrumentation import setup_instrumentation


class ToronTracer:
    """Central tracing entry-point for Toron Engine v2."""

    def __init__(self, service_name: str = "toron-engine-v2", endpoint: Optional[str] = None):
        resource = Resource.create({SERVICE_NAME: service_name})
        provider = TracerProvider(resource=resource)
        exporter = OTLPSpanExporter(endpoint=endpoint)
        processor = BatchSpanProcessor(exporter)
        provider.add_span_processor(processor)
        trace.set_tracer_provider(provider)
        self.tracer = trace.get_tracer(__name__)

        setup_instrumentation()

    @contextmanager
    def span(self, name: str, attributes: Dict[str, Any] | None = None):
        with self.tracer.start_as_current_span(name) as span:
            if attributes:
                for key, value in attributes.items():
                    span.set_attribute(key, value)
            yield span

    def inject(self, carrier: Dict[str, Any]):
        propagator = trace.get_current_span().get_span_context()
        carrier["trace_id"] = format(propagator.trace_id, "032x")
        carrier["span_id"] = format(propagator.span_id, "016x")

    def add_event(self, name: str, attributes: Dict[str, Any] | None = None):
        span = trace.get_current_span()
        if span:
            span.add_event(name=name, attributes=attributes or {})
