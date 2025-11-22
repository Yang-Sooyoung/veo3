'use client';

import { useAgentStore } from '@/lib/store/agent-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { Menu, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useMemo, useCallback } from 'react';

// Dynamic import for ChatContainer with loading state
const ChatContainer = dynamic(
  () => import('@/components/chat/ChatContainer').then(mod => ({ default: mod.ChatContainer })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm sm:text-base text-muted-foreground">
            Loading chat...
          </p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export function MainArea() {
  const { agents, selectedAgentId, isLoading } = useAgentStore();
  const { setSidebarCollapsed } = useUIStore();
  
  // Memoize selected agent lookup
  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId),
    [agents, selectedAgentId]
  );

  // Memoize sidebar toggle handler
  const handleOpenSidebar = useCallback(() => {
    setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);

  return (
    <div className="flex flex-col h-full">
      {/* Header - Touch-friendly sizing */}
      <header className={cn(
        "flex items-center border-b border-border bg-card",
        "gap-2 sm:gap-3",
        "p-3 sm:p-4",
        "min-h-[56px] sm:min-h-[64px]"
      )}>
        {/* Mobile menu button - Touch-friendly */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenSidebar}
          className="md:hidden h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
          aria-label="Open agent sidebar"
          aria-expanded={false}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {selectedAgent ? (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Video className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold truncate" id="main-heading">
                {selectedAgent.name}
              </h1>
              <div className="hidden sm:block text-xs sm:text-sm text-muted-foreground truncate">
                {selectedAgent.description}
              </div>
            </div>
          </div>
        ) : (
          <h1 className="text-base sm:text-lg font-semibold truncate" id="main-heading">
            AI Agent Platform
          </h1>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden" role="main" aria-labelledby="main-heading">
        {isLoading && (
          <div className="flex items-center justify-center h-full p-4" role="status" aria-live="polite">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto" aria-hidden="true" />
              <p className="text-sm sm:text-base text-muted-foreground">
                Loading agent...
              </p>
            </div>
          </div>
        )}

        {!isLoading && !selectedAgent && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8 max-w-md">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center" aria-hidden="true">
                <Video className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-semibold">
                  No Agent Selected
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Select an agent from the sidebar to get started
                </p>
              </div>
              <Button
                onClick={handleOpenSidebar}
                className="md:hidden h-10 sm:h-11 px-6"
                size="lg"
                aria-label="Open agent sidebar"
              >
                Open Sidebar
              </Button>
            </div>
          </div>
        )}

        {!isLoading && selectedAgent && (
          <div className="h-full">
            <ChatContainer agentId={selectedAgent.id} />
          </div>
        )}
      </main>
    </div>
  );
}
