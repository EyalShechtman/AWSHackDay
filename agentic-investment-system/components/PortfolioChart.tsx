
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PortfolioDataPoint } from '../types';

interface PortfolioChartProps {
    data: PortfolioDataPoint[];
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
    return (
        <>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Portfolio Value</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 35, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#9ca3af"
                      label={{ value: 'Trading Days', position: 'insideBottom', offset: -15, fill: '#9ca3af' }}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb' }}
                        labelStyle={{ color: '#9ca3af' }}
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend wrapperStyle={{ bottom: 0 }}/>
                    <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
};
