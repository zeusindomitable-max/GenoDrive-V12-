
import React, { useState } from 'react';

interface AIAssistantProps {
  message: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ message }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative w-80 glass border-cyan-500/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center relative">
                    <span className="text-lg">🛡️</span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0f0c29] rounded-full"></div>
                </div>
                <div>
                    <h4 className="text-xs font-orbitron text-white">SYSTEM MONITOR</h4>
                    <span className="text-[8px] text-cyan-400 font-medium uppercase tracking-widest">Protocol Active</span>
                </div>
            </div>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-white/20 hover:text-white transition-colors"
            >
                {isOpen ? '✕' : '▲'}
            </button>
          </div>

          <div className="transition-opacity duration-500">
            <p className="text-xs text-white/80 leading-relaxed italic">
              "{message}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
