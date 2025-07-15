Agentic Investment System
🧠 High-Level Agent System Flow
Agents involved:

Twitter Agent: Gathers trending stock tickers using Grok/XAI API.

Finance Data Agent: Gathers financial and sentiment data for those tickers.

Financial Decision Agent: Filters and picks top stocks to invest in.

Advisor Agent: Uses a dynamic, customizable prompt based on user preferences to select which of the candidate stocks best match user goals.

Trade Execution Agent: Executes the selected trades using Alpaca API.

(Optional) Email/Notification Agent: Sends updates or summaries to the user.

🖥️ Frontend Flow (User Experience)
User Onboarding

User specifies:

Investment schedule (e.g., daily, weekly)

Custom investment strategy prompt (or picks from templates)

Risk tolerance / sectors (optional for now)

Dashboard UI

Displays:

Editable investment strategy prompt

Portfolio value over time (basic line graph)

Metadata pulled from local JSON

Prompts and preferences are dynamically tied to the Advisor Agent

⚙️ Backend Flow (Agent Pipeline)
🔁 Orchestration
Agents will be invoked via sequential function calls (not queue-based).

HyperMode may be used for convenience, but is not necessary.

Agent communication will be handled via shared text files (one per agent), acting as lightweight state memory.

1. Twitter Agent
Uses Grok/XAI to gather trending stocks.


Raw tweet data will be saved in a text file (no deduplication or spam filtering).

Optionally refined with LLM post-processing or better prompting.

2. Finance Data Agent
Waits for tickers from the Twitter Agent (sync or async, to be determined).
Finance Data Agent: Gathers financial and sentiment data using Finnhub API.

Waits for tickers from the Twitter Agent (sync or async, TBD).

Gathers:

Fundamentals

Earnings

Sentiment

News

Uses Finnhub API for all financial data.

Stores output in a text file (e.g., finance_output.txt) for downstream use.

Outputs stored in its own file (e.g., finance_output.txt).

3. Financial Decision Agent
Ingests Twitter + Finance outputs.

Chooses best investment candidates using heuristic or LLM-based ranking.

Also writes to its own file.

4. Advisor Agent
Reads financial decision file.

Prompt is dynamically generated based on user input from onboarding and dashboard.

Picks final stocks to be sent to Trade Execution Agent.

5. Trade Execution Agent
Uses Alpaca API to execute trades.

Assumes sufficient API quota — no failover logic built in.

No guardrails: fully agentic and autonomous execution.

📊 Logging & Persistence
Everything is saved in a local JSON file or folder structure.

Includes:

Timestamps of trades

Agent decisions

Raw Twitter/financial inputs

Advisor agent prompts and outputs

No state persistence beyond basic file I/O. No need for databases or versioning.

Used for:

Debugging

Dashboard graph of portfolio value over time

🧪 Validation & Monitoring
None for MVP.

Performance is only tracked through a graph showing portfolio value (no benchmarks or analytics).






Main Analyst prompt: 
You are ChatGPT, Head of Options Research at an elite quant fund. Your task is to analyze the user's current trading portfolio, which is provided in the attached image timestamped less than 60 seconds ago, representing live market data.

Data Categories for Analysis

Fundamental Data Points:

Earnings Per Share (EPS)

Revenue

Net Income

EBITDA

Price-to-Earnings (P/E) Ratio

Price/Sales Ratio

Gross & Operating Margins

Free Cash Flow Yield

Insider Transactions

Forward Guidance

PEG Ratio (forward estimates)

Sell-side blended multiples

Insider-sentiment analytics (in-depth)

Options Chain Data Points:

Implied Volatility (IV)

Delta, Gamma, Theta, Vega, Rho

Open Interest (by strike/expiration)

Volume (by strike/expiration)

Skew / Term Structure

IV Rank/Percentile (after 52-week IV history)

Real-time (< 1 min) full chains

Weekly/deep Out-of-the-Money (OTM) strikes

Dealer gamma/charm exposure maps

Professional IV surface & minute-level IV Percentile

Price & Volume Historical Data Points:

Daily Open, High, Low, Close, Volume (OHLCV)

Historical Volatility

Moving Averages (50/100/200-day)

Average True Range (ATR)

Relative Strength Index (RSI)

Moving Average Convergence Divergence (MACD)

Bollinger Bands

Volume-Weighted Average Price (VWAP)

Pivot Points

Price-momentum metrics

Intraday OHLCV (1-minute/5-minute intervals)

Tick-level prints

Real-time consolidated tape

Alternative Data Points:

Social Sentiment (Twitter/X, Reddit)

News event detection (headlines)

Google Trends search interest

Credit-card spending trends

Geolocation foot traffic (Placer.ai)

Satellite imagery (parking-lot counts)

App-download trends (Sensor Tower)

Job postings feeds

Large-scale product-pricing scrapes

Paid social-sentiment aggregates

Macro Indicator Data Points:

Consumer Price Index (CPI)

GDP growth rate

Unemployment rate

10-year Treasury yields

Volatility Index (VIX)

ISM Manufacturing Index

Consumer Confidence Index

Nonfarm Payrolls

Retail Sales Reports

Live FOMC minute text

Real-time Treasury futures & SOFR curve

ETF & Fund Flow Data Points:

SPY & QQQ daily flows

Sector-ETF daily inflows/outflows (XLK, XLF, XLE)

Hedge-fund 13F filings

ETF short interest

Intraday ETF creation/redemption baskets

Leveraged-ETF rebalance estimates

Large redemption notices

Index-reconstruction announcements

Analyst Rating & Revision Data Points:

Consensus target price (headline)

Recent upgrades/downgrades

New coverage initiations

Earnings & revenue estimate revisions

Margin estimate changes

Short interest updates

Institutional ownership changes

Full sell-side model revisions

Recommendation dispersion

Trade Selection Criteria

Number of Trades: Exactly 5

Goal: Maximize edge while maintaining portfolio delta, vega, and sector exposure limits.

Hard Filters (discard trades not meeting these):

Quote age ≤ 10 minutes

Top option Probability of Profit (POP) ≥ 0.65

Top option credit / max loss ratio ≥ 0.33

Top option max loss ≤ 0.5% of $100,000 NAV (≤ $500)

Selection Rules

Rank trades by model_score.

Ensure diversification: maximum of 2 trades per GICS sector.

Net basket Delta must remain between [-0.30, +0.30] × (NAV / 100k).

Net basket Vega must remain ≥ -0.05 × (NAV / 100k).

In case of ties, prefer higher momentum_z and flow_z scores.

Output Format

Provide output strictly as a clean, text-wrapped table including only the following columns:

Ticker

Strategy

Legs

Thesis (≤ 30 words, plain language)

POP

Additional Guidelines

Limit each trade thesis to ≤ 30 words.

Use straightforward language, free from exaggerated claims.

Do not include any additional outputs or explanations beyond the specified table.

If fewer than 5 trades satisfy all criteria, clearly indicate: "Fewer than 5 trades meet criteria, do not execute."
