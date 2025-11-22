/**
 * Execution Store
 * Manages execution state, history, and persistence
 */

import { create } from 'zustand';
import { Execution } from '@/types';
import { StorageService } from '@/lib/utils/storage';

/**
 * Execution store state interface
 */
interface ExecutionStore {
  executions: Record<string, Execution[]>; // agentId -> executions
  currentExecution: Execution | null;
  isExecuting: boolean;
  
  // Actions
  addExecution: (execution: Execution) => void;
  updateExecution: (executionId: string, updates: Partial<Execution>) => void;
  setCurrentExecution: (execution: Execution | null) => void;
  loadHistory: (agentId: string) => void;
  clearHistory: (agentId: string) => void;
  getExecutionsByAgent: (agentId: string) => Execution[];
  getExecution: (executionId: string) => Execution | undefined;
}

/**
 * Maximum number of executions to store per agent
 */
const MAX_EXECUTIONS_PER_AGENT = 50;

/**
 * Execution store using Zustand
 */
export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  executions: {},
  currentExecution: null,
  isExecuting: false,

  /**
   * Add a new execution and persist to localStorage
   */
  addExecution: (execution: Execution) => {
    const { executions } = get();
    const agentExecutions = executions[execution.agentId] || [];
    
    // Add new execution at the beginning (most recent first)
    const updatedExecutions = [execution, ...agentExecutions].slice(0, MAX_EXECUTIONS_PER_AGENT);
    
    // Update state
    set({
      executions: {
        ...executions,
        [execution.agentId]: updatedExecutions,
      },
      currentExecution: execution,
      isExecuting: execution.status === 'pending' || execution.status === 'processing',
    });
    
    // Persist to localStorage using StorageService
    StorageService.saveExecutions(execution.agentId, updatedExecutions);
  },

  /**
   * Update an existing execution and persist to localStorage
   */
  updateExecution: (executionId: string, updates: Partial<Execution>) => {
    const { executions, currentExecution } = get();
    
    // Find the execution across all agents
    let agentId: string | null = null;
    let updatedExecution: Execution | null = null;
    
    for (const [id, agentExecutions] of Object.entries(executions)) {
      const index = agentExecutions.findIndex((e) => e.id === executionId);
      if (index !== -1) {
        agentId = id;
        updatedExecution = { ...agentExecutions[index], ...updates };
        break;
      }
    }
    
    if (!agentId || !updatedExecution) {
      console.warn(`Execution not found: ${executionId}`);
      return;
    }
    
    // Update the execution in the array
    const agentExecutions = executions[agentId];
    const updatedAgentExecutions = agentExecutions.map((e) =>
      e.id === executionId ? updatedExecution! : e
    );
    
    // Update state
    set({
      executions: {
        ...executions,
        [agentId]: updatedAgentExecutions,
      },
      currentExecution:
        currentExecution?.id === executionId ? updatedExecution : currentExecution,
      isExecuting:
        currentExecution?.id === executionId
          ? updatedExecution.status === 'pending' || updatedExecution.status === 'processing'
          : get().isExecuting,
    });
    
    // Persist to localStorage using StorageService
    StorageService.saveExecutions(agentId, updatedAgentExecutions);
  },

  /**
   * Set the current execution being displayed
   */
  setCurrentExecution: (execution: Execution | null) => {
    set({
      currentExecution: execution,
      isExecuting: execution
        ? execution.status === 'pending' || execution.status === 'processing'
        : false,
    });
  },

  /**
   * Load execution history from localStorage for a specific agent
   */
  loadHistory: (agentId: string) => {
    const { executions } = get();
    
    // Skip if already loaded
    if (executions[agentId]) {
      return;
    }
    
    const history = StorageService.loadExecutions(agentId);
    
    set({
      executions: {
        ...executions,
        [agentId]: history,
      },
    });
  },

  /**
   * Clear execution history for a specific agent
   */
  clearHistory: (agentId: string) => {
    const { executions, currentExecution } = get();
    
    // Clear from state
    const updatedExecutions = { ...executions };
    delete updatedExecutions[agentId];
    
    set({
      executions: updatedExecutions,
      currentExecution:
        currentExecution?.agentId === agentId ? null : currentExecution,
    });
    
    // Clear from localStorage using StorageService
    StorageService.clearExecutions(agentId);
  },

  /**
   * Get executions for a specific agent
   */
  getExecutionsByAgent: (agentId: string) => {
    const { executions } = get();
    return executions[agentId] || [];
  },

  /**
   * Get a specific execution by ID
   */
  getExecution: (executionId: string) => {
    const { executions } = get();
    
    for (const agentExecutions of Object.values(executions)) {
      const execution = agentExecutions.find((e) => e.id === executionId);
      if (execution) return execution;
    }
    
    return undefined;
  },
}));
