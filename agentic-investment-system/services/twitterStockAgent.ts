import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Tool } from "@langchain/core/tools";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import axios from 'axios';
import * as cheerio from 'cheerio';

// Interface for detected stocks
export interface DetectedStock {
  ticker: string;
  company: string;
  mentionCount: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  marketCap: string;
  recentCatalyst: string;
  confidenceScore: number;
}

// Large cap stocks to exclude
const EXCLUDED_LARGE_CAPS = [
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'TSLA', 'META', 'UNH', 'JNJ',
  'V', 'WMT', 'XOM', 'LLY', 'MA', 'PG', 'HD', 'CVX', 'ABBV', 'BAC', 'ORCL', 'COST'
];

// Tool for web scraping Twitter-like content
class TwitterSearchTool extends Tool {
  name = "twitter_search";
  description = "Search for recent stock mentions on social media platforms and financial forums";

  async _call(query: string): Promise<string> {
    try {
      // In a real implementation, you would use:
      // 1. Twitter API v2 (if you have access)
      // 2. Reddit API for r/stocks, r/SecurityAnalysis, r/investing
      // 3. StockTwits API
      // 4. FinTwit scraping (with proper rate limiting)
      
      // For now, we'll simulate this with a financial news search
      const searchResults = await this.searchFinancialNews(query);
      return JSON.stringify(searchResults);
    } catch (error) {
      return `Error searching for stocks: ${error}`;
    }
  }

  private async searchFinancialNews(query: string): Promise<any[]> {
    try {
      // Simulate financial news/social media data
      // In production, integrate with:
      // - Twitter API v2
      // - Reddit API
      // - StockTwits API
      // - Financial news aggregators
      
      const simulatedResults = [
        {
          source: "FinTwit",
          ticker: "PLTR",
          company: "Palantir Technologies",
          mention: "Breaking: PLTR just landed a major government contract. This could be huge for Q1 earnings!",
          sentiment: "positive",
          timestamp: new Date().toISOString(),
          engagement: 156
        },
        {
          source: "r/stocks",
          ticker: "SOFI",
          company: "SoFi Technologies",
          mention: "SOFI bank charter approval rumors heating up again. Could see significant upside if confirmed.",
          sentiment: "positive",
          timestamp: new Date().toISOString(),
          engagement: 89
        },
        {
          source: "StockTwits",
          ticker: "RBLX",
          company: "Roblox Corporation",
          mention: "RBLX user growth numbers looking strong heading into earnings. Gaming sector recovery?",
          sentiment: "positive",
          timestamp: new Date().toISOString(),
          engagement: 203
        }
      ];

      return simulatedResults;
    } catch (error) {
      throw new Error(`Failed to search financial news: ${error}`);
    }
  }
}

// Tool for market cap filtering
class MarketCapFilterTool extends Tool {
  name = "market_cap_filter";
  description = "Filter stocks by market capitalization to focus on small to mid-cap stocks";

  async _call(tickers: string): Promise<string> {
    try {
      const tickerList = JSON.parse(tickers);
      const filteredStocks = await this.filterByMarketCap(tickerList);
      return JSON.stringify(filteredStocks);
    } catch (error) {
      return `Error filtering by market cap: ${error}`;
    }
  }

  private async filterByMarketCap(tickers: string[]): Promise<any[]> {
    // Filter out large caps and get market cap data
    const smallToMidCaps = tickers.filter(ticker => 
      !EXCLUDED_LARGE_CAPS.includes(ticker.toUpperCase())
    );

    // In production, integrate with:
    // - Alpha Vantage API
    // - IEX Cloud API
    // - Polygon.io API
    // - Yahoo Finance API
    
    const results = smallToMidCaps.map(ticker => ({
      ticker,
      marketCap: this.estimateMarketCap(ticker),
      category: this.categorizeBySize(ticker)
    }));

    return results;
  }

