
import React from 'react';
import { AgentName, ProcessStatus, AgentOutput } from '../types';
import { AGENT_PIPELINE } from '../constants';
import { CheckIcon, CogIcon, DollarSignIcon, MessageSquareIcon, SearchIcon, ZapIcon, LinkIcon } from './icons';

const getIcon = (agent: AgentName) => {
    switch(agent) {
        case 'Twitter Agent': return <SearchIcon className="w-5 h-5" />;
        case 'Finance Data Agent': return <DollarSignIcon className="w-5 h-5" />;
        case 'Financial Decision Agent': return <CogIcon className="w-5 h-5" />;
        case 'Advisor Agent': return <MessageSquareIcon className="w-5 h-5" />;
        case 'Trade Execution': return <ZapIcon className="w-5 h-5" />;
        default: return <CogIcon className="w-5 h-5" />;
    }
}

interface ProcessStepperProps {
    currentStep: AgentName;
    status: ProcessStatus;
    agentOutputs: Record<string, AgentOutput>;
}

export const ProcessStepper: React.FC<ProcessStepperProps> = ({ currentStep, status, agentOutputs }) => {
    
    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Agent Pipeline Status</h3>
            <ol className="relative border-l border-gray-700">
                {AGENT_PIPELINE.map((agent) => {
                    const agentIndex = AGENT_PIPELINE.indexOf(agent);
                    const currentIndex = AGENT_PIPELINE.indexOf(currentStep);
                    const isCompleted = status === 'completed' || (status === 'running' && agentIndex < currentIndex) || (status === 'error' && agentIndex < currentIndex);
                    const isActive = status === 'running' && agentIndex === currentIndex;
                    
                    let ringColor = 'bg-gray-600';
                    let textColor = 'text-gray-400';
                    if(isActive) {
                        ringColor = 'bg-indigo-500 ring-4 ring-indigo-500/30';
                        textColor = 'text-white font-semibold';
                    } else if (isCompleted) {
                        ringColor = 'bg-green-500';
                        textColor = 'text-gray-200';
                    } else if (status === 'error' && agentIndex === currentIndex) {
                        ringColor = 'bg-red-500 ring-4 ring-red-500/30';
                        textColor = 'text-white font-semibold';
                    }

                    const output = agentOutputs[agent];

                    return (
                        <li key={agent} className="mb-8 ml-6">
                            <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 transition-all ${ringColor}`}>
                                {isCompleted ? <CheckIcon className="w-5 h-5 text-white" /> : getIcon(agent)}
                            </span>
                            <h4 className={`text-md transition-colors ${textColor}`}>
                                {agent}
                                {isActive && <span className="text-indigo-400 animate-pulse ml-2"> (Running...)</span>}
                            </h4>
                            { (isCompleted || isActive) && output && (
                                <div className="mt-2 text-xs p-3 bg-gray-900/50 rounded-md border border-gray-700">
                                    <p className="text-gray-400 whitespace-pre-wrap font-mono">{output.text}</p>
                                    {output.sources && output.sources.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-gray-700/50">
                                            <h5 className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-2">
                                                <LinkIcon className="w-3 h-3" />
                                                Sources
                                            </h5>
                                            <ul className="space-y-1">
                                                {output.sources.map((source, i) => (
                                                    <li key={i}>
                                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline truncate block text-[11px]" title={source.uri}>
                                                            {source.title || source.uri}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};
