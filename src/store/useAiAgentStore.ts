import { AiAgents } from "../../prisma/generated/client";
import { create } from "zustand";

type AiAgentStore = {
  assistant: AiAgents | null; 
  setAssistant: (assistant: AiAgents) => void;  
  clearAiAssistant: () => void;  
};

// Create the Zustand store
export const useAiAgentStore = create<AiAgentStore>((set) => ({
  assistant: null,  
  setAssistant: (assistant) => set({assistant  }),  
  clearAiAssistant: () => set({ assistant: null }), 
}));