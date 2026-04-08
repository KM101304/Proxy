"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface PixelAgentWorkspaceProps {
  status: string; // "searching" | "negotiating" | "close_to_accept" | "accepted" | "expired"
  strategy: string; // "aggressive" | "balanced" | "conservative"
  className?: string;
  agentId?: string;
  thought?: string;
}

export function PixelAgentWorkspace({ status, strategy, className, agentId, thought }: PixelAgentWorkspaceProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Lifelike loop: blinking, looking away, bursts of typing
  useEffect(() => {
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      const rand = Math.random();

      // Blinking: 200ms
      if (rand > 0.6) {
        setIsBlinking(true);
        setTimeout(() => mounted && setIsBlinking(false), 150);
      }

      // Looking away: 800ms
      if (rand > 0.85) {
        setIsLookingAway(true);
        setTimeout(() => mounted && setIsLookingAway(false), 900);
      }

      // Random typing bursts if searching or negotiating
      if (status === "searching" || status === "negotiating") {
        if (rand > 0.5 && !isTyping) {
          setIsTyping(true);
          setTimeout(() => mounted && setIsTyping(false), 1000 + Math.random() * 2000);
        }
      }

      setTimeout(tick, 1500 + Math.random() * 2500);
    };

    tick();
    return () => {
      mounted = false;
    };
  }, [status, isTyping]);

  const skinColor = "#fcd4b8";
  const clothingColor = strategy === "aggressive" ? "#ef4444" : strategy === "conservative" ? "#10b981" : "#3b82f6";
  const deskColor = "#334155";
  const monitorColor = "#1e293b";
  const screenColor = status === "expired" ? "#ef4444" : status === "accepted" ? "#10b981" : "#0284c7";
  const eyeColor = "#1e140d";

  const isWorking = status === "negotiating" || status === "close_to_accept" || status === "searching";
  const showTypingArm = isWorking && (status === "close_to_accept" || isTyping || status === "negotiating");

  return (
    <div className={cn("group relative flex flex-col items-center", className)}>
      <style>{`
        @keyframes typeFast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(1.5px); }
        }
        @keyframes blinkScreen {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes cheer {
          0% { transform: translateY(0); }
          100% { transform: translateY(-2px); }
        }
        .anim-type-fast { animation: typeFast 0.12s infinite; }
        .anim-blink { animation: blinkScreen 1.5s infinite; }
        .anim-cheer { animation: cheer 0.4s infinite alternate; }
      `}</style>
      
      {/* Thought Bubble Tooltip */}
      {thought && (
        <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 z-20 w-48 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--background-panel-strong)] shadow-xl p-2.5">
            <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              {agentId || "Agent Thought"}
            </div>
            <p className="text-[11px] leading-snug text-[var(--text-primary)] line-clamp-3">
              "{thought}"
            </p>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-[var(--border-strong)] bg-[var(--background-panel-strong)]" />
        </div>
      )}

      <div className="relative h-full w-full overflow-hidden rounded-[inherit] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <svg viewBox="0 0 32 32" className="h-full w-full" shapeRendering="crispEdges">
          {/* Background / Room */}
          {/* Transparent to blend into shared room */}
          <rect x="0" y="16" width="32" height="1" fill="#1e293b" opacity="0.3" />

          {/* Desk */}
          <rect x="2" y="22" width="28" height="10" fill={deskColor} />
          <rect x="2" y="22" width="28" height="1" fill="#475569" />

          {/* Monitor */}
          <rect x="4" y="19" width="4" height="3" fill="#0f172a" />
          <rect x="2" y="7" width="12" height="12" fill={monitorColor} />
          <rect x="3" y="8" width="10" height="9" fill={screenColor} className={isWorking ? "anim-blink" : ""} />

          {/* Screen Data/Text Lines */}
          {(status === "negotiating" || status === "close_to_accept") && (
            <g fill="#bae6fd" opacity="0.8">
              <rect x="4" y="9" width="6" height="1" />
              <rect x="4" y="11" width="8" height="1" />
              <rect x="4" y="13" width="5" height="1" />
            </g>
          )}
          {status === "searching" && (
            <rect x="6" y="11" width="4" height="3" fill="#bae6fd" className="anim-blink" />
          )}

          {/* Agent Character Body */}
          <g className={status === "accepted" ? "anim-cheer" : ""}>
            <rect x="18" y="15" width="10" height="9" fill={clothingColor} />
            <rect x="19" y="14" width="8" height="1" fill={clothingColor} />
            
            {/* Head */}
            <rect x="20" y="6" width="7" height="8" fill={skinColor} />
            {/* Hair */}
            <rect x="20" y="5" width="7" height="2" fill="#1e140d" />
            <rect x="19" y="6" width="2" height="3" fill="#1e140d" />
            <rect x="26" y="6" width="2" height="4" fill="#1e140d" />
            
            {/* Eyes */}
            {!isBlinking && (
              <g>
                {isLookingAway ? (
                  // Looking right/forward
                  <>
                    <rect x="23" y="8" width="1" height="1" fill={eyeColor} />
                    <rect x="26" y="8" width="1" height="1" fill={eyeColor} />
                  </>
                ) : (
                  // Looking left at screen
                  <>
                    <rect x="21" y="8" width="1" height="1" fill={eyeColor} />
                    <rect x="24" y="8" width="1" height="1" fill={eyeColor} />
                  </>
                )}
              </g>
            )}

            {/* Expressions */}
            {status === "expired" && (
              <rect x="23" y="10" width="2" height="1" fill="#ef4444" opacity="0.8" />
            )}
            {status === "accepted" && (
              <rect x="21" y="10" width="3" height="1" fill="#fff" />
            )}
          </g>

          {/* Dynamic Arms */}
          {showTypingArm ? (
            <g className="anim-type-fast">
              {/* Left arm typing */}
              <rect x="15" y="17" width="5" height="2" fill={clothingColor} />
              <rect x="13" y="17" width="2" height="2" fill={skinColor} />
            </g>
          ) : status === "accepted" ? (
            <g className="anim-cheer">
              {/* Arms up celebrating */}
              <rect x="17" y="9" width="2" height="6" fill={clothingColor} />
              <rect x="17" y="7" width="2" height="2" fill={skinColor} />
              <rect x="27" y="9" width="2" height="6" fill={clothingColor} />
              <rect x="27" y="7" width="2" height="2" fill={skinColor} />
            </g>
          ) : (
            /* Idle / Expired (arms resting) */
            <g>
              <rect x="18" y="17" width="2" height="5" fill={clothingColor} />
              <rect x="18" y="22" width="2" height="2" fill={skinColor} />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
