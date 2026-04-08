"use client";

import { useState } from "react";
import { IntentRow } from "@/lib/console-data";
import { useAgentEngine, DESKS, DOOR, MANAGER_DESK } from "@/hooks/useAgentEngine";
import { AnimatedAgent } from "./animated-agent";
import { Panel, StatusBadge, KeyValueGrid } from "@/components/console-ui";
import { labelize, relativeTime } from "@/lib/formatters";
import { currency } from "@/lib/utils";
import { toneForDealStatus } from "@/lib/presentation";
import { X, Activity } from "lucide-react";

export function AgentFloorEngine({ intentRows }: { intentRows: IntentRow[] }) {
    const agents = useAgentEngine(intentRows);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

    const selectedRow = selectedAgentId ? intentRows.find(r => r.intent.id === selectedAgentId) : null;
    const selectedAgent = selectedAgentId ? agents.find(a => a.id === selectedAgentId) : null;

    return (
       <Panel title="MATRIX_VIEW: WORK_FLOOR" description="Live spatial visualization of working agents across pipelines." className="bg-[var(--background)] border border-[var(--border-strong)] p-0 overflow-hidden">
         <div className="relative w-full h-[600px] bg-[#050505] overflow-hidden">
            {/* Floor tile grid pattern */}
            <div 
               className="absolute inset-0 opacity-[0.1]" 
               style={{ 
                  backgroundImage: 'linear-gradient(var(--border-soft) 1px, transparent 1px), linear-gradient(90deg, var(--border-soft) 1px, transparent 1px)', 
                  backgroundSize: '40px 40px' 
               }} 
            />
            
            {/* The Entry Door */}
            <div 
               className="absolute left-0 w-8 bg-[#111] border-r-2 border-[var(--border-strong)] flex flex-col items-center justify-center"
               style={{ top: DOOR.y - 60, height: 120 }}
            >
               <div className="text-[9px] text-[var(--accent)] font-mono -rotate-90 uppercase tracking-widest whitespace-nowrap">MARKET_INFLUX</div>
               <div className="w-2 h-16 bg-[var(--accent-strong)] mt-4 opacity-50" />
            </div>

            {/* Render Agent Workspace Desks */}
            {DESKS.map((desk, idx) => (
               <div 
                  key={idx} 
                  className="absolute border border-[var(--border-soft)] bg-[var(--background)] flex items-center justify-center pointer-events-none"
                  style={{
                     left: desk.x,
                     // We subtract half height so 'y' corresponds visually to character standing in front of desk
                     top: desk.y - 20,
                     width: 60,
                     height: 40
                  }}
               >
                  {/* Computer Monitor Graphic */}
                  <div className="w-8 h-4 bg-[#111] absolute right-2 bottom-4 flex items-center justify-center border border-[var(--border-soft)]">
                     <div className="w-6 h-2 bg-[var(--accent)] opacity-30 animate-pulse" />
                  </div>
                  {/* Keyboard Graphic */}
                  <div className="w-6 h-2 bg-[#222] absolute right-3 bottom-1 border border-[#333]" />
                  <div className="absolute -left-8 text-[9px] font-mono font-bold text-[var(--text-muted)] opacity-50 uppercase tracking-wider -rotate-90">DSK_{idx + 1}</div>
               </div>
            ))}

            {/* Manager Desk (Approval Zone) */}
            <div 
               className="absolute right-0 w-[160px] h-[300px] border-l border-t border-b border-dashed border-[var(--border-strong)] bg-[#0A0A0A] flex items-center justify-center pointer-events-none"
               style={{ top: MANAGER_DESK.y - 150 }}
            >
               <div className="absolute top-4 w-full text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--positive)] opacity-80">&gt; APPROVAL_ZONE</div>
               <div className="w-[80px] h-[120px] bg-[#111] border border-[var(--border-strong)] flex items-center justify-center">
                  <div className="w-[60px] h-[90px] bg-[var(--background)] border border-[var(--border-soft)] flex flex-col items-center justify-center gap-2">
                     <div className="w-8 h-8 rounded-none border border-[var(--positive)] bg-[#10b981] opacity-20" />
                     <div className="w-10 h-1 bg-[var(--border-muted)]" />
                     <div className="w-6 h-1 bg-[var(--border-muted)]" />
                  </div>
               </div>
            </div>

            {/* Live Agents Layer */}
            {agents.map(agent => (
               <AnimatedAgent 
                  key={agent.id} 
                  agent={agent} 
                  onClick={() => setSelectedAgentId(agent.id)} 
               />
            ))}

            {/* Agent Inspector Side Panel */}
            {selectedRow && selectedAgent && (
               <div className="absolute right-0 top-0 bottom-0 w-[400px] max-w-full bg-[var(--background)] border-l border-[var(--border-strong)] shadow-2xl flex flex-col z-50 animate-in slide-in-from-right font-mono">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)] bg-[#111]">
                     <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] font-bold">
                           &gt; AGENT_INSPECTOR
                        </span>
                        <h3 className="text-sm font-bold tracking-widest text-[var(--text-primary)] mt-1">
                           NODE_{selectedRow.intent.id.slice(-4).toUpperCase()}
                        </h3>
                     </div>
                     <button 
                        onClick={() => setSelectedAgentId(null)} 
                        className="p-2 border border-[var(--border-soft)] hover:bg-[#222] text-[var(--text-secondary)] transition cursor-pointer"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <div className="p-5 flex flex-col gap-6 overflow-y-auto">
                     <div>
                        <div className="border border-[var(--border-soft)] px-2 py-1 inline-flex items-center gap-2 text-xs uppercase font-bold bg-[#111]">
                           <span className="w-2 h-2 rounded-none animate-pulse" style={{backgroundColor: toneForDealStatus(selectedAgent.status as any)}} />
                           {labelize(selectedAgent.status)}
                        </div>
                     </div>

                     <div className="border border-[var(--border-soft)] p-0 divide-y divide-[var(--border-soft)] text-xs">
                        <div className="flex px-3 py-2 divide-x divide-[var(--border-soft)]">
                           <div className="w-1/3 text-[var(--text-muted)]">TARGET</div>
                           <div className="w-2/3 pl-3 text-[var(--text-primary)]">{selectedRow.intent.item}</div>
                        </div>
                        <div className="flex px-3 py-2 divide-x divide-[var(--border-soft)]">
                           <div className="w-1/3 text-[var(--text-muted)]">STRATEGY</div>
                           <div className="w-2/3 pl-3 text-[var(--accent)] uppercase font-bold">{selectedRow.agent.negotiation_strategy}</div>
                        </div>
                        <div className="flex px-3 py-2 divide-x divide-[var(--border-soft)]">
                           <div className="w-1/3 text-[var(--text-muted)]">BUDGET</div>
                           <div className="w-2/3 pl-3 text-[var(--positive)]">{currency(selectedRow.intent.max_price)}</div>
                        </div>
                        <div className="flex px-3 py-2 divide-x divide-[var(--border-soft)]">
                           <div className="w-1/3 text-[var(--text-muted)]">LOCATION</div>
                           <div className="w-2/3 pl-3 text-[var(--text-primary)] uppercase">{selectedRow.intent.location}</div>
                        </div>
                     </div>

                     <div className="border border-[var(--border-soft)] bg-[#111] p-0">
                        <div className="flex justify-between items-center px-3 py-2 border-b border-[var(--border-soft)] bg-[#1a1a1a]">
                           <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--accent)] flex items-center gap-2 font-bold">
                              <Activity className="w-3 h-3" /> ACTIVE_PROCESS
                           </div>
                        </div>
                        <p className="text-xs leading-6 text-[var(--text-primary)] p-3">
                           &gt; {selectedAgent.thought}
                        </p>
                     </div>
                     
                     {selectedRow.bestDeal && (
                        <div className="border border-dashed border-[var(--positive)] p-4 bg-[#0a1a0a]">
                           <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--positive)] mb-2 font-bold flex items-center justify-between">
                              <span>CURRENT_BEST_OFFER</span>
                              <span className="animate-pulse">_</span>
                           </div>
                           <div className="text-2xl font-bold text-[var(--text-primary)]">
                              {currency(selectedRow.bestDeal.current_offer)}
                           </div>
                           <div className="text-[10px] uppercase text-[#66ff66] mt-2 border-t border-[#113311] pt-2">
                              System actively negotiating
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
       </Panel>
    );
}
