import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, AlertTriangle, Download, Sparkles, Apple, Monitor, CheckCircle } from 'lucide-react';

interface SystemInfo {
  cpu: string;
  cores: number;
  memory: number;
  gpu: string;
  platform: string;
  isAppleSilicon: boolean;
}

interface ModelRecommendation {
  name: string;
  size: string;
  description: string;
  requirements: string;
  score: number;
  category: string;
  pullCommand: string;
}

interface SystemCapabilitiesProps {
  installedModels: string[];
  onModelInstall: (modelName: string) => void;
}

const MODEL_DATABASE: ModelRecommendation[] = [
  // Vision Models
  { name: 'llava:7b', size: '4.7GB', description: 'Vision model for image analysis', requirements: '8GB+ RAM', score: 85, category: 'Vision', pullCommand: 'ollama pull llava:7b' },
  { name: 'llava:13b', size: '8.0GB', description: 'High-quality vision model', requirements: '16GB+ RAM', score: 90, category: 'Vision', pullCommand: 'ollama pull llava:13b' },
  { name: 'bakllava', size: '4.7GB', description: 'Efficient vision model', requirements: '8GB+ RAM', score: 80, category: 'Vision', pullCommand: 'ollama pull bakllava' },
  { name: 'moondream', size: '1.7GB', description: 'Lightweight vision model', requirements: '4GB+ RAM', score: 75, category: 'Vision', pullCommand: 'ollama pull moondream' },
  
  // Coding Models  
  { name: 'codellama:7b', size: '3.8GB', description: 'Code generation and analysis', requirements: '8GB+ RAM', score: 88, category: 'Coding', pullCommand: 'ollama pull codellama:7b' },
  { name: 'codellama:13b', size: '7.3GB', description: 'Advanced coding assistant', requirements: '16GB+ RAM', score: 92, category: 'Coding', pullCommand: 'ollama pull codellama:13b' },
  { name: 'deepseek-coder:6.7b', size: '3.8GB', description: 'Specialized code model', requirements: '8GB+ RAM', score: 87, category: 'Coding', pullCommand: 'ollama pull deepseek-coder:6.7b' },
  
  // General Models
  { name: 'llama3.2:3b', size: '2.0GB', description: 'Fast general purpose model', requirements: '4GB+ RAM', score: 82, category: 'General', pullCommand: 'ollama pull llama3.2:3b' },
  { name: 'llama3.2:8b', size: '4.7GB', description: 'Balanced performance model', requirements: '8GB+ RAM', score: 87, category: 'General', pullCommand: 'ollama pull llama3.2:8b' },
  { name: 'llama3.1:8b', size: '4.7GB', description: 'High-quality general model', requirements: '8GB+ RAM', score: 89, category: 'General', pullCommand: 'ollama pull llama3.1:8b' },
  { name: 'mistral:7b', size: '4.1GB', description: 'Efficient general purpose', requirements: '8GB+ RAM', score: 85, category: 'General', pullCommand: 'ollama pull mistral:7b' },
  { name: 'phi3:mini', size: '2.3GB', description: 'Microsoft\'s compact model', requirements: '4GB+ RAM', score: 80, category: 'General', pullCommand: 'ollama pull phi3:mini' },
  
  // Fast Models
  { name: 'llama3.2:1b', size: '1.3GB', description: 'Ultra-fast responses', requirements: '2GB+ RAM', score: 75, category: 'Fast', pullCommand: 'ollama pull llama3.2:1b' },
  { name: 'phi3:mini', size: '2.3GB', description: 'Quick and efficient', requirements: '4GB+ RAM', score: 78, category: 'Fast', pullCommand: 'ollama pull phi3:mini' },
  
  // Uncensored Models
  { name: 'dolphin-llama3:8b', size: '4.7GB', description: 'Uncensored conversational AI', requirements: '8GB+ RAM', score: 84, category: 'Uncensored', pullCommand: 'ollama pull dolphin-llama3:8b' },
  { name: 'wizard-vicuna-uncensored:7b', size: '3.8GB', description: 'Creative and honest responses', requirements: '8GB+ RAM', score: 82, category: 'Uncensored', pullCommand: 'ollama pull wizard-vicuna-uncensored:7b' },
];

