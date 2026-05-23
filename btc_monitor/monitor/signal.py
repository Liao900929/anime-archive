"""
Trading signal analysis based on funding rate and open interest dynamics.

Signal logic:
  SHORT: funding rate significantly positive + OI rising
         → Longs are overextended and still piling in → mean-reversion short opportunity
  LONG:  funding rate significantly negative + OI rising
         → Shorts are overextended and still piling in → short-squeeze long opportunity
  NEUTRAL: conditions not clearly met
"""

import logging

from config import Settings
from models import MarketData, SignalDirection, TradeSignal

logger = logging.getLogger(__name__)

_CONFIDENCE_MULTIPLIER_HIGH = 2.0   # threshold × this → HIGH confidence
_CONFIDENCE_MULTIPLIER_MEDIUM = 1.0


class SignalAnalyzer:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def analyze(self, data: MarketData, oi_change_pct: float) -> TradeSignal:
        fr = data.funding_rate
        pos_thr = self._settings.FUNDING_RATE_THRESHOLD
        neg_thr = self._settings.NEGATIVE_FUNDING_RATE_THRESHOLD
        oi_thr = self._settings.OPEN_INTEREST_CHANGE_THRESHOLD

        oi_rising = oi_change_pct > oi_thr

        if fr > pos_thr and oi_rising:
            return self._build_short_signal(fr, oi_change_pct, pos_thr)

        if fr < neg_thr and oi_rising:
            return self._build_long_signal(fr, oi_change_pct, neg_thr)

        return TradeSignal(
            direction=SignalDirection.NEUTRAL,
            confidence="—",
            funding_rate=fr,
            oi_change_pct=oi_change_pct,
            reasons=["市場條件尚未符合明確進場訊號"],
            risk_note="建議觀望，等待更清晰的方向",
        )

    def _build_short_signal(
        self, fr: float, oi_change_pct: float, threshold: float
    ) -> TradeSignal:
        confidence = self._confidence(abs(fr), threshold)
        reasons = [
            f"Funding Rate `{fr:.4%}` 偏高正值 → 多頭持續付費給空頭",
            f"未平倉量增加 `{oi_change_pct:.2%}` → 新多頭仍在加倉",
            "多頭槓桿過高，有強制平倉壓力 → 看空機會",
        ]
        risk_note = (
            "做空風險：趨勢行情中 Funding 可持續偏高；務必設置止損\n"
            "⚠️ 此為系統信號，非投資建議，操作風險自負"
        )
        logger.warning("SHORT signal generated | confidence=%s | FR=%.4f | OI_chg=%.2f%%", confidence, fr, oi_change_pct * 100)
        return TradeSignal(
            direction=SignalDirection.SHORT,
            confidence=confidence,
            funding_rate=fr,
            oi_change_pct=oi_change_pct,
            reasons=reasons,
            risk_note=risk_note,
        )

    def _build_long_signal(
        self, fr: float, oi_change_pct: float, threshold: float
    ) -> TradeSignal:
        confidence = self._confidence(abs(fr), abs(threshold))
        reasons = [
            f"Funding Rate `{fr:.4%}` 偏高負值 → 空頭持續付費給多頭",
            f"未平倉量增加 `{oi_change_pct:.2%}` → 新空頭仍在加倉",
            "空頭槓桿過高，有軋空 (Short Squeeze) 風險 → 看多機會",
        ]
        risk_note = (
            "做多風險：下跌趨勢中 Funding 可持續偏負；務必設置止損\n"
            "⚠️ 此為系統信號，非投資建議，操作風險自負"
        )
        logger.warning("LONG signal generated | confidence=%s | FR=%.4f | OI_chg=%.2f%%", confidence, fr, oi_change_pct * 100)
        return TradeSignal(
            direction=SignalDirection.LONG,
            confidence=confidence,
            funding_rate=fr,
            oi_change_pct=oi_change_pct,
            reasons=reasons,
            risk_note=risk_note,
        )

    @staticmethod
    def _confidence(value: float, threshold: float) -> str:
        if value >= threshold * _CONFIDENCE_MULTIPLIER_HIGH:
            return "HIGH"
        return "MEDIUM"
