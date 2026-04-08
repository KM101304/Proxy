"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { AgentCharacter } from "@/hooks/useAgentEngine";

export function AnimatedAgent({ agent, onClick }: { agent: AgentCharacter; onClick?: () => void }) {
  const { action, direction, strategy, thought } = agent;

  // Colors based on strategy
  const clothingColor = strategy === "aggressive" ? "#ef4444" : strategy === "conservative" ? "#10b981" : "#3b82f6";
  const skinColor = "#fcd4b8";
  
  const isWalking = action === "walking";
  const isSitting = action === "sitting" || action === "typing";
  const isTyping = action === "typing";
  
  return (
    <div 
      className={cn(
        "absolute group cursor-pointer transition-transform", 
        direction === "left" && "-scale-x-100" // Flip whole container if walking left
      )}
      style={{
         // Centering adjustment so x,y is roughly the agent's feet/center
         left: agent.x - 24,
         top: agent.y - 48,
         width: 48,
         height: 48,
         zIndex: Math.floor(agent.y) // Y-sorting so agents in front overlap agents behind
      }}
      onClick={onClick}
    >
      <style>{`
        @keyframes walkCycle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(5deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-2px) rotate(-5deg); }
        }
        @keyframes typeCycle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(2px); }
        }
        .anim-walk { animation: walkCycle 0.4s infinite linear; }
        .anim-type { animation: typeCycle 0.15s infinite; }
        
        /* Cancel flip for tooltip text so it isn't backward when agent walks left */
        .unflip-content {
           transform: ${direction === "left" ? "scaleX(-1)" : "none"};
        }
      `}</style>
      
      {/* Interaction Tooltip (Speech Bubble) */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity unflip-content font-mono">
          <div className="border border-[var(--border-strong)] bg-[#000000] p-0 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-[var(--border-strong)] bg-[#111] px-2 py-1">
               <span className="h-2 w-2 rounded-none animate-pulse" style={{ backgroundColor: clothingColor }} />
               <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">
                 NODE_{agent.id.slice(-4).toUpperCase()}
               </span>
            </div>
            <p className="text-[10px] leading-snug text-[var(--accent)] line-clamp-3 p-2">
              &gt; {thought}
            </p>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-[var(--border-strong)] bg-[#000]" />
      </div>

      {/* Persistent Status Bubble if important */}
      {(agent.action === "glitching" || agent.action === "cheering" || agent.status === "close_to_accept") && (
         <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 unflip-content animate-bounce">
            <span className="text-xl drop-shadow-md">
               {agent.action === "glitching" ? "⚠️" : agent.action === "cheering" ? "🎉" : "❓"}
            </span>
         </div>
      )}

      {/* Minimal 2D Character Body */}
      <div className={cn("w-full h-full relative", isWalking && "anim-walk")}>
          <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md" shapeRendering="crispEdges">
             {/* Character Body based on state */}
             {isSitting ? (
                <g>
                   {/* Sitting pose */}
                   <rect x="12" y="16" width="10" height="8" fill={clothingColor} />
                   <rect x="12" y="24" width="4" height="6" fill={clothingColor} /> {/* leg down */}
                   <rect x="16" y="22" width="6" height="4" fill={clothingColor} /> {/* leg resting */}
                   
                   {/* Head */}
                   <rect x="13" y="6" width="8" height="9" fill={skinColor} />
                   <rect x="13" y="5" width="8" height="3" fill="#1e140d" /> {/* hair */}
                   
                   {/* Arm */}
                   <g className={isTyping ? "anim-type" : ""}>
                     <rect x="15" y="18" width="8" height="3" fill={clothingColor} />
                     <rect x="23" y="18" width="3" height="3" fill={skinColor} />
                   </g>

                   {/* Eyes */}
                   <rect x="17" y="10" width="1" height="1" fill="#1e140d" />
                   <rect x="20" y="10" width="1" height="1" fill="#1e140d" />
                </g>
             ) : (
                <g>
                   {/* Standing/Walking pose */}
                   <rect x="12" y="15" width="8" height="10" fill={clothingColor} />
                   {/* Legs */}
                   <rect x="12" y="25" width="3" height="6" fill={clothingColor} />
                   <rect x="17" y="25" width="3" height="6" fill={clothingColor} />

                   {/* Head */}
                   <rect x="12" y="5" width="8" height="9" fill={skinColor} />
                   <rect x="12" y="4" width="8" height="3" fill="#1e140d" />

                   {/* Arm resting */}
                   <rect x="16" y="16" width="3" height="7" fill={clothingColor} />
                   <rect x="16" y="23" width="3" height="3" fill={skinColor} />

                   {/* Eyes looking forward */}
                   <rect x="17" y="9" width="1" height="1" fill="#1e140d" />
                   <rect x="20" y="9" width="1" height="1" fill="#1e140d" />
                </g>
             )}
          </svg>
      </div>
    </div>
  );
}
