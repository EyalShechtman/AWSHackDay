// Finance Data Agent - Comprehensive Stock Data Collection using Finnhub API
// Collects ALL available financial data and saves to JSON files

import { generateContent } from './geminiService';

export interface ComprehensiveStockData {
  ticker: string;
  timestamp: string;
  company: {
    profile: any;
    executives: any;
    news: any[];
  };
  market: {
    quote: any;
    candles: any;
    metrics: any;
    recommendation: any;
    priceTarget: any;
  };
  financials: {
    basicFinancials: any;
    reportedFinancials: any;
    earnings: any;
    earningsCalendar: any;
  };
  ownership: {
    institutionalOwnership: any;
    fundOwnership: any;
    insiderTransactions: any;
  };
  technical: {
    technicalIndicators: any;
    supportResistance: any;
    patternRecognition: any;
  };
  market_data: {
    similarStocks: any;
    sectorPerformance: any;
    socialSentiment: any;
  };
}

export class FinanceDataAgent {
  private apiKey: string;
  private baseUrl = 'https://finnhub.io/api/v1';

  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ FINNHUB_API_KEY not found. Finance data collection will not work.');
    }
  }

  /**
   * Main method: Collect ALL financial data for given stock tickers
   */
  async collectAllFinancialData(tickers: string[]): Promise<void> {
    console.log(`📊 Starting comprehensive data collection for ${tickers.length} stocks...`);
    
    if (!this.apiKey) {
      throw new Error('FINNHUB_API_KEY not found. Cannot collect financial data.');
    }

    const results: ComprehensiveStockData[] = [];

    for (const ticker of tickers) {
      console.log(`\n📈 Collecting data for ${ticker}...`);
      
      try {
        const stockData = await this.collectSingleStockData(ticker);
        results.push(stockData);
        console.log(`✅ Completed data collection for ${ticker}`);
        
        // Small delay to respect API rate limits
        await this.delay(100);
        
      } catch (error) {
        console.error(`❌ Failed to collect data for ${ticker}:`, error);
        // Skip failed stocks - no error placeholders needed
      }
    }

    // Save all data to JSON files
    await this.saveDataToFiles(results);
    console.log(`\n🎉 Financial data collection completed for all ${tickers.length} stocks!`);
  }

  /**
   * Collect ALL available data for a single stock
   */
  private async collectSingleStockData(ticker: string): Promise<ComprehensiveStockData> {
    console.log(`📋 Gathering comprehensive data for ${ticker}...`);

    const data: ComprehensiveStockData = {
      ticker,
      timestamp: new Date().toISOString(),
      company: {
        profile: null,
        executives: null,
        news: []
      },
      market: {
        quote: null,
        candles: null,
        metrics: null,
        recommendation: null,
        priceTarget: null
      },
      financials: {
        basicFinancials: null,
        reportedFinancials: null,
        earnings: null,
        earningsCalendar: null
      },
      ownership: {
        institutionalOwnership: null,
        fundOwnership: null,
        insiderTransactions: null
      },
      technical: {
        technicalIndicators: null,
        supportResistance: null,
        patternRecognition: null
      },
      market_data: {
        similarStocks: null,
        sectorPerformance: null,
        socialSentiment: null
      }
    };

    // Collect all data in parallel for efficiency
    const promises = [
      // Company Information
      this.fetchData(`/stock/profile2?symbol=${ticker}`).then(res => data.company.profile = res),
      this.fetchData(`/stock/executive?symbol=${ticker}`).then(res => data.company.executives = res),
      this.fetchData(`/company-news?symbol=${ticker}&from=${this.getDateDaysAgo(7)}&to=${this.getToday()}`).then(res => data.company.news = res),

      // Market Data
      this.fetchData(`/quote?symbol=${ticker}`).then(res => data.market.quote = res),
      this.fetchData(`/stock/candle?symbol=${ticker}&resolution=D&from=${this.getUnixDaysAgo(30)}&to=${this.getUnixToday()}`).then(res => data.market.candles = res),
      this.fetchData(`/stock/metric?symbol=${ticker}&metric=all`).then(res => data.market.metrics = res),
      this.fetchData(`/stock/recommendation?symbol=${ticker}`).then(res => data.market.recommendation = res),
      this.fetchData(`/stock/price-target?symbol=${ticker}`).then(res => data.market.priceTarget = res),

      // Financial Data
      this.fetchData(`/stock/metric?symbol=${ticker}&metric=all`).then(res => data.financials.basicFinancials = res),
      this.fetchData(`/stock/financials-reported?symbol=${ticker}&freq=annual`).then(res => data.financials.reportedFinancials = res),
      this.fetchData(`/stock/earnings?symbol=${ticker}`).then(res => data.financials.earnings = res),
      this.fetchData(`/calendar/earnings?from=${this.getDateDaysAgo(30)}&to=${this.getDateDaysAgo(-30)}&symbol=${ticker}`).then(res => data.financials.earningsCalendar = res),

      // Ownership Data
      this.fetchData(`/stock/institutional-ownership?symbol=${ticker}`).then(res => data.ownership.institutionalOwnership = res),
      this.fetchData(`/stock/fund-ownership?symbol=${ticker}`).then(res => data.ownership.fundOwnership = res),
      this.fetchData(`/stock/insider-transactions?symbol=${ticker}&from=${this.getDateDaysAgo(90)}&to=${this.getToday()}`).then(res => data.ownership.insiderTransactions = res),

      // Technical Analysis
      this.fetchData(`/indicator?symbol=${ticker}&resolution=D&from=${this.getUnixDaysAgo(100)}&to=${this.getUnixToday()}&indicator=rsi&timeperiod=14`).then(res => data.technical.technicalIndicators = res),
      this.fetchData(`/scan/support-resistance?symbol=${ticker}&resolution=D`).then(res => data.technical.supportResistance = res),
      this.fetchData(`/scan/pattern?symbol=${ticker}&resolution=D`).then(res => data.technical.patternRecognition = res),

      // Market Context
      this.fetchData(`/stock/peers?symbol=${ticker}`).then(res => data.market_data.similarStocks = res),
      this.fetchData(`/stock/social-sentiment?symbol=${ticker}&from=${this.getDateDaysAgo(7)}&to=${this.getToday()}`).then(res => data.market_data.socialSentiment = res),
    ];

    // Wait for all API calls to complete
    await Promise.allSettled(promises);

    console.log(`📊 Collected ${Object.keys(data).length} data categories for ${ticker}`);
    return data;
  }

  /**
   * Make API call to Finnhub
   */
  private async fetchData(endpoint: string): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`❌ API call failed for ${endpoint}:`, error);
      return null;
    }
  }

  /**
   * Save all collected data to organized JSON files
   */
  private async saveDataToFiles(results: ComprehensiveStockData[]): Promise<void> {
    console.log('\n💾 Saving data to JSON files...');

    try {
      // Create data directory structure
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const dataDir = `financial-data-${timestamp}`;
      
      // Save master file with all data
      const masterData = {
        generated_at: new Date().toISOString(),
        total_stocks: results.length,
        stocks: results
      };

      // In a real Node.js environment, you'd use fs.writeFileSync
      // For browser environment, we'll use downloadable JSON
      this.downloadJSON(masterData, `${dataDir}/master-financial-data.json`);

      // Save individual stock files
      for (const stock of results) {
        this.downloadJSON(stock, `${dataDir}/stocks/${stock.ticker}-complete-data.json`);
      }

      // Summary generation removed per user request

      console.log(`✅ All data saved to JSON files in ${dataDir}/`);
      
    } catch (error) {
      console.error('❌ Failed to save data to files:', error);
    }
  }

  // Summary generation method removed per user request

  /**
   * Download JSON data (browser-compatible)
   */
  private downloadJSON(data: any, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`📁 Downloaded: ${filename}`);
  }

  // Helper date methods
  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  private getUnixToday(): number {
    return Math.floor(Date.now() / 1000);
  }

  private getUnixDaysAgo(days: number): number {
    return Math.floor((Date.now() - (days * 24 * 60 * 60 * 1000)) / 1000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 