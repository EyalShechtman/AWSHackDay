
import React from 'react';
import { BrainCircuitIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="flex items-center justify-between pb-4 border-b border-gray-700">
            <div className="flex items-center gap-4">
                <BrainCircuitIcon className="h-10 w-10 text-indigo-400" />
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Agentic Investment System</h1>
                    <p className="text-sm text-gray-400">MVP Dashboard</p>
                </div>
            </div>
        </header>
    );
};
