import logging
from datetime import datetime, timedelta, timezone

from config import Settings
from models import AlertState, MarketData, SignalDirection, TradeSignal

logger = logging.getLogger(__name__)

_DIRECTION_LABEL: dict[SignalDirection, str] = {
    SignalDirection.LONG: "📗 做多 (LONG)",
    SignalDirection.SHORT: "📕 做空 (SHORT)",
    SignalDirection.NEUTRAL: "⬜ 觀望 (NEUTRAL)",
}

_CONFIDENCE_LABEL: dict[str, str] = {
    "HIGH": "🔴 高 (HIGH)",
    "MEDIUM": "🟡 中 (MEDIUM)",
    "LOW": "🟢 低 (LOW)",
    "—": "—",
}


class AlertChecker:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._state = AlertState()

    def check_and_update(self, data: MarketData) -> tuple[bool, float]:
        """
        Evaluate alert conditions and update OI state.
        Returns (should_alert, oi_change_pct).

        Triggers when funding rate exceeds either threshold AND OI is rising,
        covering both potential SHORT (high positive FR) and LONG (high negative FR).
        """
        fr = data.funding_rate
        pos_triggered = fr > self._settings.FUNDING_RATE_THRESHOLD
        neg_triggered = fr < self._settings.NEGATIVE_FUNDING_RATE_THRESHOLD

        oi_change_pct = 0.0
        oi_triggered = False
        if self._state.previous_open_interest is not None:
            prev = self._state.previous_open_interest
            if prev > 0:
                oi_change_pct = (data.open_interest - prev) / prev
                oi_triggered = oi_change_pct > self._settings.OPEN_INTEREST_CHANGE_THRESHOLD

        self._state.previous_open_interest = data.open_interest

        extreme_funding = pos_triggered or neg_triggered
        if not (extreme_funding and oi_triggered):
            return False, oi_change_pct

        if not self._can_alert():
            logger.debug("Alert suppressed — within cooldown period")
            return False, oi_change_pct

        self._state.last_alert_time = datetime.now(tz=timezone.utc)
        return True, oi_change_pct

    def _can_alert(self) -> bool:
        if self._state.last_alert_time is None:
            return True
        cooldown = timedelta(minutes=self._settings.ALERT_COOLDOWN_MINUTES)
        elapsed = datetime.now(tz=timezone.utc) - self._state.last_alert_time.replace(
            tzinfo=timezone.utc
        )
        return elapsed >= cooldown

    @staticmethod
    def format_message(data: MarketData, signal: TradeSignal) -> str:
        direction_str = _DIRECTION_LABEL.get(signal.direction, str(signal.direction))
        confidence_str = _CONFIDENCE_LABEL.get(signal.confidence, signal.confidence)

        fr_sign = "+" if data.funding_rate >= 0 else ""
        fr_note = "多頭付費" if data.funding_rate > 0 else "空頭付費"
        oi_arrow = "↑" if signal.oi_change_pct >= 0 else "↓"

        reasons_text = "\n".join(f"  • {r}" for r in signal.reasons)

        return (
            "🚨 *BTC 市場進場信號*\n"
            "━━━━━━━━━━━━━━━━━━\n\n"
            f"🎯 *方向：{direction_str}*\n"
            f"💪 信心：{confidence_str}\n\n"
            f"💰 價格：`${data.price:,.2f}`\n"
            f"📈 Funding Rate：`{fr_sign}{data.funding_rate:.4%}` （{fr_note}）\n"
            f"📊 OI 變化：`{signal.oi_change_pct:+.2%}` {oi_arrow}\n"
            f"📦 未平倉量：`{data.open_interest:,.2f}`\n\n"
            f"📋 *分析：*\n{reasons_text}\n\n"
            f"⚠️ *風險提示：*\n{signal.risk_note}\n\n"
            f"🕐 `{data.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}`"
        )
