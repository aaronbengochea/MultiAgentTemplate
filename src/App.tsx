/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Users, 
  Play, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Terminal,
  Layers,
  Wrench,
  Zap,
  Box
} from 'lucide-react';
import { orchestrateDynamicTask, AgentResult } from './services/agentService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [input, setInput] = useState('Design a sustainable city for 1 million people in the Sahara desert');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agents, setAgents] = useState<AgentResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-10));
  };

  const handleRun = async () => {
    if (!input.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setAgents([]);
    setLogs([]);
    addLog("Master Orchestrator initialized...");
    addLog("Analyzing complex request...");
    addLog("PHASE 1: Dynamic Agent Planning...");

    try {
      await orchestrateDynamicTask(input, (updatedAgents) => {
        setAgents(updatedAgents);
      });
      addLog("PHASE 2: Parallel Execution with Injected Skills/Tools...");
      addLog("All dynamic agents completed.");
    } catch (error) {
      addLog("Orchestration failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-[#F0F0F0]">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] p-6 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-serif">
            Dynamic Agent Factory
          </h1>
          <p className="text-[10px] opacity-60 font-mono uppercase tracking-[0.2em] mt-1">
            On-the-fly Orchestration & Tool Injection
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 border border-[#1A1A1A] rounded-full text-[10px] font-mono uppercase font-bold">
            <span className={cn("w-2 h-2 rounded-full", isProcessing ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
            {isProcessing ? "Factory Active" : "Factory Idle"}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Control Panel */}
        <section className="lg:col-span-4 space-y-8">
          <div className="border-2 border-[#1A1A1A] p-6 bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="text-xs font-mono uppercase opacity-50 mb-6 flex items-center gap-2 font-bold">
              <Terminal size={14} /> Mission Brief
            </h2>
            <div className="space-y-6">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a complex mission..."
                className="w-full h-40 bg-transparent border-2 border-[#1A1A1A] p-4 text-sm focus:outline-none focus:bg-amber-50/30 transition-colors resize-none font-medium"
                disabled={isProcessing}
              />
              <button
                onClick={handleRun}
                disabled={isProcessing || !input.trim()}
                className={cn(
                  "w-full py-5 flex items-center justify-center gap-3 border-2 border-[#1A1A1A] transition-all duration-200 uppercase text-xs font-black tracking-widest",
                  isProcessing 
                    ? "bg-[#1A1A1A] text-[#F0F0F0] cursor-not-allowed" 
                    : "bg-white hover:bg-[#1A1A1A] hover:text-[#F0F0F0] hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Spawning Agents...
                  </>
                ) : (
                  <>
                    <Zap size={18} fill="currentColor" />
                    Initialize Factory
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-2 border-[#1A1A1A] p-6 bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="text-xs font-mono uppercase opacity-50 mb-4 font-bold">Factory Telemetry</h2>
            <div className="space-y-3 font-mono text-[10px] leading-relaxed">
              {logs.length === 0 && <p className="opacity-30 italic">Awaiting mission parameters...</p>}
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 border-l-2 border-[#1A1A1A]/10 pl-3">
                  <span className="opacity-40 shrink-0">[{i}]</span>
                  <span className="font-semibold">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Agent Visualizer */}
        <section className="lg:col-span-8 space-y-10">
          {/* Orchestrator Node */}
          <div className="flex flex-col items-center">
            <motion.div 
              animate={isProcessing ? { 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.02, 1]
              } : {}}
              transition={{ repeat: Infinity, duration: 4 }}
              className={cn(
                "w-32 h-32 border-4 border-[#1A1A1A] flex flex-col items-center justify-center relative z-10 bg-white shadow-[12px_12px_0px_0px_rgba(26,26,26,1)]",
                isProcessing && "bg-[#1A1A1A] text-[#F0F0F0]"
              )}
            >
              <Cpu size={40} />
              <span className="text-[10px] font-mono uppercase mt-3 font-black tracking-tighter">Master Brain</span>
              
              {/* Dynamic Connecting Lines (SVG) */}
              {agents.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[800px] h-24 -z-10 overflow-visible hidden md:block">
                  <svg width="100%" height="100%" viewBox="0 0 800 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d={`M400 0V48 M400 48 H${400 - (agents.length - 1) * 80} V96 M400 48 H${400 + (agents.length - 1) * 80} V96`} 
                      stroke="#1A1A1A" 
                      strokeWidth="2" 
                      strokeDasharray="4 4"
                    />
                    {agents.map((_, i) => {
                      const x = 400 + (i - (agents.length - 1) / 2) * 160;
                      return <path key={i} d={`M400 48 H${x} V96`} stroke="#1A1A1A" strokeWidth="2" />;
                    })}
                  </svg>
                </div>
              )}
            </motion.div>
          </div>

          {/* Dynamic Agents Grid */}
          <div className={cn(
            "grid gap-6 pt-6",
            agents.length === 2 ? "grid-cols-2" : 
            agents.length === 3 ? "grid-cols-3" : 
            "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
          )}>
            <AnimatePresence>
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.agentId}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.15, type: 'spring' }}
                  className={cn(
                    "border-2 border-[#1A1A1A] p-5 flex flex-col items-center text-center bg-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all",
                    agent.status === 'processing' && "bg-amber-50 ring-2 ring-amber-500 ring-offset-2",
                    agent.status === 'completed' && "bg-emerald-50 border-emerald-600",
                    agent.status === 'error' && "bg-red-50 border-red-600"
                  )}
                >
                  <div className="mb-4 p-3 bg-[#1A1A1A]/5 rounded-full">
                    {agent.status === 'pending' && <Box size={24} className="opacity-30" />}
                    {agent.status === 'processing' && <Loader2 size={24} className="animate-spin text-amber-600" />}
                    {agent.status === 'completed' && <CheckCircle2 size={24} className="text-emerald-600" />}
                    {agent.status === 'error' && <AlertCircle size={24} className="text-red-600" />}
                  </div>
                  <h3 className="text-[10px] font-mono uppercase font-black mb-1">{agent.role}</h3>
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {agent.tools.map(tool => (
                      <span key={tool} className="text-[8px] bg-[#1A1A1A] text-white px-2 py-0.5 rounded-sm font-mono flex items-center gap-1">
                        <Wrench size={8} /> {tool}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Detailed Agent Specs & Outputs */}
          <div className="space-y-6">
            <h2 className="text-xs font-mono uppercase opacity-50 flex items-center gap-2 font-bold">
              <Layers size={14} /> Agent Intelligence Feed
            </h2>
            <div className="grid grid-cols-1 gap-8">
              <AnimatePresence mode="popLayout">
                {agents.map((agent) => (
                  <motion.div
                    key={agent.agentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-[#1A1A1A] bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]"
                  >
                    {/* Agent Header */}
                    <div className="bg-[#1A1A1A] text-[#F0F0F0] p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-white/30 flex items-center justify-center font-mono text-xs">
                          {agent.agentId.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-tight">{agent.role}</h4>
                          <p className="text-[9px] opacity-60 font-mono">ID: {agent.agentId}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {agent.tools.map(t => (
                          <div key={t} className="bg-white/10 px-2 py-1 rounded text-[8px] font-mono flex items-center gap-1">
                            <Wrench size={10} /> {t}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Skills/Instructions */}
                      <div className="md:col-span-1 space-y-4 border-r border-[#1A1A1A]/10 pr-6">
                        <div>
                          <h5 className="text-[10px] font-mono uppercase opacity-40 mb-2 font-bold flex items-center gap-1">
                            <Zap size={10} /> Injected Skills
                          </h5>
                          <p className="text-[11px] leading-relaxed font-medium italic">
                            "{agent.skills}"
                          </p>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-mono uppercase opacity-40 mb-2 font-bold">Assigned Task</h5>
                          <p className="text-[11px] leading-relaxed">
                            {agent.task}
                          </p>
                        </div>
                      </div>

                      {/* Response Output */}
                      <div className="md:col-span-2">
                        <h5 className="text-[10px] font-mono uppercase opacity-40 mb-3 font-bold">Agent Output</h5>
                        <div className="prose prose-sm max-w-none text-sm leading-relaxed bg-[#F9F9F9] p-4 border border-[#1A1A1A]/5 min-h-[100px]">
                          {agent.response ? (
                            <ReactMarkdown>{agent.response}</ReactMarkdown>
                          ) : (
                            <div className="flex items-center gap-2 opacity-30 italic">
                              <Loader2 size={14} className="animate-spin" />
                              Processing intelligence...
                            </div>
                          )}
                        </div>
                        {agent.toolCalls && (
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-[10px] font-mono text-amber-800 flex items-center gap-2">
                            <Wrench size={14} /> 
                            <span>Function Call Triggered: <strong>{agent.toolCalls[0].name}</strong> with args: {JSON.stringify(agent.toolCalls[0].args)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {!isProcessing && agents.length === 0 && (
                <div className="border-4 border-dashed border-[#1A1A1A]/10 p-20 text-center bg-white/30">
                  <Cpu size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-sm opacity-40 italic font-medium">Factory offline. Awaiting mission parameters to spawn dynamic agents.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t-2 border-[#1A1A1A] p-8 text-center bg-white">
        <p className="text-[10px] font-mono uppercase font-black tracking-[0.4em] opacity-40">
          Advanced Agentic Factory • Dynamic Tool Injection • Gemini 3 Flash
        </p>
      </footer>
    </div>
  );
}
