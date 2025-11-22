/**
 * Agent Registry
 * Manages agent configurations and provides access methods
 */

import { AgentConfig } from '@/types';
import { AGENTS } from './agent-config';

/**
 * Validation error class for agent configuration
 */
export class AgentValidationError extends Error {
  constructor(message: string, public agentId?: string) {
    super(message);
    this.name = 'AgentValidationError';
  }
}

/**
 * Agent Registry Class
 * Provides methods to access and validate agent configurations
 */
export class AgentRegistry {
  private static agents: Map<string, AgentConfig> = new Map();
  private static initialized = false;

  /**
   * Initialize the registry with agent configurations
   */
  private static initialize(): void {
    if (this.initialized) return;

    // Validate and register all agents
    for (const agent of AGENTS) {
      this.validateAgent(agent);
      this.agents.set(agent.id, agent);
    }

    this.initialized = true;
  }

  /**
   * Validate agent configuration
   * @throws AgentValidationError if validation fails
   */
  private static validateAgent(agent: AgentConfig): void {
    // Validate required fields
    if (!agent.id || typeof agent.id !== 'string') {
      throw new AgentValidationError('Agent ID is required and must be a string');
    }

    if (!agent.name || typeof agent.name !== 'string') {
      throw new AgentValidationError(`Agent name is required`, agent.id);
    }

    if (!agent.description || typeof agent.description !== 'string') {
      throw new AgentValidationError(`Agent description is required`, agent.id);
    }

    if (!agent.webhookUrl || typeof agent.webhookUrl !== 'string') {
      throw new AgentValidationError(`Agent webhook URL is required`, agent.id);
    }

    // Validate webhook URL format (allow both absolute URLs and relative paths)
    const isValidUrl = agent.webhookUrl.startsWith('/') || 
                      agent.webhookUrl.startsWith('http://') || 
                      agent.webhookUrl.startsWith('https://');
    
    if (!isValidUrl) {
      // Try to parse as absolute URL for additional validation
      try {
        new URL(agent.webhookUrl);
      } catch {
        throw new AgentValidationError(
          `Invalid webhook URL format: ${agent.webhookUrl}`,
          agent.id
        );
      }
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'maintenance'];
    if (!validStatuses.includes(agent.status)) {
      throw new AgentValidationError(
        `Invalid agent status: ${agent.status}. Must be one of: ${validStatuses.join(', ')}`,
        agent.id
      );
    }

    // Validate input schema
    if (!agent.inputSchema || !agent.inputSchema.type) {
      throw new AgentValidationError(`Agent input schema is required`, agent.id);
    }

    const validInputTypes = ['text', 'form', 'file'];
    if (!validInputTypes.includes(agent.inputSchema.type)) {
      throw new AgentValidationError(
        `Invalid input schema type: ${agent.inputSchema.type}`,
        agent.id
      );
    }

    // Validate output schema
    if (!agent.outputSchema || !agent.outputSchema.type) {
      throw new AgentValidationError(`Agent output schema is required`, agent.id);
    }

    const validOutputTypes = ['video', 'image', 'text', 'json'];
    if (!validOutputTypes.includes(agent.outputSchema.type)) {
      throw new AgentValidationError(
        `Invalid output schema type: ${agent.outputSchema.type}`,
        agent.id
      );
    }

    // Validate settings if provided
    if (agent.settings) {
      if (
        agent.settings.maxExecutionTime !== undefined &&
        (typeof agent.settings.maxExecutionTime !== 'number' ||
          agent.settings.maxExecutionTime <= 0)
      ) {
        throw new AgentValidationError(
          `Invalid maxExecutionTime: must be a positive number`,
          agent.id
        );
      }

      if (
        agent.settings.pollingInterval !== undefined &&
        (typeof agent.settings.pollingInterval !== 'number' ||
          agent.settings.pollingInterval <= 0)
      ) {
        throw new AgentValidationError(
          `Invalid pollingInterval: must be a positive number`,
          agent.id
        );
      }

      if (
        agent.settings.retryAttempts !== undefined &&
        (typeof agent.settings.retryAttempts !== 'number' ||
          agent.settings.retryAttempts < 0)
      ) {
        throw new AgentValidationError(
          `Invalid retryAttempts: must be a non-negative number`,
          agent.id
        );
      }
    }
  }

  /**
   * Get all available agents
   * @returns Array of all agent configurations
   */
  static getAllAgents(): AgentConfig[] {
    this.initialize();
    return Array.from(this.agents.values());
  }

  /**
   * Get a specific agent by ID
   * @param agentId - The unique identifier of the agent
   * @returns Agent configuration or undefined if not found
   */
  static getAgent(agentId: string): AgentConfig | undefined {
    this.initialize();
    return this.agents.get(agentId);
  }

  /**
   * Get a specific agent by ID (throws if not found)
   * @param agentId - The unique identifier of the agent
   * @returns Agent configuration
   * @throws AgentValidationError if agent not found
   */
  static getAgentOrThrow(agentId: string): AgentConfig {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new AgentValidationError(`Agent not found: ${agentId}`);
    }
    return agent;
  }

  /**
   * Check if an agent exists
   * @param agentId - The unique identifier of the agent
   * @returns True if agent exists, false otherwise
   */
  static hasAgent(agentId: string): boolean {
    this.initialize();
    return this.agents.has(agentId);
  }

  /**
   * Get agents by category
   * @param category - The agent category to filter by
   * @returns Array of agents in the specified category
   */
  static getAgentsByCategory(category: string): AgentConfig[] {
    this.initialize();
    return Array.from(this.agents.values()).filter(
      (agent) => agent.category === category
    );
  }

  /**
   * Get agents by status
   * @param status - The agent status to filter by
   * @returns Array of agents with the specified status
   */
  static getAgentsByStatus(status: string): AgentConfig[] {
    this.initialize();
    return Array.from(this.agents.values()).filter(
      (agent) => agent.status === status
    );
  }

  /**
   * Get active agents only
   * @returns Array of active agents
   */
  static getActiveAgents(): AgentConfig[] {
    return this.getAgentsByStatus('active');
  }
}
