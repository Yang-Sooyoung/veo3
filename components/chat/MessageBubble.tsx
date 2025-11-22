'use client';

import { MessageType } from '@/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  type: MessageType;
  content: string;
  children?: React.ReactNode;
}

export function MessageBubble({ type, content, children }: MessageBubbleProps) {
  // User messages: right-aligned, blue
  if (type === 'user') {
    return (
      <div className="flex justify-end animate-in slide-in-from-right-5 duration-300">
        <div className="max-w-[80%] md:max-w-[70%]">
          <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 shadow-sm">
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // Agent messages: left-aligned, gray
  if (type === 'agent') {
    return (
      <div className="flex justify-start animate-in slide-in-from-left-5 duration-300">
        <div className="max-w-[80%] md:max-w-[70%]">
          <div className="rounded-2xl rounded-tl-sm bg-muted text-foreground px-4 py-2.5 shadow-sm">
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // System messages: centered, muted
  return (
    <div className="flex justify-center animate-in fade-in duration-300">
      <div className="max-w-[90%] md:max-w-[80%]">
        <div className="rounded-lg bg-muted/50 text-muted-foreground px-3 py-2 text-center">
          <p className="text-xs whitespace-pre-wrap break-words">{content}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
