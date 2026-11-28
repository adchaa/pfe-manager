"""Shared types and registration helpers for quality measurements."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Callable


@dataclass
class MeasurementContext:
    root: Path
    workspace: Path


@dataclass
class MeasurementResult:
    id: str
    name: str
    status: str
    value: int | float | str | dict | list | None = None
    unit: str | None = None
    target: int | float | str | dict | list | None = None
    message: str | None = None
    family: str | None = None
    tool: str | None = None
    command: str | None = None

    def to_dict(self) -> dict:
        return {key: value for key, value in asdict(self).items() if value is not None}


Measurement = Callable[[MeasurementContext], MeasurementResult]
REGISTRY: list[Measurement] = []


def measurement(check: Measurement) -> Measurement:
    """Register a check so contributors can add one function per metric."""
    REGISTRY.append(check)
    return check


def result(
    *,
    id: str,
    family: str | None = None,
    name: str,
    value: int | float | str | dict | list | None,
    unit: str | None = None,
    target: int | float | str | dict | list | None = None,
    passed: bool | None = None,
    status: str | None = None,
    message: str | None = None,
    tool: str | None = None,
    command: str | None = None,
) -> MeasurementResult:
    return MeasurementResult(
        id=id,
        family=family,
        name=name,
        value=value,
        unit=unit,
        target=target,
        status=status or ("passed" if passed else "failed"),
        message=message,
        tool=tool,
        command=command,
    )
