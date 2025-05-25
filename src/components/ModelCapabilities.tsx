import React from 'react';
import { Eye, Code, Brain, Zap, Star, AlertTriangle, Info } from 'lucide-react';

interface ModelCapabilitiesProps {
  currentModel: string;
  hasImages?: boolean;
}

const MODEL_CAPABILITIES = {
  // Vision Models
  vision: {
    models: ['llava', 'llava:7b', 'llava:13b', 'bakllava', 'moondream', 'cogvlm'],
    icon: Eye,
    color: 'purple',
    name: 'Vision Models',
    description: 'Can see and analyze images, screenshots, diagrams, and visual content',
    capabilities: [
      'Analyze images and photos',
      'Read text from screenshots',
      'Describe visual content',
      'Understand diagrams and charts',
      'Answer questions about images'
    ],
    examples: [
      'What\'s in this photo?',
      'Read the text from this screenshot',
      'Explain this diagram',
      'What color is the car in this image?'
    ]
  },
  
  // Coding Models
  coding: {
    models: ['codellama', 'deepseek-coder', 'code-'],
    icon: Code,
    color: 'green',
    name: 'Coding Models',
    description: 'Specialized for programming, debugging, and code analysis',
    capabilities: [
      'Write code in multiple languages',
      'Debug and fix code issues',
      'Explain code functionality',
      'Code review and optimization',
      'Generate documentation'
    ],
    examples: [
      'Write a Python function to sort a list',
      'Debug this JavaScript code',
      'Explain what this function does',
      'Optimize this SQL query'
    ]
  },
  
  // General Models
  general: {
    models: ['llama', 'mistral', 'phi3', 'qwen'],
    icon: Brain,
    color: 'blue',
    name: 'General Models',
    description: 'Versatile models for conversation, writing, and general tasks',
    capabilities: [
      'Natural conversation',
      'Writing and editing',
      'Research and analysis',
      'Question answering',
      'Creative tasks'
    ],
    examples: [
      'Write an essay about climate change',
      'Explain quantum physics simply',
      'Help me plan a vacation',
      'Translate this text'
    ]
  },
  
  // Fast Models
  fast: {
    models: ['llama3.2:1b', 'llama3.2:3b', 'phi3:mini'],
    icon: Zap,
    color: 'yellow',
    name: 'Fast Models',
    description: 'Lightweight models optimized for speed and efficiency',
    capabilities: [
      'Quick responses',
      'Low resource usage',
      'Basic conversation',
      'Simple tasks',
      'Mobile-friendly'
    ],
    examples: [
      'Quick Q&A',
      'Simple explanations',
      'Basic writing help',
      'Fast translations'
    ]
  },
  
  // Uncensored Models
  uncensored: {
    models: ['dolphin', 'wizard', 'uncensored'],
    icon: Star,
    color: 'orange',
    name: 'Uncensored Models',
    description: 'Community models with fewer restrictions and more honest responses',
    capabilities: [
      'Honest opinions',
      'Fewer refusals',
      'Creative freedom',
      'Controversial topics',
      'Roleplay scenarios'
    ],
    examples: [
      'Give me an honest opinion about...',
      'Write creative content',
      'Discuss sensitive topics',
      'Help with roleplay'
    ]
  }
};

const getModelType = (modelName: string): keyof typeof MODEL_CAPABILITIES | null => {
  const name = modelName.toLowerCase();
  
  for (const [type, config] of Object.entries(MODEL_CAPABILITIES)) {
    if (config.models.some(model => name.includes(model))) {
      return type as keyof typeof MODEL_CAPABILITIES;
    }
  }
  
  return null;
};

const isVisionModel = (modelName: string): boolean => {
  const name = modelName.toLowerCase();
  return MODEL_CAPABILITIES.vision.models.some(model => name.includes(model));
};

export default function ModelCapabilities({ currentModel, hasImages }: ModelCapabilitiesProps) {
  const modelType = getModelType(currentModel);
  const currentCapability = modelType ? MODEL_CAPABILITIES[modelType] : null;
  const isVision = isVisionModel(currentModel);
  
  return (
    <div className="space-y-4">
      {/* Current Model Info */}
      <div className="bg-white/5 rounded-lg p-4">
        <h3 className="font-medium text-white mb-2 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Current Model: {currentModel}
        </h3>
        
        {currentCapability ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <currentCapability.icon className={`w-4 h-4 text-${currentCapability.color}-400`} />
              <span className={`text-${currentCapability.color}-400 font-medium`}>
                {currentCapability.name}
              </span>
            </div>
            <p className="text-sm text-white/70">{currentCapability.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <h4 className="text-sm font-medium text-white mb-1">What it can do:</h4>
                <ul className="text-xs text-white/60 space-y-1">
                  {currentCapability.capabilities.map((cap, i) => (
                    <li key={i}>• {cap}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Example prompts:</h4>
                <ul className="text-xs text-white/60 space-y-1">
                  {currentCapability.examples.map((example, i) => (
                    <li key={i}>• "{example}"</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/50">
            Model type not recognized. It may be a custom or newer model.
          </p>
        )}
        
        {/* Image Warning */}
        {hasImages && !isVision && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Images uploaded but model can't see them!</span>
            </div>
            <p className="text-xs text-red-300 mt-1">
              Switch to a vision model like "llava" to analyze images. Your current model can only process text.
            </p>
          </div>
        )}
      </div>
      
      {/* Model Types Overview */}
      <div>
        <h3 className="font-medium text-white mb-3">Available Model Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(MODEL_CAPABILITIES).map(([type, config]) => {
            const Icon = config.icon;
            const isCurrent = type === modelType;
            
            return (
              <div
                key={type}
                className={`
                  p-3 rounded-lg border transition-all
                  ${isCurrent 
                    ? `border-${config.color}-500/50 bg-${config.color}-500/10` 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 text-${config.color}-400`} />
                  <span className={`text-sm font-medium text-${config.color}-400`}>
                    {config.name}
                  </span>
                  {isCurrent && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60 mb-2">{config.description}</p>
                <div className="text-xs text-white/40">
                  Examples: {config.models.slice(0, 2).join(', ')}
                  {config.models.length > 2 && ', ...'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Pro Tips */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
        <h4 className="font-medium text-white mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-white/70 space-y-1">
          <li>• Use vision models (llava) for any image analysis tasks</li>
          <li>• Choose coding models (codellama) for programming work</li>
          <li>• Try uncensored models (dolphin) for creative and honest responses</li>
          <li>• Use fast models (1b/3b) for quick questions to save resources</li>
          <li>• Larger models (70b) give better quality but are slower</li>
        </ul>
      </div>
    </div>
  );
} 