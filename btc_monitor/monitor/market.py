import asyncio
import json
import logging
from datetime import datetime, timezone

import websockets
from websockets.exceptions import ConnectionClosed, WebSocketException

from api.binance import BinanceClient
from api.telegram import TelegramClient
from config import Settings
from models import MarketData
from monitor.alert import AlertChecker
from monitor.signal import SignalAnalyzer

logger = logging.getLogger(__name__)


class MarketMonitor:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._alert_checker = AlertChecker(settings)
        self._signal_analyzer = SignalAnalyzer(settings)
        self._latest_price: float | None = None
        self._latest_funding_rate: float | None = None
        self._running = False

    async def start(self) -> None:
        self._running = True
        logger.info("BTC Market Monitor starting — symbol=%s", self._settings.SYMBOL)

        async with (
            BinanceClient(self._settings) as binance,
            TelegramClient(self._settings) as telegram,
        ):
            ws_task = asyncio.create_task(
                self._websocket_loop(), name="ws_loop"
            )
            monitor_task = asyncio.create_task(
                self._monitor_loop(binance, telegram), name="monitor_loop"
            )
            try:
                await asyncio.gather(ws_task, monitor_task)
            except asyncio.CancelledError:
                logger.info("Monitor tasks cancelled — shutting down")
            finally:
                ws_task.cancel()
                monitor_task.cancel()
                await asyncio.gather(ws_task, monitor_task, return_exceptions=True)

    async def stop(self) -> None:
        logger.info("Stop requested")
        self._running = False

    # ------------------------------------------------------------------
    # WebSocket loop
    # ------------------------------------------------------------------

    async def _websocket_loop(self) -> None:
        stream = f"{self._settings.SYMBOL.lower()}@markPrice"
        url = f"{self._settings.BINANCE_WS_BASE_URL}/ws/{stream}"
        reconnect_delay = 1.0

        while self._running:
            try:
                logger.info("Connecting to WebSocket: %s", url)
                async with websockets.connect(
                    url,
                    ping_interval=self._settings.WS_PING_INTERVAL,
                    ping_timeout=self._settings.WS_PING_TIMEOUT,
                ) as ws:
                    reconnect_delay = 1.0
                    logger.info("WebSocket connected")
                    async for raw in ws:
                        if not self._running:
                            break
                        self._handle_ws_message(raw)

            except ConnectionClosed as exc:
                logger.warning("WebSocket closed: %s", exc)
            except WebSocketException as exc:
                logger.error("WebSocket error: %s", exc)
            except OSError as exc:
                logger.error("Network error on WebSocket: %s", exc)
            except Exception as exc:  # noqa: BLE001
                logger.exception("Unexpected WebSocket error: %s", exc)

            if not self._running:
                break

            logger.info("Reconnecting WebSocket in %.0fs…", reconnect_delay)
            await asyncio.sleep(reconnect_delay)
            reconnect_delay = min(
                reconnect_delay * 2, self._settings.WS_MAX_RECONNECT_DELAY
            )

    def _handle_ws_message(self, raw: str | bytes) -> None:
        try:
            data: dict = json.loads(raw)
            # markPrice stream fields: p = mark price, r = funding rate
            price_str: str | None = data.get("p")
            rate_str: str | None = data.get("r")
            if price_str:
                self._latest_price = float(price_str)
            if rate_str:
                self._latest_funding_rate = float(rate_str)
        except (json.JSONDecodeError, ValueError, KeyError) as exc:
            logger.warning("Failed to parse WebSocket message: %s", exc)

    # ------------------------------------------------------------------
    # Polling / monitor loop
    # ------------------------------------------------------------------

    async def _monitor_loop(
        self,
        binance: BinanceClient,
        telegram: TelegramClient,
    ) -> None:
        while self._running:
            try:
                await self._tick(binance, telegram)
            except asyncio.CancelledError:
                raise
            except Exception as exc:  # noqa: BLE001
                logger.error("Monitor loop error (continuing): %s", exc, exc_info=True)

            await asyncio.sleep(self._settings.MONITOR_INTERVAL)

    async def _tick(
        self,
        binance: BinanceClient,
        telegram: TelegramClient,
    ) -> None:
        price = await self._resolve_price(binance)
        if price is None:
            return

        funding_rate = await self._resolve_funding_rate(binance)
        if funding_rate is None:
            return

        open_interest = await self._fetch_open_interest(binance)
        if open_interest is None:
            return

        market_data = MarketData(
            symbol=self._settings.SYMBOL,
            price=price,
            funding_rate=funding_rate,
            open_interest=open_interest,
            timestamp=datetime.now(tz=timezone.utc),
        )
        logger.info("%s", market_data)

        should_alert, oi_change_pct = self._alert_checker.check_and_update(market_data)
        if should_alert:
            signal = self._signal_analyzer.analyze(market_data, oi_change_pct)
            message = AlertChecker.format_message(market_data, signal)
            logger.warning(
                "Signal triggered: %s | confidence=%s",
                signal.direction.value,
                signal.confidence,
            )
            try:
                await telegram.send_message(message)
            except Exception as exc:  # noqa: BLE001
                logger.error("Failed to send Telegram alert: %s", exc)

    async def _resolve_price(self, binance: BinanceClient) -> float | None:
        if self._latest_price is not None:
            return self._latest_price
        try:
            return await binance.get_price(self._settings.SYMBOL)
        except Exception as exc:  # noqa: BLE001
            logger.error("Cannot fetch price: %s", exc)
            return None

    async def _resolve_funding_rate(self, binance: BinanceClient) -> float | None:
        if self._latest_funding_rate is not None:
            return self._latest_funding_rate
        try:
            return await binance.get_funding_rate(self._settings.SYMBOL)
        except Exception as exc:  # noqa: BLE001
            logger.error("Cannot fetch funding rate: %s", exc)
            return None

    async def _fetch_open_interest(self, binance: BinanceClient) -> float | None:
        try:
            return await binance.get_open_interest(self._settings.SYMBOL)
        except Exception as exc:  # noqa: BLE001
            logger.error("Cannot fetch open interest: %s", exc)
            return None
