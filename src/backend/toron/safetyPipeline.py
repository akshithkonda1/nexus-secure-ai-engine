import re


def sanitize_input(text):
    text = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[REDACTED-SSN]", text)
    text = re.sub(r"\b\d{10}\b", "[REDACTED-PHONE]", text)
    return text


def sanitize_output(text):
    if "definitely" in text.lower():
        text = text.replace("definitely", "likely")
    return text
