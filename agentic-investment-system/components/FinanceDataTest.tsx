import { useState } from 'react';
import { FinanceDataAgent } from '../services/financeDataAgent';
import { TwitterStockAgent } from '../services/twitterStockAgent';

export default function FinanceDataTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [tickers, setTickers] = useState<string[]>([]);

  const testFinanceDataCollection = async () => {
    setIsRunning(true);
    setStatus('🚀 Starting comprehensive financial data collection...');

    try {
      // Step 1: Get trending stocks from Twitter Agent
      setStatus('🐦 Getting trending stocks from Twitter...');
      const twitterAgent = new TwitterStockAgent();
      const stocksData = await twitterAgent.getTrendingStocks();
      const stockTickers = stocksData.map(s => s.ticker);
      setTickers(stockTickers);
      
      console.log('📈 Got stocks from Twitter Agent:', stockTickers);
      setStatus(`✅ Got ${stockTickers.length} stocks: ${stockTickers.join(', ')}`);

      // Small delay to show the transition
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Collect comprehensive financial data
      setStatus('📊 Collecting ALL financial data from Finnhub API...');
      const financeAgent = new FinanceDataAgent();
      
      // Run the comprehensive data collection
      await financeAgent.collectAllFinancialData(stockTickers);
      
      setStatus(`🎉 SUCCESS! Collected comprehensive financial data for all ${stockTickers.length} stocks and saved to JSON files!`);
      console.log('✅ Financial data collection completed successfully!');

    } catch (error) {
      console.error('❌ Finance data collection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ FAILED: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          📊 Finance Data Agent
        </h2>
        <button
          onClick={testFinanceDataCollection}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? '🚀 Collecting Data...' : '📊 Run Complete Data Collection'}
        </button>
      </div>

      {/* Status Display */}
      {status && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 font-medium">{status}</p>
          {isRunning && (
            <div className="mt-2">
              <div className="animate-pulse bg-blue-200 h-2 rounded-full"></div>
              <p className="text-xs text-blue-600 mt-1">
                This will collect company profiles, market data, financials, ownership, technical indicators, and more...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tickers Display */}
      {tickers.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Stocks Being Analyzed:</h3>
          <div className="flex flex-wrap gap-2">
            {tickers.map((ticker) => (
              <span
                key={ticker}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium"
              >
                {ticker}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">🔥 What This Agent Collects:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
          <div>
            <strong>Company Data:</strong>
            <ul className="list-disc list-inside ml-2">
              <li>Company profiles & executives</li>
              <li>Recent news (7 days)</li>
              <li>Corporate information</li>
            </ul>
          </div>
          <div>
            <strong>Market Data:</strong>
            <ul className="list-disc list-inside ml-2">
              <li>Real-time quotes & candles</li>
              <li>Analyst recommendations</li>
              <li>Price targets & metrics</li>
            </ul>
          </div>
          <div>
            <strong>Financial Data:</strong>
            <ul className="list-disc list-inside ml-2">
              <li>Financial statements</li>
              <li>Earnings data & calendar</li>
              <li>Key financial metrics</li>
            </ul>
          </div>
          <div>
            <strong>Advanced Data:</strong>
            <ul className="list-disc list-inside ml-2">
              <li>Institutional ownership</li>
              <li>Technical indicators</li>
              <li>Social sentiment</li>
            </ul>
          </div>
        </div>
        <div className="mt-2 p-2 bg-green-100 rounded">
          <p className="text-xs text-green-600">
            <strong>💾 Output:</strong> Downloads comprehensive JSON files with all financial data organized by category. 
            No analysis - pure raw data collection for further processing.
          </p>
        </div>
      </div>
    </div>
  );
} 