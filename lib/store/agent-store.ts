/**
 * Agent Store
 * Manages agent selection state and persistence
 */

import { create } from 'zustand';
import { AgentConfig } from '@/types';
import { AgentRegistry } from '@/lib/agents/agent-registry';
import { StorageService } from '@/lib/utils/storage';

/**
 * Agent store state interface
 */
interface AgentStore {
  agents: AgentConfig[];
  selectedAgentId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  selectAgent: (agentId: string) => void;
  loadAgents: () => void;
  clearError: () => void;
}

/**
 * Agent store using Zustand
 */
export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  selectedAgentId: null,
  isLoading: false,
  error: null,

  /**
   * Select an agent and persist to localStorage
   */
  selectAgent: (agentId: string) => {
    const { agents } = get();
    
    // Validate agent exists
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) {
      set({ error: `Agent not found: ${agentId}` });
      return;
    }

    // Update state and persist using StorageService
    set({ selectedAgentId: agentId, error: null });
    StorageService.updatePreference('selectedAgentId', agentId);
  },

  /**
   * Load agents from registry and restore selected agent from localStorage
   */
  loadAgents: () => {
    set({ isLoading: true, error: null });

    try {
      // Load agents from registry
      const agents = AgentRegistry.getAllAgents();
      
      if (agents.length === 0) {
        set({
          agents: [],
          selectedAgentId: null,
          isLoading: false,
          error: 'No agents available',
        });
        return;
      }

      // Try to restore selected agent from localStorage using StorageService
      const savedAgentId = StorageService.getPreference('selectedAgentId');
      let selectedAgentId: string | null = null;

      if (savedAgentId && agents.some((a) => a.id === savedAgentId)) {
        // Saved agent exists, use it
        selectedAgentId = savedAgentId;
      } else {
        // No saved agent or saved agent doesn't exist, select first active agent
        const firstActiveAgent = agents.find((a) => a.status === 'active');
        selectedAgentId = firstActiveAgent?.id || agents[0].id;
        
        // Persist the selection using StorageService
        if (selectedAgentId) {
          StorageService.updatePreference('selectedAgentId', selectedAgentId);
        }
      }

      set({
        agents,
        selectedAgentId,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load agents';
      set({
        agents: [],
        selectedAgentId: null,
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));
