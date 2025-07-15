
import React, { useState, useCallback } from 'react';
import { Trade, PortfolioDataPoint, AgentName, ProcessStatus, AgentOutput } from './types';
import { AGENT_PIPELINE, INITIAL_STRATEGY, INITIAL_PORTFOLIO_HISTORY } from './constants';
import * as geminiService from './services/geminiService';
import { StrategyEditor } from './components/StrategyEditor';
import { ProcessStepper } from './components/ProcessStepper';
import { PortfolioChart } from './components/PortfolioChart';
import { TradesTable } from './components/TradesTable';
import { Header } from './components/Header';
import { BrainCircuitIcon } from './components/icons';
import TwitterAnalysis from './components/TwitterAnalysis';

export default function App() {
  const [investmentStrategy, setInvestmentStrategy] = useState<string>(INITIAL_STRATEGY);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('idle');
  const [currentStep, setCurrentStep] = useState<AgentName>('Idle');
  const [finalTrades, setFinalTrades] = useState<Trade[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioDataPoint[]>(INITIAL_PORTFOLIO_HISTORY);
  const [agentOutputs, setAgentOutputs] = useState<Record<string, AgentOutput>>({});
  const [showTwitterAnalysis, setShowTwitterAnalysis] = useState<boolean>(true);
  const [detectedStocks, setDetectedStocks] = useState<string[]>([]);

  const handleRunCycle = useCallback(async () => {
    setProcessStatus('running');
    setErrorMessage(null);
    setFinalTrades([]);
    setAgentOutputs({});

    try {
      // Step 1: Enhanced Twitter Agent
      setCurrentStep('Enhanced Twitter Agent');
      const trendingStocks = await geminiService.getTrendingStocks();
              setAgentOutputs(prev => ({ ...prev, 'Enhanced Twitter Agent': { text: `Simulating Grok analysis of X/Twitter.\nIdentified trending stocks: ${trendingStocks.join(', ')}` } }));

      // Step 2: Finance Data Agent
      setCurrentStep('Finance Data Agent');
      const { summary: financialData, sources } = await geminiService.getFinancialData(trendingStocks);
      setAgentOutputs(prev => ({ ...prev, 'Finance Data Agent': { text: `Gathered financial data:\n${financialData.substring(0, 300)}...`, sources } }));
      
      // Step 3: Financial Decision Agent
      setCurrentStep('Financial Decision Agent');
      const investmentCandidates = await geminiService.getInvestmentCandidates(financialData);
      setAgentOutputs(prev => ({ ...prev, 'Financial Decision Agent': { text: `Selected candidates: ${investmentCandidates}` } }));

      // Step 4: Advisor Agent
      setCurrentStep('Advisor Agent');
      const advisorResult = await geminiService.getFinalTrades(investmentCandidates, investmentStrategy);
       if ('error' in advisorResult) {
        throw new Error(advisorResult.error);
      }
      setFinalTrades(advisorResult);
      setAgentOutputs(prev => ({ ...prev, 'Advisor Agent': { text: `Generated ${advisorResult.length} final trade recommendations.` } }));

      // Step 5: Trade Execution (Simulation)
      setCurrentStep('Trade Execution');
      const lastDataPoint = portfolioHistory[portfolioHistory.length - 1];
      const newPortfolioValue = lastDataPoint.value * (1 + (Math.random() - 0.4) / 20); // Simulate market change
      const newDataPoint = { day: lastDataPoint.day + 1, value: Math.round(newPortfolioValue) };
      setPortfolioHistory(prev => [...prev, newDataPoint]);
      setAgentOutputs(prev => ({ ...prev, 'Trade Execution': { text: `Simulated trades executed. New portfolio value: $${newDataPoint.value.toLocaleString()}` } }));

      setProcessStatus('completed');
      setCurrentStep('Idle');
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setErrorMessage(error.message || 'An unknown error occurred.');
      setProcessStatus('error');
      setCurrentStep('Idle');
    }
  }, [investmentStrategy, portfolioHistory]);

  const isRunning = processStatus === 'running';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <TwitterAnalysis 
              isVisible={showTwitterAnalysis} 
              onStocksDetected={setDetectedStocks} 
            />
            <StrategyEditor value={investmentStrategy} onChange={setInvestmentStrategy} disabled={isRunning} />
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <button
                onClick={handleRunCycle}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <BrainCircuitIcon className="w-6 h-6" />
                    Run Investment Cycle
                  </>
                )}
              </button>
            </div>
            <ProcessStepper currentStep={currentStep} status={processStatus} agentOutputs={agentOutputs} />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-80">
                <PortfolioChart data={portfolioHistory} />
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <TradesTable trades={finalTrades} status={processStatus} errorMessage={errorMessage} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
