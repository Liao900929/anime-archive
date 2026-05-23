import logging
from types import TracebackType
from typing import Any, Self

import aiohttp

from config import Settings
from utils.retry import async_retry

logger = logging.getLogger(__name__)


class BinanceClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._session: aiohttp.ClientSession | None = None

    async def __aenter__(self) -> Self:
        self._session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self._settings.REQUEST_TIMEOUT),
            headers={"X-MBX-APIKEY": self._settings.BINANCE_API_KEY},
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
            raise RuntimeError("BinanceClient must be used as an async context manager")
        return self._session

    @async_retry(
        max_retries=3,
        delay=1.0,
        exceptions=(aiohttp.ClientError, TimeoutError, ValueError),
    )
    async def get_price(self, symbol: str) -> float:
        url = f"{self._settings.BINANCE_REST_BASE_URL}/fapi/v1/ticker/price"
        async with self._http.get(url, params={"symbol": symbol}) as resp:
            resp.raise_for_status()
            data: dict[str, Any] = await resp.json()
            return float(data["price"])

    @async_retry(
        max_retries=3,
        delay=1.0,
        exceptions=(aiohttp.ClientError, TimeoutError, ValueError),
    )
    async def get_funding_rate(self, symbol: str) -> float:
        """Return the latest funding rate via premiumIndex endpoint."""
        url = f"{self._settings.BINANCE_REST_BASE_URL}/fapi/v1/premiumIndex"
        async with self._http.get(url, params={"symbol": symbol}) as resp:
            resp.raise_for_status()
            data: dict[str, Any] = await resp.json()
            return float(data["lastFundingRate"])

    @async_retry(
        max_retries=3,
        delay=1.0,
        exceptions=(aiohttp.ClientError, TimeoutError, ValueError),
    )
    async def get_open_interest(self, symbol: str) -> float:
        url = f"{self._settings.BINANCE_REST_BASE_URL}/fapi/v1/openInterest"
        async with self._http.get(url, params={"symbol": symbol}) as resp:
            resp.raise_for_status()
            data: dict[str, Any] = await resp.json()
            return float(data["openInterest"])
