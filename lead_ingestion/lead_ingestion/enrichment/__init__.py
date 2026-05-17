"""Cheap, network-based enrichment passes that run after a filing is parsed.

Each enrichment module returns Optional values — None means "couldn't check"
(timeout / captcha / rate-limited). Scoring treats None ≠ False.
"""
