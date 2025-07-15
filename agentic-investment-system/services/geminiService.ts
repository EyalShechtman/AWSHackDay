
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Trade, Source } from '../types';
import { FINANCIAL_ANALYST_PROMPT } from '../constants';
import { GrokService } from './grokService';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const grokService = new GrokService();

export interface FinancialDataResult {
    summary: string;
    sources: Source[];
}

/**
 * Agent 1: Enhanced Twitter stock detection using Grok integration
 * Focuses on lesser-known stocks with recent attention
 */
export async function getTrendingStocks(): Promise<string[]> {
    try {
        // Try to get stocks from Grok first (real-time Twitter data)
        const grokStocks = await grokService.getEnhancedTrendingStocks();
        
        if (grokStocks.length > 0) {
            console.log('Using Grok real-time Twitter data for trending stocks');
            return grokStocks;
        }
    } catch (error) {
        console.warn('Grok service unavailable, falling back to Gemini simulation');
    }

    // Fallback to enhanced Gemini simulation
    const prompt = `You are a specialized AI agent analyzing recent social media activity for stock trends. Focus on LESSER-KNOWN stocks with recent catalysts, NOT mega-cap stocks like AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, or META.

Target criteria:
- Market cap under $20B (small to mid-cap)
- Recent catalysts: earnings beats, contract wins, regulatory approvals, partnerships
- Genuine community discussion (not pump schemes)
- Stocks showing momentum but not yet mainstream attention

Exclude large-cap stocks. Focus on hidden gems with fundamental potential.
Provide 5-8 tickers as comma-separated string. Example: PLTR,SOFI,RBLX,SNOW,CRWD`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.7 }
    });

    const text = response.text?.trim() || '';
    const tickers = text.split(',').map(ticker => ticker.trim()).filter(ticker => ticker.length > 0);
    
    // Filter out any large caps that might have slipped through
    const excludedLargeCaps = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'TSLA', 'META', 'UNH', 'JNJ'];
    return tickers.filter(ticker => !excludedLargeCaps.includes(ticker.toUpperCase()));
}

/**
 * Enhanced function that combines Grok real-time data with Gemini analysis
 */
export async function getEnhancedTrendingStocks(): Promise<{tickers: string[], source: string, confidence: number}> {
    try {
        // Get real-time Twitter data from Grok
        const grokResult = await grokService.findTrendingStocksOnTwitter();
        
        if (grokResult.confidence > 75) {
            return {
                tickers: grokResult.trendingStocks,
                source: 'Grok Real-time Twitter Analysis',
                confidence: grokResult.confidence
            };
        }
    } catch (error) {
        console.warn('Grok integration failed, using Gemini fallback');
    }

    // Fallback to enhanced Gemini
    const tickers = await getTrendingStocks();
    return {
        tickers,
        source: 'Gemini Enhanced Social Media Simulation',
        confidence: 70
    };
}

/**
 * Agent 2: Simulates gathering financial data for a list of stocks using Google Search.
 */
export async function getFinancialData(tickers: string[]): Promise<FinancialDataResult> {
    const prompt = `Using your search tool, find the latest key financial data points and news for the following stock tickers: ${tickers.join(', ')}. For each ticker, provide a concise summary including EPS, Revenue, P/E ratio, and a summary of the most recent (last 7 days) news sentiment (positive, neutral, or negative). Present it as a well-formatted block of text with each ticker clearly separated.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
            temperature: 0.3
        }
    });
    
    const summary = response.text || 'No summary available';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: Source[] = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title)
        .map((web: any) => ({ uri: web.uri, title: web.title }))
        // Deduplicate sources based on URI
        .filter((value, index, self) => 
            index === self.findIndex((t) => (t.uri === value.uri))
        );

    return { summary, sources };
}

/**
 * Agent 3: Simulates a financial decision agent filtering candidates.
 */
export async function getInvestmentCandidates(financialData: string): Promise<string> {
    const prompt = `Given the following financial data summaries:\n\n${financialData}\n\nAnalyze this information and select the top 5 most promising investment candidates based on a balance of strong fundamentals and positive sentiment. List only their tickers, as a single comma-separated string.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.4 }
    });
    
    return response.text?.trim() || '';
}

/**
 * Agent 4: The Advisor Agent that makes final trade recommendations based on user strategy.
 */
export async function getFinalTrades(candidates: string, userStrategy: string): Promise<Trade[] | { error: string }> {
    const fullPrompt = `
        ${FINANCIAL_ANALYST_PROMPT}

        **User's Custom Strategy Directive:**
        ${userStrategy}

        **Investment Candidates to Analyze:**
        Analyze the following candidate stocks: ${candidates}.

        **Output Format:**
        Instead of a text table, provide your output strictly as a single JSON object. 
        The object can contain one of two keys: "trades" or "error".
        - If you find 5 trades that meet all criteria, the key should be "trades", and its value should be an array of 5 trade objects. Each trade object must have keys: "ticker", "strategy", "legs", "thesis" (string, max 30 words), and "pop" (number).
        - If fewer than 5 trades satisfy all criteria, the key should be "error", and its value should be a string explaining why (e.g., "Fewer than 5 trades meet criteria, do not execute.").
        Do not include any other text, explanations, or markdown formatting outside of the single, valid JSON object.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
          trades: {
            type: Type.ARRAY,
            nullable: true,
            description: "The list of recommended trades.",
            items: {
              type: Type.OBJECT,
              properties: {
                ticker: { type: Type.STRING },
                strategy: { type: Type.STRING },
                legs: { type: Type.STRING },
                thesis: { type: Type.STRING, description: 'A concise thesis, max 30 words.' },
                pop: { type: Type.NUMBER, description: 'Probability of Profit' }
              },
              required: ['ticker', 'strategy', 'legs', 'thesis', 'pop']
            }
          },
          error: {
            type: Type.STRING,
            nullable: true,
            description: "An error message if no suitable trades are found."
          }
        }
      };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            },
        });

        const jsonText = response.text || '{}';
        const result = JSON.parse(jsonText);

        if (result.error) {
            return { error: result.error };
        }
        if (result.trades && Array.isArray(result.trades)) {
            return result.trades;
        }
        
        return { error: "Received an unexpected but valid JSON format from the AI." };

    } catch (e) {
        console.error("Gemini API call or JSON parsing failed:", e);
        return { error: "Failed to get a valid response from the Advisor Agent. The model may have generated invalid JSON or an API error occurred." };
    }
}
