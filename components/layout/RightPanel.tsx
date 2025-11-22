'use client';

import { useAgentStore } from '@/lib/store/agent-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function RightPanel() {
  const { agents, selectedAgentId } = useAgentStore();
  const { toggleRightPanel } = useUIStore();
  
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);

  return (
    <div className="flex flex-col h-full">
      {/* Header - Responsive */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border min-h-[56px] sm:min-h-[64px]">
        <h2 className="text-base sm:text-lg font-semibold truncate">Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRightPanel}
          aria-label="Close panel"
          className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 touch-manipulation"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Content - Responsive padding and spacing */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {selectedAgent ? (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Agent Name</h3>
              <p className="text-xs sm:text-sm break-words">{selectedAgent.name}</p>
            </div>
            
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-xs sm:text-sm break-words">{selectedAgent.description}</p>
            </div>
            
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Status</h3>
              <p className="text-xs sm:text-sm capitalize">{selectedAgent.status}</p>
            </div>
            
            {selectedAgent.category && (
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Category</h3>
                <p className="text-xs sm:text-sm capitalize">{selectedAgent.category}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Input Type</h3>
              <p className="text-xs sm:text-sm capitalize">{selectedAgent.inputSchema.type}</p>
            </div>
            
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Output Type</h3>
              <p className="text-xs sm:text-sm capitalize">{selectedAgent.outputSchema.type}</p>
            </div>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-muted-foreground text-center p-4">
            No agent selected
          </div>
        )}
      </div>
    </div>
  );
}
