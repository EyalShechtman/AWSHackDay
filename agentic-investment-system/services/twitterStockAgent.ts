// Simple Twitter Agent using Grok API for live stock data

// Simple Twitter Agent - Gets 15 trending stocks from Grok
export class TwitterStockAgent {
  
  constructor() {
    console.log('🐦 TwitterStockAgent initialized - will get 15 trending stocks from live Twitter data');
  }

  /**
   * Get 15 trending stocks with explanations using real Grok API
   */
  async getTrendingStocks(): Promise<{ ticker: string; reason: string }[]> {
    try {
      console.log('🐦 Getting 15 trending stocks from Grok...');
      
      const { GrokService } = await import('./grokService');
      const grokService = new GrokService();
      
      const stocks = await grokService.findTrendingStocksOnTwitter();
      
      console.log(`✅ Found ${stocks.length} trending stocks from live Twitter data`);
      return stocks;
      
    } catch (error) {
      console.error("Failed to get trending stocks:", error);
      throw error; // No fallback - we want real data only
    }
  }

  /**
   * Get just the tickers for pipeline integration
   */
  async getTrendingTickers(): Promise<string[]> {
    const stocks = await this.getTrendingStocks();
    return stocks.map(stock => stock.ticker);
  }
} 