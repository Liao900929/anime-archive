import logging
from types import TracebackType
from typing import Any, Self

import aiohttp

from config import Settings
from utils.retry import async_retry

logger = logging.getLogger(__name__)


class TelegramClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._session: aiohttp.ClientSession | None = None
        self._base_url = (
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}"
        )

    async def __aenter__(self) -> Self:
        self._session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self._settings.REQUEST_TIMEOUT)
        )
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        if self._session and not self._session.closed:
            await self._session.close()

    @property
    def _http(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            raise RuntimeError("TelegramClient must be used as an async context manager")
        return self._session

    @async_retry(
        max_retries=3,
        delay=1.0,
        exceptions=(aiohttp.ClientError, TimeoutError),
    )
    async def send_message(self, text: str) -> None:
        if not self._settings.TELEGRAM_BOT_TOKEN or not self._settings.TELEGRAM_CHAT_ID:
            logger.warning("Telegram credentials not configured — skipping notification")
            return

        url = f"{self._base_url}/sendMessage"
        payload: dict[str, Any] = {
            "chat_id": self._settings.TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "Markdown",
        }
        async with self._http.post(url, json=payload) as resp:
            if resp.status != 200:
                body = await resp.text()
                logger.error("Telegram API error %d: %s", resp.status, body)
                resp.raise_for_status()
            logger.info("Telegram notification sent")
