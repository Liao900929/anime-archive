from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Binance
    BINANCE_API_KEY: str = ""
    BINANCE_API_SECRET: str = ""
    BINANCE_REST_BASE_URL: str = "https://fapi.binance.com"
    BINANCE_WS_BASE_URL: str = "wss://fstream.binance.com"

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    # Monitor
    SYMBOL: str = "BTCUSDT"
    MONITOR_INTERVAL: int = 60  # seconds

    # Alert thresholds
    FUNDING_RATE_THRESHOLD: float = 0.03         # positive extreme → SHORT signal
    NEGATIVE_FUNDING_RATE_THRESHOLD: float = -0.03  # negative extreme → LONG signal
    OPEN_INTEREST_CHANGE_THRESHOLD: float = 0.05
    ALERT_COOLDOWN_MINUTES: int = 30

    # HTTP
    REQUEST_TIMEOUT: int = 10  # seconds
    MAX_RETRIES: int = 3
    RETRY_DELAY: float = 1.0
    RETRY_BACKOFF: float = 2.0

    # WebSocket
    WS_PING_INTERVAL: int = 20
    WS_PING_TIMEOUT: int = 10
    WS_MAX_RECONNECT_DELAY: float = 60.0

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "btc_monitor.log"
