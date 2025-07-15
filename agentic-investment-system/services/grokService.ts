// Simple Twitter Agent using Grok + Tool Calling for live data

export interface StockResult {
  ticker: string;
  reason: string;
}

export class GrokService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.XAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('XAI_API_KEY not found. Grok integration will not work.');
    }
  }

  /**
   * Find 15 interesting stocks trending on Twitter today
   */
  async findTrendingStocksOnTwitter(): Promise<StockResult[]> {
    try {
      if (!this.apiKey) {
        throw new Error('XAI_API_KEY not found. Cannot get real Twitter data.');
      }

      // In production, use the actual xai-sdk:
      // const xai_sdk = require('xai-sdk');
      // const client = new xai_sdk.Client();
      
      const result = await this.callGrokWithTools();
      return result;
    } catch (error) {
      console.error('Error calling Grok API:', error);
      throw new Error('Failed to get live Twitter stock data from Grok');
    }
  }

  private async callGrokWithTools(): Promise<StockResult[]> {
    try {
      console.log('🚀 Calling Grok with tool calling for 15 trending stocks...');
      
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'grok-4',
          messages: [
            {
              role: 'system',
              content: 'You are Grok with access to real-time Twitter/X data. Find 15 interesting stocks trending TODAY. Use tools to get additional information about stocks you find.'
            },
            {
              role: 'user', 
              content: 'Find 15 stocks that are interesting and trending on Twitter today. For each stock, provide just the ticker and a brief reason why it\'s interesting. Exclude mega caps like AAPL, NVDA, TSLA, MSFT, META, GOOGL, AMZN. Focus on small to mid-cap stocks with real catalysts or momentum.'
            }
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'search_stock_news',
                description: 'Search for recent news about a specific stock ticker',
                parameters: {
                  type: 'object',
                  properties: {
                    ticker: {
                      type: 'string',
                      description: 'Stock ticker symbol (e.g., PLTR, SOFI)'
                    }
                  },
                  required: ['ticker']
                }
              }
            },
            {
              type: 'function', 
              function: {
                name: 'get_stock_fundamentals',
                description: 'Get basic fundamental data for a stock',
                parameters: {
                  type: 'object',
                  properties: {
                    ticker: {
                      type: 'string',
                      description: 'Stock ticker symbol'
                    }
                  },
                  required: ['ticker']
                }
              }
            }
          ],
          tool_choice: 'auto',
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Grok API response received');
      
      // Parse the response to extract stock tickers and reasons
      const content = data.choices[0].message.content;
      const stocks = this.parseStocksFromResponse(content);
      
      return stocks;
      
    } catch (error) {
      console.error('Grok API call failed:', error);
      throw new Error('Failed to get live Twitter stock data from Grok');
    }
  }

  private parseStocksFromResponse(content: string): StockResult[] {
    console.log('📝 Parsing stocks from Grok response...');
    
    const stocks: StockResult[] = [];
    
    // Look for patterns like "TICKER - reason" or "TICKER: reason"
    const patterns = [
      /(\b[A-Z]{2,5}\b)\s*[-:]\s*(.+?)(?=\n|\d+\.|$)/g,
      /(\b[A-Z]{2,5}\b)\s*\(([^)]+)\)/g,
      /\*\*(\b[A-Z]{2,5}\b)\*\*[:\s]*(.+?)(?=\n|$)/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null && stocks.length < 15) {
        const ticker = match[1].trim();
        const reason = match[2].trim().replace(/^\d+\.\s*/, '').substring(0, 100);
        
        // Filter out common non-ticker words
        if (!this.isValidTicker(ticker)) continue;
        
        // Avoid duplicates
        if (stocks.some(s => s.ticker === ticker)) continue;
        
        stocks.push({ ticker, reason });
      }
    }
    
    // If we didn't find enough, extract any stock tickers mentioned
    if (stocks.length < 10) {
      const tickerRegex = /\b[A-Z]{3,5}\b/g;
      const foundTickers = content.match(tickerRegex) || [];
      
      for (const ticker of foundTickers) {
        if (stocks.length >= 15) break;
        if (!this.isValidTicker(ticker)) continue;
        if (stocks.some(s => s.ticker === ticker)) continue;
        
        stocks.push({ 
          ticker, 
          reason: 'Mentioned in Twitter discussions' 
        });
      }
    }
    
    return stocks.slice(0, 15);
  }

  private isValidTicker(ticker: string): boolean {
    const excludeWords = ['THE', 'AND', 'FOR', 'WITH', 'THIS', 'THAT', 'FROM', 'HAVE', 'THEY', 'BEEN', 'WERE', 'SAID', 'EACH', 'WHICH', 'WILL', 'ABOUT', 'WOULD', 'THERE', 'COULD', 'OTHER', 'MORE', 'VERY', 'TIME', 'WHEN', 'MUCH', 'GOOD', 'WELL', 'HERE', 'YOUR', 'THAN', 'MANY', 'WHAT', 'SOME', 'USD', 'API', 'CEO', 'IPO', 'ETF', 'GDP', 'USA', 'ALL', 'NEW', 'OLD', 'TOP', 'GET', 'SEE', 'NOW', 'WAY', 'YOU', 'CAN', 'OUT', 'WHO', 'HIM', 'HER', 'HIS', 'ITS', 'OUR', 'BUT', 'NOT', 'ONE', 'TWO', 'HOW', 'WHY', 'YES', 'MAY'];
    
    return ticker.length >= 3 && 
           ticker.length <= 5 && 
           !excludeWords.includes(ticker) &&
           /^[A-Z]+$/.test(ticker);
  }
} 