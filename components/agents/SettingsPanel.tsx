'use client';

import { useState, useEffect } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  VEO3_DEFAULT_PARAMETERS,
  VEO3_ASPECT_RATIOS,
  VEO3_DURATIONS,
  VEO3_RESOLUTIONS,
} from '@/lib/agents/agent-config';

/**
 * VEO3 video generation parameters
 */
export interface VEO3Parameters {
  aspectRatio: string;
  durationSeconds: number;
  resolution: string;
}

interface SettingsPanelProps {
  onParametersChange?: (parameters: VEO3Parameters) => void;
  initialParameters?: Partial<VEO3Parameters>;
}

/**
 * Settings Panel Component
 * Provides UI for configuring VEO3 video generation parameters
 */
export function SettingsPanel({
  onParametersChange,
  initialParameters,
}: SettingsPanelProps) {
  const [parameters, setParameters] = useState<VEO3Parameters>({
    ...VEO3_DEFAULT_PARAMETERS,
    ...initialParameters,
  });

  // Notify parent component when parameters change
  useEffect(() => {
    onParametersChange?.(parameters);
  }, [parameters, onParametersChange]);

  /**
   * Update a specific parameter
   */
  const updateParameter = <K extends keyof VEO3Parameters>(
    key: K,
    value: VEO3Parameters[K]
  ) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Reset all parameters to defaults
   */
  const resetToDefaults = () => {
    setParameters(VEO3_DEFAULT_PARAMETERS);
  };

  /**
   * Validate parameters before submission
   */
  const validateParameters = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate aspect ratio
    if (!VEO3_ASPECT_RATIOS.includes(parameters.aspectRatio as any)) {
      errors.push('Invalid aspect ratio');
    }

    // Validate duration
    if (!VEO3_DURATIONS.includes(parameters.durationSeconds as any)) {
      errors.push('Invalid duration');
    }

    // Validate resolution
    if (!VEO3_RESOLUTIONS.includes(parameters.resolution as any)) {
      errors.push('Invalid resolution');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // Expose validation method (can be used by parent component)
  useEffect(() => {
    // Store validation function in a way parent can access if needed
    (window as any).__veo3SettingsValidation = validateParameters;
    return () => {
      delete (window as any).__veo3SettingsValidation;
    };
  }, [parameters]);

  return (
    <Card className="border-0 shadow-none" role="region" aria-label="Video generation settings">
      <CardHeader className="px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            <CardTitle className="text-sm sm:text-base truncate">
              Video Settings
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
            aria-label="Reset settings to defaults"
          >
            <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
          </Button>
        </div>
        <CardDescription className="text-[10px] sm:text-xs">
          Configure video generation parameters
        </CardDescription>
      </CardHeader>

      <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
        {/* Responsive grid layout for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Aspect Ratio */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="aspectRatio" className="text-xs">
              Aspect Ratio
            </Label>
            <Select
              value={parameters.aspectRatio}
              onValueChange={(value: string) => updateParameter('aspectRatio', value)}
            >
              <SelectTrigger id="aspectRatio" className="h-9 sm:h-10">
                <SelectValue placeholder="Select aspect ratio" />
              </SelectTrigger>
              <SelectContent>
                {VEO3_ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio} value={ratio}>
                    {ratio}
                    {ratio === '16:9' && ' (Landscape)'}
                    {ratio === '9:16' && ' (Portrait)'}
                    {ratio === '1:1' && ' (Square)'}
                    {ratio === '4:3' && ' (Standard)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="duration" className="text-xs">
              Duration
            </Label>
            <Select
              value={parameters.durationSeconds.toString()}
              onValueChange={(value: string) =>
                updateParameter('durationSeconds', parseInt(value, 10))
              }
            >
              <SelectTrigger id="duration" className="h-9 sm:h-10">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {VEO3_DURATIONS.map((duration) => (
                  <SelectItem key={duration} value={duration.toString()}>
                    {duration} seconds
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resolution */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="resolution" className="text-xs">
              Resolution
            </Label>
            <Select
              value={parameters.resolution}
              onValueChange={(value: string) => updateParameter('resolution', value)}
            >
              <SelectTrigger id="resolution" className="h-9 sm:h-10">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                {VEO3_RESOLUTIONS.map((resolution) => (
                  <SelectItem key={resolution} value={resolution}>
                    {resolution}
                    {resolution === '480p' && ' (SD)'}
                    {resolution === '720p' && ' (HD)'}
                    {resolution === '1080p' && ' (Full HD)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="pt-2 border-t">
          <p className="text-[10px] sm:text-xs text-muted-foreground" role="status" aria-live="polite">
            Current: {parameters.aspectRatio} • {parameters.durationSeconds}s •{' '}
            {parameters.resolution}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
