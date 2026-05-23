# BTC Market Monitor

An async Python system that monitors Binance Futures market data for BTCUSDT and fires Telegram alerts when configurable risk conditions are met.

## Features

- Real-time price and funding rate via **Binance Futures WebSocket** (`markPrice` stream)
- Open interest polled from the **Binance Futures REST API** every 60 s
- Telegram alert when **funding rate > threshold AND OI grows > threshold** simultaneously
- Exponential-backoff retry on all HTTP calls
- Automatic WebSocket reconnect with exponential backoff
- Per-request timeout enforcement
- Alert cooldown to prevent notification floods
- Structured logging to stdout and a rotating log file
- All configuration via `.env` — zero hardcoded values

## Requirements

- Python 3.11+
- A Binance account is **not** required (public endpoints are used unless you need private data)
- A Telegram bot token and chat ID for notifications

## Project Structure

```
btc_monitor/
├── main.py              # entry point, signal handling
├── config.py            # pydantic-settings config from .env
├── models.py            # MarketData, AlertState dataclasses
├── api/
│   ├── binance.py       # Binance REST client (price, funding rate, OI)
│   └── telegram.py      # Telegram bot client
├── monitor/
│   ├── market.py        # WebSocket loop + 60 s polling loop
│   └── alert.py         # condition evaluation, message formatting
├── utils/
│   ├── logger.py        # logging setup
│   └── retry.py         # async_retry decorator
├── .env.example         # template — copy to .env and fill in values
└── requirements.txt
```

## Quick Start

```bash
# 1. Clone and enter the directory
cd btc_monitor

# 2. Create a virtual environment
python3.11 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure
cp .env.example .env
# Edit .env — at minimum set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID

# 5. Run
python main.py
```

## Configuration

All values are read from `.env` (or environment variables). See `.env.example` for the full list.

| Variable | Default | Description |
|---|---|---|
| `BINANCE_API_KEY` | _(empty)_ | Optional — only needed for private endpoints |
| `TELEGRAM_BOT_TOKEN` | _(empty)_ | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | _(empty)_ | Target chat / group / channel ID |
| `SYMBOL` | `BTCUSDT` | Futures symbol to monitor |
| `MONITOR_INTERVAL` | `60` | Seconds between each data collection tick |
| `FUNDING_RATE_THRESHOLD` | `0.03` | Alert trigger — funding rate (decimal, 0.03 = 3 %) |
| `OPEN_INTEREST_CHANGE_THRESHOLD` | `0.05` | Alert trigger — OI change fraction (0.05 = 5 %) |
| `ALERT_COOLDOWN_MINUTES` | `30` | Minimum minutes between consecutive alerts |
| `REQUEST_TIMEOUT` | `10` | HTTP request timeout in seconds |
| `MAX_RETRIES` | `3` | Max retry attempts per request |
| `RETRY_DELAY` | `1.0` | Initial retry delay in seconds |
| `RETRY_BACKOFF` | `2.0` | Exponential backoff multiplier |
| `WS_PING_INTERVAL` | `20` | WebSocket keepalive ping interval |
| `WS_MAX_RECONNECT_DELAY` | `60.0` | Maximum delay between WS reconnects |
| `LOG_LEVEL` | `INFO` | Logging level (DEBUG / INFO / WARNING / ERROR) |
| `LOG_FILE` | `btc_monitor.log` | Log file path (relative to working directory) |

## Alert Logic

An alert is fired when **all** of the following are true simultaneously:

1. Current funding rate > `FUNDING_RATE_THRESHOLD`
2. Open interest increased by more than `OPEN_INTEREST_CHANGE_THRESHOLD` since the previous tick
3. At least `ALERT_COOLDOWN_MINUTES` have passed since the last alert

If Telegram credentials are missing, the alert is written to the log instead of crashing.

## Graceful Shutdown

Send `SIGINT` (Ctrl-C) or `SIGTERM` to stop the monitor cleanly.

## Architecture

```
main.py
  └─ MarketMonitor.start()
       ├─ _websocket_loop()   ← continuous WS connection (reconnects on drop)
       │    └─ updates _latest_price / _latest_funding_rate in memory
       └─ _monitor_loop()     ← ticks every MONITOR_INTERVAL seconds
            ├─ uses WS cache or falls back to REST for price & funding rate
            ├─ always fetches OI from REST
            ├─ constructs MarketData
            └─ AlertChecker.check_and_update() → optional Telegram message
```
