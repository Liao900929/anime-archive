import asyncio
import logging
import signal
import sys

from config import Settings
from monitor.market import MarketMonitor
from utils.logger import setup_logger


def _attach_signal_handlers(
    loop: asyncio.AbstractEventLoop,
    monitor: MarketMonitor,
    logger: logging.Logger,
) -> None:
    def _handle(sig: signal.Signals) -> None:
        logger.info("Received %s — initiating graceful shutdown", sig.name)
        loop.create_task(monitor.stop())

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, lambda s=sig: _handle(s))
        except NotImplementedError:
            # Windows does not support add_signal_handler
            signal.signal(sig, lambda signum, frame, s=sig: _handle(s))


def main() -> None:
    settings = Settings()

    logger = setup_logger(
        name="btc_monitor",
        level=settings.LOG_LEVEL,
        log_file=settings.LOG_FILE,
    )

    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        logger.warning(
            "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — alerts will be logged only"
        )

    monitor = MarketMonitor(settings)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    _attach_signal_handlers(loop, monitor, logger)

    logger.info(
        "Starting monitor | interval=%ds | funding_threshold=%.4f | oi_threshold=%.2f%%",
        settings.MONITOR_INTERVAL,
        settings.FUNDING_RATE_THRESHOLD,
        settings.OPEN_INTEREST_CHANGE_THRESHOLD * 100,
    )

    try:
        loop.run_until_complete(monitor.start())
    except KeyboardInterrupt:
        logger.info("Interrupted by keyboard")
    except Exception as exc:
        logger.critical("Fatal error: %s", exc, exc_info=True)
        sys.exit(1)
    finally:
        loop.close()
        logger.info("BTC Market Monitor stopped")


if __name__ == "__main__":
    main()
