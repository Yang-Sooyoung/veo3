'use client';

import { AgentStatus } from '@/types';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentIconProps {
  icon: string;
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatusBadge?: boolean;
}

/**
 * Size configuration for icon and container
 */
const sizeConfig = {
  sm: {
    icon: 'h-4 w-4',
    container: 'h-6 w-6',
    badge: 'h-2 w-2',
    badgePosition: '-bottom-0 -right-0',
    emoji: 'text-sm',
  },
  md: {
    icon: 'h-6 w-6',
    container: 'h-8 w-8',
    badge: 'h-2.5 w-2.5',
    badgePosition: '-bottom-0.5 -right-0.5',
    emoji: 'text-base',
  },
  lg: {
    icon: 'h-8 w-8',
    container: 'h-10 w-10',
    badge: 'h-3 w-3',
    badgePosition: '-bottom-0.5 -right-0.5',
    emoji: 'text-lg',
  },
  xl: {
    icon: 'h-10 w-10',
    container: 'h-12 w-12',
    badge: 'h-3.5 w-3.5',
    badgePosition: '-bottom-1 -right-1',
    emoji: 'text-xl',
  },
};

/**
 * Status badge colors with background and border
 */
const statusStyles = {
  active: {
    bg: 'bg-green-500',
    border: 'border-card',
    glow: 'shadow-[0_0_8px_rgba(34,197,94,0.5)]',
  },
  inactive: {
    bg: 'bg-gray-400',
    border: 'border-card',
    glow: '',
  },
  maintenance: {
    bg: 'bg-yellow-500',
    border: 'border-card',
    glow: 'shadow-[0_0_8px_rgba(234,179,8,0.5)]',
  },
};

/**
 * AgentIcon Component
 * Displays agent icon with status badge overlay
 * Supports both Lucide icons and emoji/text fallback
 */
export function AgentIcon({ 
  icon, 
  status, 
  size = 'md',
  showStatusBadge = true 
}: AgentIconProps) {
  // Check if icon is a Lucide icon name
  const IconComponent = (LucideIcons as any)[icon];
  const config = sizeConfig[size];
  const statusStyle = statusStyles[status];
  
  // Check if icon is an emoji (single character or emoji sequence)
  const isEmoji = !IconComponent && icon.length <= 4;
  
  return (
    <div className={cn(
      "relative flex-shrink-0 flex items-center justify-center",
      config.container
    )}>
      {IconComponent ? (
        // Render Lucide icon
        <IconComponent 
          className={cn(
            config.icon, 
            "text-foreground transition-transform duration-200"
          )} 
          strokeWidth={2}
        />
      ) : isEmoji ? (
        // Render emoji
        <div className={cn(
          "flex items-center justify-center",
          config.emoji
        )}>
          {icon}
        </div>
      ) : (
        // Fallback to text (first 2 characters)
        <div className={cn(
          "flex items-center justify-center font-semibold text-foreground",
          config.emoji
        )}>
          {icon.substring(0, 2).toUpperCase()}
        </div>
      )}
      
      {/* Status indicator badge */}
      {showStatusBadge && (
        <div
          className={cn(
            "absolute rounded-full border-2 transition-all duration-200",
            config.badge,
            config.badgePosition,
            statusStyle.bg,
            statusStyle.border,
            statusStyle.glow
          )}
          aria-label={`Status: ${status}`}
          title={`Agent status: ${status}`}
        >
          {/* Pulse animation for active status */}
          {status === 'active' && (
            <span className={cn(
              "absolute inset-0 rounded-full animate-ping opacity-75",
              statusStyle.bg
            )} />
          )}
        </div>
      )}
    </div>
  );
}
