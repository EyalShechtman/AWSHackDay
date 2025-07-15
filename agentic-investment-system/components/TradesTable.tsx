
import React from 'react';
import { Trade, ProcessStatus } from '../types';

interface TradesTableProps {
    trades: Trade[];
    status: ProcessStatus;
    errorMessage: string | null;
}

const TableSkeleton: React.FC = () => (
    <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4 py-3 px-2 border-b border-gray-700">
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-700 rounded w-2/6"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
            </div>
        ))}
    </div>
);

export const TradesTable: React.FC<TradesTableProps> = ({ trades, status, errorMessage }) => {
    const renderContent = () => {
        if (status === 'running') {
            return <TableSkeleton />;
        }

        if (status === 'error') {
            return (
                <div className="text-center py-10 px-4">
                    <p className="text-red-400 text-lg font-semibold">An Error Occurred</p>
                    <p className="text-gray-400 mt-2 bg-red-900/20 p-3 rounded-md">{errorMessage || 'Something went wrong.'}</p>
                </div>
            );
        }

        if (status === 'completed' && trades.length === 0) {
            return (
                <div className="text-center py-10">
                    <p className="text-yellow-400 text-lg font-semibold">No Trades Recommended</p>
                    <p className="text-gray-400 mt-2">The Advisor Agent determined that no available trades met the specified criteria.</p>
                </div>
            );
        }

        if (status === 'idle' && trades.length === 0) {
             return (
                <div className="text-center py-10">
                    <p className="text-gray-400 text-lg font-semibold">Ready to Analyze</p>
                    <p className="text-gray-500 mt-2">Configure your strategy and run the investment cycle to see trade recommendations.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">Ticker</th>
                            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">Strategy</th>
                            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">Legs</th>
                            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">Thesis</th>
                            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">POP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 bg-gray-900">
                        {trades.map((trade, index) => (
                            <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                                <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-white">{trade.ticker}</td>
                                <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-300">{trade.strategy}</td>
                                <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-300">{trade.legs}</td>
                                <td className="py-4 px-4 text-sm text-gray-400 max-w-xs truncate" title={trade.thesis}>{trade.thesis}</td>
                                <td className="whitespace-nowrap py-4 px-4 text-sm text-green-400">{trade.pop.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Trade Recommendations</h3>
            {renderContent()}
        </div>
    );
};
