from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


@dataclass
class MarketData:
    symbol: str
    price: float
    funding_rate: float
    open_interest: float
    timestamp: datetime = field(default_factory=datetime.utcnow)

    def __str__(self) -> str:
        return (
            f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}] "
            f"{self.symbol} | Price: ${self.price:,.2f} | "
            f"Funding Rate: {self.funding_rate:.4%} | "
            f"OI: {self.open_interest:,.0f}"
        )


@dataclass
class AlertState:
    previous_open_interest: float | None = None
    last_alert_time: datetime | None = None


class SignalDirection(Enum):
    LONG = "LONG"
    SHORT = "SHORT"
    NEUTRAL = "NEUTRAL"


@dataclass
class TradeSignal:
    direction: SignalDirection
    confidence: str          # HIGH / MEDIUM / LOW
    funding_rate: float
    oi_change_pct: float
    reasons: list[str]
    risk_note: str
