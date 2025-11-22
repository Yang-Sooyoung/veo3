'use client';

import { useEffect, useCallback } from 'react';
import { useAgentStore } from '@/lib/store/agent-store';
import { useUIStore } from '@/lib/store/ui-store';
import { AgentCard } from '@/components/agents/AgentCard';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { agents, selectedAgentId, isLoading, error, loadAgents, selectAgent } = useAgentStore();
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore();

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Handle agent selection on mobile - close sidebar after selection
  const handleAgentSelect = useCallback((agentId: string) => {
    selectAgent(agentId);
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, [selectAgent, setSidebarCollapsed]);

  return (
    <nav className="flex flex-col h-full" aria-label="Agent navigation">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between border-b border-border",
        "p-3 sm:p-4",
        "min-h-[56px] sm:min-h-[64px]"
      )}>
        {!sidebarCollapsed && (
          <h2 className="text-base sm:text-lg font-semibold truncate" id="agents-heading">
            Agents
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10",
            sidebarCollapsed && "mx-auto"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
          aria-controls="agent-list"
        >
          {sidebarCollapsed ? (
            <Menu className="h-5 w-5" aria-hidden="true" />
          ) : (
            <X className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Agent List */}
      <div 
        id="agent-list"
        className={cn(
          "flex-1 overflow-y-auto overscroll-contain",
          "p-2 sm:p-3"
        )}
        role="list"
        aria-labelledby="agents-heading"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {isLoading && (
          <div className="flex items-center justify-center p-4 sm:p-6" role="status">
            <div className="text-sm text-muted-foreground">Loading agents...</div>
          </div>
        )}

        {error && (
          <div className="p-3 sm:p-4" role="alert" aria-live="assertive">
            <div className="text-sm text-destructive break-words">{error}</div>
          </div>
        )}

        {!isLoading && !error && agents.length === 0 && (
          <div className="flex items-center justify-center p-4 sm:p-6" role="status">
            <div className="text-sm text-muted-foreground text-center">
              No agents available
            </div>
          </div>
        )}

        {!isLoading && !error && agents.length > 0 && (
          <div className="space-y-1.5 sm:space-y-2">
            {agents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={agent.id === selectedAgentId}
                isCollapsed={sidebarCollapsed}
                onClick={() => handleAgentSelect(agent.id)}
                tabIndex={0}
                role="listitem"
                aria-posinset={index + 1}
                aria-setsize={agents.length}
              />
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
