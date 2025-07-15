# Enhanced Twitter Stock Detection Agent 🐦

## Overview

This system enhances your existing Gemini-based investment platform with real-time Twitter stock detection capabilities, focusing on finding **lesser-known stocks** with recent attention while avoiding mega-cap stocks like NVIDIA, Apple, and Tesla.

## Key Features

### 🎯 Smart Stock Filtering
- **Focus**: Small to mid-cap stocks (under $20B market cap)
- **Avoid**: Large-cap mega stocks (AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META, etc.)
- **Target**: Hidden gems with genuine catalysts and community discussion

### 🚀 Dual AI Architecture
1. **Grok4 Integration** (when API key available)
   - Real-time X (Twitter) data access
   - Live sentiment analysis
   - Current trend detection

2. **Langchain Agent Framework**
   - Advanced reasoning capabilities
   - Multi-tool coordination
   - Fallback analysis when Grok unavailable

### 📊 Enhanced Analysis
- Social sentiment scoring
- Engagement metrics
- Recent catalyst identification
- Confidence scoring (0-100%)

## Setup Instructions

### 1. Install Dependencies

```bash
cd agentic-investment-system
npm install
```

The new dependencies include:
- `langchain` - Agent framework
- `@langchain/core` - Core components
- `@langchain/openai` - OpenAI integration
- `axios` - HTTP requests
- `cheerio` - Web scraping

### 2. Environment Variables

Add these to your `.env` file:

```env
# Existing
API_KEY=your_gemini_api_key

# New additions
OPENAI_API_KEY=your_openai_api_key
XAI_API_KEY=your_grok_api_key (optional but recommended)

# For production Twitter integration
TWITTER_BEARER_TOKEN=your_twitter_api_token (future)
REDDIT_CLIENT_ID=your_reddit_client_id (future)
STOCKTWITS_API_KEY=your_stocktwits_api_key (future)
```

### 3. Grok4 API Setup (Recommended)

To get real-time Twitter data:

1. Go to [ide.x.ai](https://ide.x.ai)
2. Login with your X account
3. Click profile → "API Keys"
4. Create a new API key with `sampler:write` permissions
5. Add the key to your environment as `XAI_API_KEY`

## Usage

### Basic Integration

The system automatically integrates with your existing pipeline:

```typescript
// Your existing code continues to work
const trendingStocks = await getTrendingStocks();

// Now enhanced with real-time Twitter data and smart filtering
// Will return stocks like: ['PLTR', 'SOFI', 'RBLX', 'CRWD', 'SNOW']
// Instead of: ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL']
```

### Advanced Usage

#### 1. Get Enhanced Twitter Analysis

```typescript
import { getEnhancedTrendingStocks } from './services/geminiService';

const result = await getEnhancedTrendingStocks();
console.log(result);
// {
//   tickers: ['PLTR', 'SOFI', 'RBLX'],
//   source: 'Grok Real-time Twitter Analysis',
//   confidence: 85
// }
```

#### 2. Direct Grok Integration

```typescript
import { GrokService } from './services/grokService';

const grok = new GrokService();
const analysis = await grok.findTrendingStocksOnTwitter();

console.log(analysis.trendingStocks); // ['PLTR', 'SOFI', 'RBLX']
console.log(analysis.confidence);    // 85
console.log(analysis.sources);       // Array of tweet mentions
```

#### 3. Langchain Agent Usage

```typescript
import { TwitterStockAgent } from './services/twitterStockAgent';

const agent = new TwitterStockAgent();
const detectedStocks = await agent.detectTrendingStocks();

console.log(detectedStocks);
// [
//   {
//     ticker: 'PLTR',
//     company: 'Palantir Technologies',
//     mentionCount: 156,
//     sentiment: 'positive',
//     marketCap: '$15.2B',
//     recentCatalyst: 'government contract',
//     confidenceScore: 85
//   }
// ]
```

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Grok4 API      │    │  Langchain       │    │  Gemini API     │
│  (Real-time X)  │    │  Agent           │    │  (Fallback)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │  Enhanced        │
                    │  Twitter Agent   │
                    └──────────────────┘
                                 │
                    ┌──────────────────┐
                    │  Smart Filter    │
                    │  (Anti Large-Cap)│
                    └──────────────────┘
                                 │
                    ┌──────────────────┐
                    │  Your Existing   │
                    │  Investment      │
                    │  Pipeline        │
                    └──────────────────┘
```

## Stock Detection Criteria

### ✅ What We Look For
- **Market Cap**: Under $20B (small to mid-cap)
- **Recent Catalysts**: 
  - Earnings beats
  - Contract wins
  - FDA/regulatory approvals
  - Strategic partnerships
  - Product launches
- **Genuine Engagement**: Real community discussion
- **Growth Potential**: Strong fundamentals
- **Social Momentum**: Increasing mentions and positive sentiment

### ❌ What We Avoid
- **Large-cap mega stocks**: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META
- **Pump and dump schemes**: Artificial hype patterns
- **Penny stocks**: Companies without real business models
- **Meme stocks without fundamentals**: Hype without substance

## Example Output

The system will now find stocks like:

```javascript
{
  "detected_stocks": [
    {
      "ticker": "PLTR",
      "company": "Palantir Technologies",
      "market_cap": "$15.2B",
      "catalyst": "Major government contract win",
      "social_mentions": 1247,
      "sentiment": "bullish",
      "confidence": 88,
      "sample_tweets": [
        "PLTR just secured another major gov contract",
        "Palantir AIP adoption accelerating fast"
      ]
    },
    {
      "ticker": "SOFI", 
      "company": "SoFi Technologies",
      "market_cap": "$8.3B",
      "catalyst": "Bank charter speculation",
      "social_mentions": 892,
      "sentiment": "bullish", 
      "confidence": 82
    }
  ],
  "excluded_large_caps": ["NVDA", "AAPL", "TSLA"],
  "source": "Grok Real-time Twitter Analysis"
}
```

## Troubleshooting

### Common Issues

1. **No Grok API Key**
   - System falls back to enhanced Gemini simulation
   - Still filters for small-to-mid cap stocks
   - Warning logged but continues working

2. **OpenAI API Key Missing**
   - Langchain agent won't work
   - Grok integration still functional
   - Gemini fallback available

3. **No Stocks Detected**
   - Check Twitter/X activity (may be quiet period)
   - Lower confidence threshold in settings
   - Review exclusion filters

### Performance Tips

1. **Use Grok API** for best real-time results
2. **Cache results** to avoid excessive API calls
3. **Monitor rate limits** especially for production use
4. **Adjust confidence thresholds** based on market conditions

## Future Enhancements

### Planned Features
- [ ] Reddit integration (r/stocks, r/SecurityAnalysis, r/investing)
- [ ] StockTwits API integration
- [ ] Discord financial server monitoring
- [ ] Enhanced NLP sentiment analysis
- [ ] Pattern recognition for pump-and-dump detection
- [ ] Integration with options flow data
- [ ] Real-time alert system

### Production Considerations
- Implement proper rate limiting
- Add error handling and retry logic
- Set up monitoring and alerting
- Add data validation and sanitization
- Implement caching layer for API responses

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify environment variables are set correctly
3. Test with fallback mode (no Grok API key)
4. Review the service integration points

The system is designed to be resilient - if one component fails, others will compensate to ensure you still get valuable stock detection results. 