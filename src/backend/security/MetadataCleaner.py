"""Utilities to strip metadata from common document formats."""
from __future__ import annotations

import io
from typing import Any

try:  # pragma: no cover - optional dependency
    from PIL import Image
except Exception:  # pragma: no cover
    Image = None

try:  # pragma: no cover - optional dependency
    import PyPDF2
except Exception:  # pragma: no cover
    PyPDF2 = None


def strip_exif(image_bytes: bytes) -> bytes:
    if Image is None:
        return image_bytes
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            data = list(img.getdata())
            clean = Image.new(img.mode, img.size)
            clean.putdata(data)
            output = io.BytesIO()
            clean.save(output, format=img.format or "PNG")
            return output.getvalue()
    except Exception:
        return image_bytes


def strip_pdf_metadata(pdf_bytes: bytes) -> bytes:
    if PyPDF2 is None:
        return pdf_bytes
    reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    writer = PyPDF2.PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    writer.add_metadata({})
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()


def strip_document_metadata(doc_bytes: bytes) -> bytes:
    markers = [b"Author", b"Creator", b"Producer", b"CreationDate", b"ModDate"]
    filtered = doc_bytes
    for marker in markers:
        filtered = filtered.replace(marker, b"[REDACTED]")
    return filtered


def strip_office_metadata(docx_bytes: bytes, xlsx_bytes: bytes | None = None) -> tuple[bytes, bytes | None]:
    cleaned_docx = strip_document_metadata(docx_bytes)
    cleaned_xlsx = strip_document_metadata(xlsx_bytes) if xlsx_bytes else None
    return cleaned_docx, cleaned_xlsx


def remove_hidden_layers(pdf_bytes: bytes) -> bytes:
    filtered = pdf_bytes.replace(b"<x:xmpmeta", b"<xmp-stripped")
    filtered = filtered.replace(b"%%EOF", b"")
    return filtered


__all__ = [
    "strip_exif",
    "strip_pdf_metadata",
    "strip_document_metadata",
    "strip_office_metadata",
    "remove_hidden_layers",
]
