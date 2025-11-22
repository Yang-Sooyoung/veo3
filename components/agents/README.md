# Agent Components

This directory contains components related to AI agent functionality.

## SettingsPanel

The `SettingsPanel` component provides a UI for configuring VEO3 video generation parameters.

### Features

- **Aspect Ratio Selection**: Choose from 16:9, 9:16, 1:1, or 4:3
- **Duration Selection**: Select video duration from 5 to 30 seconds
- **Resolution Selection**: Choose from 480p, 720p, or 1080p
- **Reset to Defaults**: Quick button to restore default settings
- **Parameter Validation**: Ensures only valid values are used
- **Real-time Updates**: Notifies parent component of parameter changes

### Usage

```tsx
import { SettingsPanel, VEO3Parameters } from '@/components/agents';

function MyComponent() {
  const handleParametersChange = (parameters: VEO3Parameters) => {
    console.log('Parameters updated:', parameters);
    // Use parameters in execution
  };

  return (
    <SettingsPanel 
      onParametersChange={handleParametersChange}
      initialParameters={{ aspectRatio: '16:9', durationSeconds: 10, resolution: '1080p' }}
    />
  );
}
```

### Integration with Execution Service

The parameters from SettingsPanel are automatically included in the webhook payload when executing the VEO3 agent:

```tsx
const executionInput: ExecutionInput = {
  prompt: userMessage,
  parameters: {
    aspectRatio: '16:9',
    durationSeconds: 10,
    resolution: '1080p',
  },
};

await executionService.executeAgent('veo3-video-generator', executionInput);
```

The ExecutionService's `formatPayload` method merges these parameters into the webhook request, ensuring they are sent to the n8n workflow.

### Default Values

Default parameters are defined in `lib/agents/agent-config.ts`:

- **aspectRatio**: '16:9'
- **durationSeconds**: 5
- **resolution**: '720p'

### Validation

The component validates parameters against allowed values:

- **Aspect Ratios**: 16:9, 9:16, 1:1, 4:3
- **Durations**: 5, 10, 15, 20, 30 seconds
- **Resolutions**: 480p, 720p, 1080p

Invalid values will be caught by the validation method before submission.