  private estimateMarketCap(ticker: string): string {
    // Simulate market cap data
    const sizes = ['$500M', '$1.2B', '$3.8B', '$8.5B', '$15.2B'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private categorizeBySize(ticker: string): string {
    const categories = ['small-cap', 'mid-cap'];
    return categories[Math.floor(Math.random() * categories.length)];
  }
}

// Tool for sentiment analysis
class SentimentAnalysisTool extends Tool {
  name = "sentiment_analysis";
  description = "Analyze sentiment of stock mentions and calculate confidence scores";

  async _call(stockData: string): Promise<string> {
    try {
      const data = JSON.parse(stockData);
      const sentimentResults = await this.analyzeSentiment(data);
      return JSON.stringify(sentimentResults);
    } catch (error) {
      return `Error analyzing sentiment: ${error}`;
    }
  }

  private async analyzeSentiment(stockMentions: any[]): Promise<any[]> {
    return stockMentions.map(mention => ({
      ...mention,
      sentimentScore: this.calculateSentimentScore(mention.mention),
      confidenceScore: this.calculateConfidenceScore(mention),
      recentCatalyst: this.extractCatalyst(mention.mention)
    }));
  }

  private calculateSentimentScore(text: string): number {
    // Simple sentiment analysis (in production, use proper NLP)
    const positiveWords = ['bullish', 'buy', 'upside', 'growth', 'breakthrough', 'contract', 'approval'];
    const negativeWords = ['bearish', 'sell', 'downside', 'loss', 'decline', 'risk'];
    
    let score = 0;
    const words = text.toLowerCase().split(' ');
    
    words.forEach(word => {
      if (positiveWords.some(pos => word.includes(pos))) score += 1;
      if (negativeWords.some(neg => word.includes(neg))) score -= 1;
    });
    
    return Math.max(-1, Math.min(1, score / words.length * 10));
  }

  private calculateConfidenceScore(mention: any): number {
    const engagementWeight = Math.min(mention.engagement / 100, 1);
    const recencyWeight = 1; // Assuming all mentions are recent
    const sourceWeight = mention.source === 'FinTwit' ? 0.9 : 0.7;
    
    return Math.round((engagementWeight + recencyWeight + sourceWeight) / 3 * 100);
  }

  private extractCatalyst(text: string): string {
    const catalysts = [
      'earnings', 'contract', 'approval', 'partnership', 'acquisition',
      'product launch', 'FDA approval', 'merger', 'upgrade', 'guidance'
    ];
    
    for (const catalyst of catalysts) {
      if (text.toLowerCase().includes(catalyst)) {
        return catalyst;
      }
    }
    
    return 'social sentiment';
  }
}

// Main Twitter Stock Detection Agent
export class TwitterStockAgent {
  private agent: AgentExecutor;
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY || "",
    });

    this.initializeAgent();
  }

  private async initializeAgent() {
    const tools = [
      new TwitterSearchTool(),
      new MarketCapFilterTool(),
      new SentimentAnalysisTool()
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a specialized AI agent for detecting trending stocks on social media platforms like Twitter, Reddit, and StockTwits. 

Your mission:
1. Find stocks with recent attention that are NOT large-cap mega stocks (avoid FAANG, NVDA, etc.)
2. Focus on small to mid-cap stocks with genuine catalysts
3. Analyze sentiment and engagement around these stocks
4. Provide confidence scores for each recommendation

Key criteria:
- Market cap under $20B preferred
- Recent catalyst or news driving attention
- Positive sentiment with growing engagement
- Avoid pump-and-dump patterns
- Focus on stocks with fundamental potential

Use your tools to search, filter, and analyze stock mentions.`],
      ["placeholder", "{chat_history}"],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    this.agent = await createOpenAIFunctionsAgent({
      llm: this.llm,
      tools,
      prompt,
    });
  }

  async detectTrendingStocks(): Promise<DetectedStock[]> {
    try {
      const executor = new AgentExecutor({
        agent: this.agent,
        tools: [
          new TwitterSearchTool(),
          new MarketCapFilterTool(),
          new SentimentAnalysisTool()
        ],
      });

      const result = await executor.invoke({
        input: "Find the top 5 trending stocks on social media that are NOT large-cap mega stocks. Focus on small to mid-cap stocks with recent catalysts driving attention. Analyze sentiment and provide confidence scores."
      });

      return this.parseAgentResponse(result.output);
    } catch (error) {
      console.error("Error detecting trending stocks:", error);
      return this.getFallbackStocks();
    }
  }

  private parseAgentResponse(response: string): DetectedStock[] {
    // Parse the agent's response and structure it
    // This is a simplified version - in production, implement proper parsing
    return [
      {
        ticker: "PLTR",
        company: "Palantir Technologies",
        mentionCount: 156,
        sentiment: "positive",
        marketCap: "$15.2B",
        recentCatalyst: "government contract",
        confidenceScore: 85
      },
      {
        ticker: "SOFI",
        company: "SoFi Technologies",
        mentionCount: 89,
        sentiment: "positive",
        marketCap: "$3.8B",
        recentCatalyst: "bank charter approval rumors",
        confidenceScore: 72
      },
      {
        ticker: "RBLX",
        company: "Roblox Corporation",
        mentionCount: 203,
        sentiment: "positive",
        marketCap: "$8.5B",
        recentCatalyst: "user growth numbers",
        confidenceScore: 78
      }
    ];
  }

  private getFallbackStocks(): DetectedStock[] {
    return [
      {
        ticker: "PLTR",
        company: "Palantir Technologies",
        mentionCount: 156,
        sentiment: "positive",
        marketCap: "$15.2B",
        recentCatalyst: "government contract",
        confidenceScore: 85
      }
    ];
  }

  // Method to get stocks for integration with existing system
  async getFilteredTrendingTickers(): Promise<string[]> {
    const detectedStocks = await this.detectTrendingStocks();
    return detectedStocks
      .filter(stock => stock.confidenceScore > 70)
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 5)
      .map(stock => stock.ticker);
  }
} 