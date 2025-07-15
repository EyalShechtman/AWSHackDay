
export interface Trade {
  ticker: string;
  strategy: string;
  legs: string;
  thesis: string;
  pop: number;
}

export interface PortfolioDataPoint {
  day: number;
  value: number;
}

export interface Source {
  uri: string;
  title: string;
}

export interface AgentOutput {
  text: string;
  sources?: Source[];
}

export interface TwitterStockResult {
  tickers: string[];
  source: string;
  confidence: number;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  analysis?: string;
}

export interface EnhancedStockData {
  ticker: string;
  company: string;
  marketCap: string;
  recentCatalyst: string;
  socialMentions: number;
  confidenceScore: number;
}

export type AgentName = 'Enhanced Twitter Agent' | 'Finance Data Agent' | 'Financial Decision Agent' | 'Advisor Agent' | 'Trade Execution' | 'Idle';

export type ProcessStatus = 'idle' | 'running' | 'completed' | 'error';
