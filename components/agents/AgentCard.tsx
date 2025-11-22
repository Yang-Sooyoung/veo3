'use client';

import { AgentConfig } from '@/types';
import { AgentIcon } from './AgentIcon';
import { cn } from '@/lib/utils';
import { memo, useCallback } from 'react';

interface AgentCardProps {
  agent: AgentConfig;
  isSelected: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  tabIndex?: number;
  role?: string;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
}

/**
 * AgentCard Component
 * Displays an agent with icon, name, description, and status indicator
 * Supports hover and selected states with smooth animations
 * Optimized for mobile with touch-friendly sizing
 */
export const AgentCard = memo(function AgentCard({ 
  agent, 
  isSelected, 
  isCollapsed, 
  onClick, 
  tabIndex = 0,
  role = 'button',
  'aria-posinset': ariaPosinset,
  'aria-setsize': ariaSetsize,
}: AgentCardProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Activate on Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role={role}
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
      className={cn(
        // Base styles with touch-friendly sizing
        "w-full flex items-center rounded-lg",
        "transition-all duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        
        // Touch-friendly padding and gap
        "gap-2.5 sm:gap-3",
        "p-2.5 sm:p-3",
        "min-h-[52px] sm:min-h-[56px]",
        
        // Hover state with scale animation (disabled on touch devices)
        "hover:scale-[1.02] active:scale-[0.98]",
        "@media (hover: none) { hover:scale-100 }",
        
        // Selected state
        isSelected && [
          "bg-accent text-accent-foreground shadow-sm",
          "border-l-4 border-primary",
        ],
        
        // Unselected state
        !isSelected && [
          "text-foreground",
          "hover:bg-accent/50 hover:shadow-sm",
          "border-l-4 border-transparent",
        ],
        
        // Collapsed state
        isCollapsed && "justify-center p-2",
        
        // Disabled state for inactive/maintenance agents
        agent.status !== 'active' && "opacity-60"
      )}
      aria-label={`${agent.name} agent${isSelected ? ', currently selected' : ''}${agent.status !== 'active' ? `, ${agent.status}` : ''}`}
      aria-pressed={isSelected}
      aria-disabled={agent.status !== 'active'}
      aria-describedby={!isCollapsed ? `agent-desc-${agent.id}` : undefined}
      disabled={agent.status === 'maintenance'}
    >
      <AgentIcon
        icon={agent.icon}
        status={agent.status}
        size={isCollapsed ? "lg" : "md"}
      />
      
      {!isCollapsed && (
        <div className="flex-1 text-left min-w-0 space-y-0.5">
          <div className="font-medium truncate leading-tight text-sm sm:text-base">
            {agent.name}
          </div>
          <div 
            id={`agent-desc-${agent.id}`}
            className="text-xs sm:text-sm text-muted-foreground truncate leading-tight"
          >
            {agent.description}
          </div>
          
          {/* Status text for non-active agents */}
          {agent.status !== 'active' && (
            <div 
              className={cn(
                "text-[10px] sm:text-xs font-medium uppercase tracking-wide",
                agent.status === 'inactive' && "text-gray-500",
                agent.status === 'maintenance' && "text-yellow-600 dark:text-yellow-500"
              )}
              role="status"
              aria-label={`Agent status: ${agent.status}`}
            >
              {agent.status}
            </div>
          )}
        </div>
      )}
    </button>
  );
});