export default function SystemCapabilities({ installedModels, onModelInstall }: SystemCapabilitiesProps) {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [showMoreModels, setShowMoreModels] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const detectAppleSilicon = (): boolean => {
    // Multi-method detection for Apple Silicon
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Method 1: Check user agent for Mac
    const isMac = platform.includes('mac') || userAgent.includes('mac');
    if (!isMac) return false;
    
    // Method 2: WebGL renderer analysis for Apple Silicon indicators
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        console.log('GPU Renderer:', renderer);
        
        // Look for Apple Silicon indicators in GPU renderer (including M4)
        const appleIndicators = ['apple', 'm1', 'm2', 'm3', 'm4', 'metal'];
        const hasAppleGPU = appleIndicators.some(indicator => renderer.includes(indicator));
        if (hasAppleGPU) return true;
      }
    }
    
    // Method 3: Core count patterns typical of Apple Silicon (updated for M4)
    const cores = navigator.hardwareConcurrency || 0;
    const isAppleSiliconCoreCount = [8, 10, 12, 14, 16, 20, 24, 28, 32].includes(cores);
    
    // Method 4: Memory estimation (Apple Silicon typically has unified memory)
    const memory = (navigator as any).deviceMemory || 0;
    const hasUnifiedMemory = memory >= 8; // Apple Silicon typically starts at 8GB+
    
    console.log('Detection methods:', {
      isMac,
      cores,
      isAppleSiliconCoreCount,
      memory,
      hasUnifiedMemory
    });
    
    // Combine heuristics - if Mac with Apple Silicon patterns, likely Apple Silicon
    return isMac && (isAppleSiliconCoreCount || hasUnifiedMemory);
  };

  const estimateAppleSiliconMemory = (cores: number): number => {
    // Apple Silicon memory configurations based on core count (updated for M4)
    const memoryMapping: { [key: number]: number } = {
      8: 16,   // M1, M2, M3, M4: 8 cores → 16GB typical
      10: 16,  // M1 Pro, M2 Pro, M3 Pro, M4 Pro: 10 cores → 16GB typical  
      12: 32,  // M1 Max, M2 Max, M3 Max: 12 cores → 32GB typical
      14: 48,  // M4 Pro (14-core): 14 cores → 48GB typical
      16: 64,  // M1 Ultra, M4 Max: 16 cores → 64GB typical
      20: 64,  // M2 variants: 20 cores → 64GB typical
      24: 128, // M2 Ultra: 24 cores → 128GB typical
      28: 128, // M4 Max (high-end): 28 cores → 128GB typical
      32: 192  // Future M4 Ultra potential: 32 cores → 192GB typical
    };
    
    return memoryMapping[cores] || Math.max(16, cores * 2); // Fallback estimation
  };

  const detectSystemInfo = (): SystemInfo => {
    const cores = navigator.hardwareConcurrency || 4;
    const isAppleSilicon = detectAppleSilicon();
    
    // Memory detection
    const deviceMemory = (navigator as any).deviceMemory;
    let memory: number;
    
    if (isAppleSilicon) {
      memory = estimateAppleSiliconMemory(cores);
    } else if (deviceMemory) {
      memory = deviceMemory * 1024; // Convert GB to MB, then back to GB
    } else {
      memory = Math.max(8, cores * 2); // Estimate based on cores
    }

    // CPU detection (updated for M4 series)
    let cpu = 'Unknown Processor';
    if (isAppleSilicon) {
      if (cores >= 32) cpu = 'Apple M4 Ultra';
      else if (cores >= 28) cpu = 'Apple M4 Max';
      else if (cores >= 24) cpu = 'Apple M2 Ultra';
      else if (cores >= 20) cpu = 'Apple M2 Pro/Max';
      else if (cores >= 16) cpu = 'Apple M1 Ultra or M4 Max'; 
      else if (cores >= 14) cpu = 'Apple M4 Pro';
      else if (cores >= 12) cpu = 'Apple M1/M2/M3 Max';
      else if (cores >= 10) cpu = 'Apple M1/M2/M3/M4 Pro';
      else cpu = 'Apple M1/M2/M3/M4';
    } else {
      cpu = `${cores}-Core Processor`;
    }

    // GPU detection
    let gpu = 'Integrated Graphics';
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        gpu = renderer || gpu;
      }
    }

    return {
      cpu,
      cores,
      memory,
      gpu,
      platform: navigator.platform,
      isAppleSilicon
    };
  };

  useEffect(() => {
    setTimeout(() => {
      const info = detectSystemInfo();
      setSystemInfo(info);
      setIsAnalyzing(false);
      console.log('System Info Detected:', info);
    }, 1000);
  }, []);

  const getRecommendedModels = (): ModelRecommendation[] => {
    if (!systemInfo) return [];

    return MODEL_DATABASE
      .map(model => {
        let score = model.score;
        
        // Apple Silicon performance bonus
        if (systemInfo.isAppleSilicon) {
          score += 5; // Apple Silicon efficiency bonus
        }
        
        // Memory-based scoring
        const modelSizeGB = parseFloat(model.size);
        if (systemInfo.memory >= modelSizeGB * 3) {
          score += 10; // Plenty of memory
        } else if (systemInfo.memory >= modelSizeGB * 2) {
          score += 5; // Adequate memory
        } else if (systemInfo.memory < modelSizeGB * 1.5) {
          score -= 20; // Insufficient memory
        }
        
        // Core count bonus
        if (systemInfo.cores >= 8) {
          score += 5;
        }
        
        return { ...model, score };
      })
      .sort((a, b) => b.score - a.score);
  };

  const recommendedModels = getRecommendedModels();
  const displayModels = showMoreModels ? recommendedModels : recommendedModels.slice(0, 6);

  if (isAnalyzing) {
    return (
      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="font-medium text-white">Analyzing Your System...</h3>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-white/10 rounded animate-pulse" />
          <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (!systemInfo) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>Unable to detect system capabilities</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* System Information */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-medium text-white">System Analysis</h3>
          {systemInfo.isAppleSilicon && (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs">
              <Apple className="w-3 h-3" />
              <span>Apple Silicon</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-white/60">CPU</div>
              <div className="text-white">{systemInfo.cpu}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-green-400" />
            <div>
              <div className="text-white/60">Cores</div>
              <div className="text-white">{systemInfo.cores}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-yellow-400" />
            <div>
              <div className="text-white/60">Memory</div>
              <div className="text-white">{systemInfo.memory}GB</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-white/60">Performance</div>
              <div className="text-white">
                {systemInfo.isAppleSilicon ? 'Excellent' : 
                 systemInfo.cores >= 8 ? 'Good' : 'Basic'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white">Recommended Models</h4>
          <span className="text-xs text-white/60">
            Based on your {systemInfo.memory}GB {systemInfo.isAppleSilicon ? 'Apple Silicon' : ''} system
          </span>
        </div>
        
        <div className="grid gap-3">
          {displayModels.map((model, index) => {
            const isInstalled = installedModels.includes(model.name);
            const sizeGB = parseFloat(model.size);
            const canRun = systemInfo.memory >= sizeGB * 1.5;
            
            return (
              <div
                key={model.name}
                className={`
                  p-3 rounded-lg border transition-all hover:bg-white/5
                  ${canRun 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-yellow-500/30 bg-yellow-500/5'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-white">{model.name}</span>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded text-white/70">
                        {model.category}
                      </span>
                      <span className="text-xs text-white/50">{model.size}</span>
                      {index < 3 && (
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                          Top Pick
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/70">{model.description}</p>
                    <p className="text-xs text-white/50 mt-1">{model.requirements}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isInstalled ? (
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <CheckCircle className="w-4 h-4" />
                        <span>Installed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onModelInstall(model.name)}
                        disabled={!canRun}
                        className={`
                          flex items-center gap-1 px-3 py-1 rounded text-xs
                          ${canRun
                            ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                            : 'bg-white/5 text-white/40 cursor-not-allowed'
                          }
                        `}
                      >
                        <Download className="w-3 h-3" />
                        <span>Install</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {recommendedModels.length > 6 && (
          <button
            onClick={() => setShowMoreModels(!showMoreModels)}
            className="mt-3 w-full py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showMoreModels ? 'Show Less' : `Show ${recommendedModels.length - 6} More Models`}
          </button>
        )}
      </div>
      
      {/* Performance Tips */}
      {systemInfo.isAppleSilicon && (
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-3 border border-green-500/20">
          <h5 className="text-sm font-medium text-green-400 mb-2">💡 Apple Silicon Tips</h5>
          <ul className="text-xs text-white/70 space-y-1">
            <li>• Your Apple Silicon Mac can run larger models efficiently</li>
            <li>• Unified memory architecture provides excellent performance</li>
            <li>• Try vision models like llava for image analysis tasks</li>
            <li>• Larger models (13B+) will run well on your system</li>
          </ul>
        </div>
      )}
    </div>
  );
} 