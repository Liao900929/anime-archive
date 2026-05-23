import logging
from datetime import datetime, timedelta, timezone

from config import Settings
from models import AlertState, MarketData

logger = logging.getLogger(__name__)


class AlertChecker:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._state = AlertState()

    def check_and_update(self, data: MarketData) -> tuple[bool, str]:
        """
        Evaluate alert conditions and update internal state.
        Returns (should_alert, reason_message).
        """
        funding_triggered = data.funding_rate > self._settings.FUNDING_RATE_THRESHOLD

        oi_change_pct = 0.0
        oi_triggered = False
        if self._state.previous_open_interest is not None:
            prev = self._state.previous_open_interest
            if prev > 0:
                oi_change_pct = (data.open_interest - prev) / prev
                oi_triggered = oi_change_pct > self._settings.OPEN_INTEREST_CHANGE_THRESHOLD

        self._state.previous_open_interest = data.open_interest

        if funding_triggered:
            logger.debug(
                "Funding rate %.4f%% exceeds threshold %.4f%%",
                data.funding_rate * 100,
                self._settings.FUNDING_RATE_THRESHOLD * 100,
            )
        if oi_triggered:
            logger.debug("OI change %.2f%% exceeds threshold %.2f%%", oi_change_pct * 100, self._settings.OPEN_INTEREST_CHANGE_THRESHOLD * 100)

        if not (funding_triggered and oi_triggered):
            return False, ""

        if not self._can_alert():
            logger.debug("Alert suppressed — still within cooldown period")
            return False, ""

        self._state.last_alert_time = datetime.now(tz=timezone.utc)
        reason = (
            f"Funding Rate: `{data.funding_rate:.4%}` > threshold `{self._settings.FUNDING_RATE_THRESHOLD:.4%}`\n"
            f"OI change: `{oi_change_pct:.2%}` > threshold `{self._settings.OPEN_INTEREST_CHANGE_THRESHOLD:.2%}`"
        )
        return True, reason

    def _can_alert(self) -> bool:
        if self._state.last_alert_time is None:
            return True
        cooldown = timedelta(minutes=self._settings.ALERT_COOLDOWN_MINUTES)
        elapsed = datetime.now(tz=timezone.utc) - self._state.last_alert_time.replace(
            tzinfo=timezone.utc
        )
        return elapsed >= cooldown

    @staticmethod
    def format_message(data: MarketData, reason: str) -> str:
        return (
            "🚨 *BTC Market Alert*\n\n"
            f"📊 Symbol: `{data.symbol}`\n"
            f"💰 Price: `${data.price:,.2f}`\n"
            f"📈 Funding Rate: `{data.funding_rate:.4%}`\n"
            f"📊 Open Interest: `{data.open_interest:,.2f}`\n\n"
            f"⚠️ *Conditions Triggered:*\n{reason}\n\n"
            f"🕐 Time: `{data.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}`"
        )
