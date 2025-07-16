# Agentic Investment System

## Overview
The Agentic Investment System is a multi-agent pipeline designed to analyze financial data and make investment decisions. It integrates various APIs, including Twitter for sentiment analysis and Finnhub for comprehensive financial data collection.

## Features
- **Twitter Agent**: Gathers real-time trending stocks from Twitter discussions.
- **Finance Data Agent**: Collects extensive financial statistics using the Finnhub API, including:
  - Company profiles and executives
  - Market data (quotes, candles, recommendations)
  - Financial statements and earnings
  - Ownership data (institutional and insider transactions)
  - Technical indicators and social sentiment
- **Data Storage**: Saves all collected data in structured JSON files for easy access and analysis.

## Getting Started
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env.local` file:
   ```plaintext
   FINNHUB_API_KEY=your_finnhub_api_key
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   XAI_API_KEY=your_xai_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage
- Use the Twitter Agent to fetch trending stocks.
- Run the Finance Data Agent to collect comprehensive financial data for the identified stocks.
- All data will be saved in JSON format for further analysis.