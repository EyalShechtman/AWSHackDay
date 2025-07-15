
import { AgentName } from './types';

export const AGENT_PIPELINE: AgentName[] = [
    'Enhanced Twitter Agent',
    'Finance Data Agent',
    'Financial Decision Agent',
    'Advisor Agent',
    'Trade Execution',
];

export const INITIAL_STRATEGY = `My investment goal is to find lesser-known stocks with strong fundamentals that are gaining attention on social media, particularly Twitter/X. Focus on small to mid-cap companies (under $20B market cap) with recent catalysts but avoid mega-cap stocks like NVIDIA, Apple, or Tesla. I have a medium-to-high risk tolerance and am looking for hidden gems that could yield significant returns over the next 6-12 months. Prioritize companies with genuine community discussion, recent positive developments, and insider buying signals.`;

export const TWITTER_FOCUS_STRATEGY = `Focus exclusively on stocks trending on Twitter/X that meet these criteria:
- Market cap under $20B (small to mid-cap preferred)
- Recent catalysts: earnings beats, contract wins, FDA approvals, partnerships, product launches
- Genuine engagement (not pump-and-dump schemes)
- Companies with solid fundamentals and growth potential
- Stocks getting attention but not yet mainstream
- Exclude obvious large-cap stocks: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META, etc.`;

export const FINANCIAL_ANALYST_PROMPT = `
You are an elite AI financial analyst. Your task is to analyze a list of stock candidates and select the best investment opportunities based on a user's strategy and a strict set of criteria.

Data Categories for Analysis:
- Fundamental Data: EPS, Revenue, P/E, P/S, Margins, FCF Yield, Insider Transactions.
- Options Chain Data: Implied Volatility (IV), Open Interest, Volume, IV Rank.
- Price & Volume Data: OHLCV, Historical Volatility, Moving Averages (50/100/200-day), RSI, MACD, VWAP.
- Alternative Data: Social Sentiment (Twitter/X, Reddit), News event detection.

Trade Selection Criteria:
- Number of Trades: Exactly 5
- Goal: Maximize edge while maintaining portfolio diversification and risk limits.
- Hard Filters (discard trades not meeting these):
  - Quote age ≤ 10 minutes (Assume all provided data is live)
  - Top option Probability of Profit (POP) ≥ 0.65
  - Top option credit / max loss ratio ≥ 0.33
  - Top option max loss ≤ 0.5% of $100,000 NAV (≤ $500)
- Selection Rules:
  - Rank trades by a composite model_score you generate.
  - Ensure diversification: maximum of 2 trades per GICS sector.
  - In case of ties, prefer higher momentum and positive sentiment scores.
`;

export const INITIAL_PORTFOLIO_HISTORY = [
    { day: 1, value: 100000 },
    { day: 2, value: 100500 },
    { day: 3, value: 100200 },
    { day: 4, value: 101100 },
    { day: 5, value: 101500 },
    { day: 6, value: 101300 },
    { day: 7, value: 102000 },
];
