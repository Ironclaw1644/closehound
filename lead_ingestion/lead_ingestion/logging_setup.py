"""Structured JSON logger to stdout.

We don't use stderr for normal logs because cron usually pipes stderr to mail
on the Mac mini — keep stderr for actual errors. stdout goes into the logfile
configured in the cron command.

Format is one JSON line per event with {ts, level, logger, message, ...extra}.
"""

from __future__ import annotations

import json
import logging
import sys
from typing import Any


class JsonFormatter(logging.Formatter):
    """Format a LogRecord as a single-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:  # noqa: A003 (override)
        payload: dict[str, Any] = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Anything passed in extra={...} on the log call ends up as attrs on
        # the record. Surface them at the top level for jq-friendly grepping.
        for key, value in record.__dict__.items():
            if key in _STD_ATTRS:
                continue
            try:
                json.dumps(value)
                payload[key] = value
            except TypeError:
                payload[key] = repr(value)
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


# logging.LogRecord standard attrs we don't want to redundantly surface.
_STD_ATTRS = frozenset(
    {
        "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
        "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
        "created", "msecs", "relativeCreated", "thread", "threadName",
        "processName", "process", "message", "asctime",
    }
)


def configure(level: int = logging.INFO) -> None:
    """Install the JSON handler on the root logger. Idempotent."""
    root = logging.getLogger()
    # Drop existing handlers so re-invocation in tests doesn't multiply output.
    for h in list(root.handlers):
        root.removeHandler(h)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)
    root.setLevel(level)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
