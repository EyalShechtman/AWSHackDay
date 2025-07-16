// Simple Twitter Agent using Grok + Tool Calling for live data
import * as geminiService from './geminiService';

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
      console.log('🔍 FULL GROK RESPONSE:', JSON.stringify(data, null, 2));
      
      // Parse the response to extract stock tickers and reasons
      const content = data.choices[0].message.content;
      console.log('📄 GROK CONTENT:', content);
      const stocks = await this.parseStocksWithGemini(content);
      
      return stocks;
      
    } catch (error) {
      console.error('Grok API call failed:', error);
      throw new Error('Failed to get live Twitter stock data from Grok');
    }
  }

  private async parseStocksWithGemini(content: string): Promise<StockResult[]> {
    console.log('🤖 Using Gemini to extract stocks from Grok response...');
    
    try {
      const prompt = `
Extract stock tickers and reasons from this Twitter/Grok analysis. Return EXACTLY 15 stocks in JSON format.

Here's the Grok response to parse:
${content}

Extract stocks mentioned and return as a JSON array with this exact format:
[
  {"ticker": "PLTR", "reason": "Strong AI momentum on Twitter"},
  {"ticker": "SOFI", "reason": "Fintech discussions trending"},
  ...
]

Rules:
- Return exactly 15 stocks
- Ticker must be 2-5 uppercase letters (valid stock symbols)
- Exclude mega caps like AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META
- Keep reasons under 100 characters
- Focus on stocks mentioned in Twitter discussions
- Return only valid JSON array, no other text
`;

      const geminiResponse = await geminiService.generateContent(prompt);
      console.log('🤖 Gemini extraction response:', geminiResponse);
      
      // Parse the JSON response
      let stocks: StockResult[] = [];
      try {
        // Clean the response to extract just the JSON
        const jsonMatch = geminiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          stocks = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON array found in response');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini JSON response:', parseError);
        console.log('Raw Gemini response:', geminiResponse);
        
        // Fallback: try to extract tickers manually
        const tickerMatches = content.match(/\b[A-Z]{2,5}\b/g) || [];
        const validTickers = tickerMatches
          .filter(ticker => this.isValidTicker(ticker))
          .slice(0, 15);
          
        stocks = validTickers.map(ticker => ({
          ticker,
          reason: 'Extracted from Twitter analysis'
        }));
      }
      
      console.log(`✅ Extracted ${stocks.length} stocks via Gemini`);
      return stocks.slice(0, 15);
      
    } catch (error) {
      console.error('❌ Gemini extraction failed:', error);
      
      // Simple fallback extraction
      const tickerMatches = content.match(/\b[A-Z]{2,5}\b/g) || [];
      const validTickers = tickerMatches
        .filter(ticker => this.isValidTicker(ticker))
        .slice(0, 15);
        
      return validTickers.map(ticker => ({
        ticker,
        reason: 'Fallback extraction from Twitter data'
      }));
    }
  }

  private isValidTicker(ticker: string): boolean {
    const excludeWords = ['THE', 'AND', 'FOR', 'WITH', 'THIS', 'THAT', 'FROM', 'HAVE', 'THEY', 'BEEN', 'WERE', 'SAID', 'EACH', 'WHICH', 'WILL', 'ABOUT', 'WOULD', 'THERE', 'COULD', 'OTHER', 'MORE', 'VERY', 'TIME', 'WHEN', 'MUCH', 'GOOD', 'WELL', 'HERE', 'YOUR', 'THAN', 'MANY', 'WHAT', 'SOME', 'USD', 'API', 'CEO', 'IPO', 'ETF', 'GDP', 'USA', 'ALL', 'NEW', 'OLD', 'TOP', 'GET', 'SEE', 'NOW', 'WAY', 'YOU', 'CAN', 'OUT', 'WHO', 'HIM', 'HER', 'HIS', 'ITS', 'OUR', 'BUT', 'NOT', 'ONE', 'TWO', 'HOW', 'WHY', 'YES', 'MAY'];
    
    return ticker.length >= 3 && 
           ticker.length <= 5 && 
           !excludeWords.includes(ticker) &&
           /^[A-Z]+$/.test(ticker);
  }
} 