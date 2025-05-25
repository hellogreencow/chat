import React, { useState, useEffect } from 'react';
import { ModelConfig } from './types';
import ModelSelector from './components/ModelSelector';
import Chat from './components/Chat';
import SystemCapabilities from './components/SystemCapabilities';
import ModelCapabilities from './components/ModelCapabilities';
import { Bot, Settings, Monitor, Sparkles, X } from 'lucide-react';

function App() {
  console.log('AI Chat Assistant rendering');
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    type: 'ollama',
    endpoint: 'http://localhost:11434',
    modelName: 'llama3.2',
    parameters: {
      temperature: 0.7,
      maxTokens: 2048,
    },
  });
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showModelCapabilities, setShowModelCapabilities] = useState(false);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [hasImages, setHasImages] = useState(false);

  useEffect(() => {
    console.log('AI Chat Assistant mounted');
    // Check for installed models on startup
    checkInstalledModels();
  }, []);

  const checkInstalledModels = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        const modelNames = data.models?.map((m: any) => m.name) || [];
        setInstalledModels(modelNames);
      }
    } catch (error) {
      console.log('Could not fetch installed models:', error);
    }
  };

  const handleModelInstall = async (modelName: string) => {
    try {
      // This would trigger the model installation
      // For now, just refresh the installed models list
      setTimeout(checkInstalledModels, 2000);
    } catch (error) {
      console.error('Error installing model:', error);
    }
  };

  // Add a simple error boundary
  if (!ModelSelector || !Chat) {
    console.error('Components not loaded properly');
    return <div className="text-white p-4">Error loading components</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent_80%)]" />
      
      {/* Header */}
      <header className="relative bg-black/20 backdrop-blur-sm border-b border-white/10 py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-500/30">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI Chat Assistant
            </h1>
          </div>
          
          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {/* System Info Button */}
            <button
              onClick={() => setShowSystemInfo(!showSystemInfo)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
              title="System Analysis & Model Recommendations"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">System</span>
            </button>

            {/* Model Capabilities Button */}
            <button
              onClick={() => setShowModelCapabilities(!showModelCapabilities)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
              title="Model Capabilities & Usage Guide"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Capabilities</span>
            </button>
            
            {/* Model Configuration Button */}
            <button
              onClick={() => setShowModelConfig(!showModelConfig)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Model Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* System Capabilities Panel */}
      <div className={`
        fixed left-0 top-[72px] w-[500px] max-w-[90vw] max-h-[calc(100vh-72px)] overflow-y-auto
        bg-gray-900/95 backdrop-blur-sm border-r border-white/10 shadow-xl
        transform transition-transform duration-300 ease-in-out z-50
        ${showSystemInfo ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">System Analysis</h2>
            <button
              onClick={() => setShowSystemInfo(false)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          <SystemCapabilities 
            installedModels={installedModels}
            onModelInstall={handleModelInstall}
          />
        </div>
      </div>

      {/* Model Capabilities Panel */}
      <div className={`
        fixed right-0 top-[72px] w-[450px] max-w-[90vw] max-h-[calc(100vh-72px)] overflow-y-auto
        bg-gray-900/95 backdrop-blur-sm border-l border-white/10 shadow-xl
        transform transition-transform duration-300 ease-in-out z-40
        ${showModelCapabilities ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Model Capabilities</h2>
            <button
              onClick={() => setShowModelCapabilities(false)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          <ModelCapabilities 
            currentModel={modelConfig.modelName || 'No model selected'}
            hasImages={hasImages}
          />
        </div>
      </div>

      {/* Model Configuration Panel */}
      <div className={`
        fixed right-0 top-[72px] w-[400px] max-w-[90vw] max-h-[calc(100vh-72px)] overflow-y-auto
        bg-gray-900/95 backdrop-blur-sm border-l border-white/10 shadow-xl
        transform transition-transform duration-300 ease-in-out z-30
        ${showModelConfig ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Model Settings</h2>
            <button
              onClick={() => setShowModelConfig(false)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          <ModelSelector config={modelConfig} onConfigChange={setModelConfig} />
        </div>
      </div>

      {/* Main Chat Area */}
      <main className="container mx-auto p-4 h-[calc(100vh-88px)]">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-full shadow-xl overflow-hidden">
          <Chat 
            modelConfig={modelConfig} 
            onImagesChange={setHasImages}
          />
        </div>
      </main>
    </div>
  );
}

export default App;