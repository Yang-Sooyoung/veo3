/**
 * Agent Configuration
 * Defines all available agents and their configurations
 */

import { AgentConfig } from '@/types';

/**
 * VEO3 Video Generation Agent Configuration
 */
export const VEO3_AGENT: AgentConfig = {
  id: 'veo3-video-generator',
  name: 'VEO3 Video Generator',
  description: 'Generate high-quality videos from text prompts using Google\'s VEO3 AI model',
  icon: 'Video', // Lucide icon name
  // Use relative path for proxy - will be handled by Next.js API route
  webhookUrl: '/api/webhook/veo3-video-generate',
  category: 'video',
  status: 'active',
  inputSchema: {
    type: 'text',
    validation: {
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
  },
  outputSchema: {
    type: 'video',
    format: 'mp4',
  },
  settings: {
    maxExecutionTime: 300000, // 5 minutes
    pollingInterval: 5000, // 5 seconds
    retryAttempts: 3,
  },
};

/**
 * Default parameters for VEO3 agent
 */
export const VEO3_DEFAULT_PARAMETERS = {
  aspectRatio: '16:9',
  durationSeconds: 5,
  resolution: '720p',
};

/**
 * Available aspect ratios for VEO3
 */
export const VEO3_ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3'] as const;

/**
 * Available durations for VEO3 (in seconds)
 */
export const VEO3_DURATIONS = [5, 10, 15, 20, 30] as const;

/**
 * Available resolutions for VEO3
 */
export const VEO3_RESOLUTIONS = ['480p', '720p', '1080p'] as const;

/**
 * All available agents
 */
export const AGENTS: AgentConfig[] = [
  VEO3_AGENT,
  // Future agents can be added here
];
