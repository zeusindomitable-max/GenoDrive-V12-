
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between mb-12">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
          <div className="relative glass rounded-full w-full h-full flex items-center justify-center border-cyan-400 border-2">
            <span className="text-2xl">🧬</span>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-orbitron font-extrabold tracking-tighter neon-cyan">
            GENODRIVE <span className="text-white">V12</span>
          </h1>
          <p className="text-cyan-400/60 text-sm tracking-widest font-medium">CYBER-GENETIC STORAGE SYSTEM</p>
        </div>
      </div>
      
      <div className="mt-4 md:mt-0 flex items-center space-x-6 glass px-6 py-2 rounded-full border-cyan-500/30">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest">System Status</span>
          <span className="text-green-400 font-orbitron text-sm">OPTIMAL</span>
        </div>
        <div className="w-px h-8 bg-white/10"></div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest">Node Location</span>
          <span className="text-white font-orbitron text-sm">BIO-CLUSTER 7</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
