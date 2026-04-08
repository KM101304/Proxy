import { useEffect, useState, useRef } from "react";
import { IntentRow } from "@/lib/console-data";

export type AgentAction = "walking" | "sitting" | "typing" | "standing" | "cheering" | "glitching";
export type AgentDirection = "left" | "right";

export interface AgentCharacter {
  id: string; // Intent ID
  x: number;
  y: number;
  tx: number; // Target X
  ty: number; // Target Y
  action: AgentAction;
  direction: AgentDirection;
  status: string;
  thought: string;
  strategy: string; // determines visual
  deskIndex: number;
}

export const DESKS = [
  { x: 200, y: 150 }, { x: 350, y: 150 }, { x: 500, y: 150 }, { x: 650, y: 150 },
  { x: 200, y: 300 }, { x: 350, y: 300 }, { x: 500, y: 300 }, { x: 650, y: 300 },
  { x: 200, y: 450 }, { x: 350, y: 450 }, { x: 500, y: 450 }, { x: 650, y: 450 },
];
export const DOOR = { x: 20, y: 250 };
export const MANAGER_DESK = { x: 800, y: 280 };
export const WATER_COOLER = { x: 450, y: 50 };

const SPEED = 3.5;

function getDesk(index: number) {
  return DESKS[index % DESKS.length];
}

export function useAgentEngine(intentRows: IntentRow[]) {
  const [agents, setAgents] = useState<AgentCharacter[]>([]);
  const stateRef = useRef<AgentCharacter[]>([]);

  // 1. Sync backend intents into our physical state
  useEffect(() => {
    let current = [...stateRef.current];

    // Find new intents
    for (let i = 0; i < intentRows.length; i++) {
        const row = intentRows[i];
        const status = row.bestDeal?.status ?? "searching";
        const exists = current.find(a => a.id === row.intent.id);
        
        if (!exists) {
            // Spawn at door
            current.push({
                id: row.intent.id,
                x: DOOR.x,
                y: DOOR.y,
                tx: DOOR.x,
                ty: DOOR.y,
                action: "walking",
                direction: "right",
                status,
                thought: row.bestDeal?.last_message ?? `Searching for ${row.intent.item}...`,
                strategy: row.agent.negotiation_strategy,
                deskIndex: i // assign a desk slot
            });
        } else {
            // Update existing status and thought
            exists.status = status;
            exists.thought = row.bestDeal?.last_message ?? exists.thought;
            exists.deskIndex = i; // keep desk assignment bounded
        }
    }

    // Identify removed intents (purge list to keep it clean)
    const activeIds = new Set(intentRows.map(r => r.intent.id));
    current = current.filter(a => {
       // if not in backend, force status to expired so they walk out
       if (!activeIds.has(a.id) && a.status !== "expired" && a.status !== "accepted") {
           a.status = "expired";
           a.thought = "Lost connection.";
       }
       // Only actually remove if they reached the door
       const atDoor = Math.abs(a.x - DOOR.x) < 10 && Math.abs(a.y - DOOR.y) < 10;
       if ((a.status === "expired" || a.status === "accepted") && atDoor) {
           return false; // despawn
       }
       return true;
    });

    stateRef.current = current;
  }, [intentRows]);

  // 2. Physics / AI Engine Loop
  useEffect(() => {
    let animationFrame: number;

    const loop = () => {
      let current = [...stateRef.current];
      let needsStateUpdate = false;

      current.forEach(agent => {
          // 1. Set Target Based on Status
          if (agent.status === "searching" || agent.status === "negotiating") {
              const desk = getDesk(agent.deskIndex);
              agent.tx = desk.x;
              agent.ty = desk.y;
          } else if (agent.status === "close_to_accept") {
              // Walk to manager desk!
              agent.tx = MANAGER_DESK.x;
              agent.ty = MANAGER_DESK.y;
          } else if (agent.status === "accepted" || agent.status === "expired") {
              // Leave the room
              agent.tx = DOOR.x;
              agent.ty = DOOR.y;
          }

          // 2. Move towards target
          const dx = agent.tx - agent.x;
          const dy = agent.ty - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > SPEED) {
              // Walk
              agent.x += (dx / dist) * SPEED;
              agent.y += (dy / dist) * SPEED;
              agent.action = "walking";
              agent.direction = dx > 0 ? "right" : "left";
              needsStateUpdate = true;
          } else {
              // Arrived
              if (agent.x !== agent.tx || agent.y !== agent.ty) {
                 agent.x = agent.tx;
                 agent.y = agent.ty;
                 needsStateUpdate = true;
              }

              // Set idle actions
              let newAction = agent.action;
              if (agent.status === "negotiating") {
                  newAction = "typing";
              } else if (agent.status === "searching") {
                  newAction = "sitting";
              } else if (agent.status === "close_to_accept") {
                  newAction = "standing";
              } else if (agent.status === "accepted") {
                  newAction = "cheering";
              } else if (agent.status === "expired") {
                  newAction = "glitching";
              }

              if (agent.action !== newAction) {
                  agent.action = newAction;
                  needsStateUpdate = true;
              }

              // Face the desk if sitting
              if (agent.action === "typing" || agent.action === "sitting") {
                 if (agent.direction !== "right") {
                    agent.direction = "right"; // assuming all desks face right for now
                    needsStateUpdate = true;
                 }
              }
          }
      });

      if (needsStateUpdate) {
          setAgents([...current]);
      }
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return agents;
}
