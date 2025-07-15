
import React from 'react';

interface StrategyEditorProps {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

export const StrategyEditor: React.FC<StrategyEditorProps> = ({ value, onChange, disabled }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <label htmlFor="strategy" className="block text-lg font-semibold text-gray-200 mb-3">
                Your Investment Strategy
            </label>
            <p className="text-sm text-gray-400 mb-4">
                Define the goals and rules for the Advisor Agent. It will use this prompt to select the final trades.
            </p>
            <textarea
                id="strategy"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                rows={8}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-200 disabled:bg-gray-800 disabled:text-gray-500"
                placeholder="e.g., Focus on high-growth tech stocks with strong cash flow..."
            />
        </div>
    );
};
