
import React, { useState } from 'react';

interface LaboratoryProps {
  onUpload: (file: File, seed: number) => void;
  onExternalUpload: (files: File[]) => void;
}

const Laboratory: React.FC<LaboratoryProps> = ({ onUpload, onExternalUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'synthesis' | 'resurrection'>('synthesis');
  const [geneticPin, setGeneticPin] = useState<number>(42);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === 'synthesis') {
      if (e.target.files && e.target.files[0]) {
        onUpload(e.target.files[0], geneticPin);
      }
    } else {
      if (e.target.files && e.target.files.length > 0) {
        onExternalUpload(Array.from(e.target.files));
      }
    }
  };

  return (
    <div className="glass p-12 rounded-3xl border-cyan-500/20 text-center max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-center mb-4">
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
          <button 
            onClick={() => setMode('synthesis')}
            className={`px-6 py-2 rounded-lg font-orbitron text-[10px] transition-all ${mode === 'synthesis' ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,210,255,0.4)]' : 'text-white/40 hover:text-white'}`}
          >
            SYNTHESIS MODE
          </button>
          <button 
            onClick={() => setMode('resurrection')}
            className={`px-6 py-2 rounded-lg font-orbitron text-[10px] transition-all ${mode === 'resurrection' ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,210,255,0.4)]' : 'text-white/40 hover:text-white'}`}
          >
            EXTERNAL RESURRECTION
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="inline-block p-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
          <span className="text-6xl">{mode === 'synthesis' ? '📥' : '🛡️'}</span>
        </div>
        <h2 className="text-3xl font-orbitron font-bold mb-2">
            {mode === 'synthesis' ? 'Molecular Analysis' : 'Vault Reconstruction'}
        </h2>
        <p className="text-white/60 text-sm max-w-md mx-auto">
            {mode === 'synthesis' 
                ? 'Upload any digital artifact (Private Keys, Documents, Photos) to begin the genetic synthesis process.' 
                : 'Upload at least 6 secure fragments (.gdv) to initiate external resurrection.'}
        </p>
      </div>

      {mode === 'synthesis' && (
        <div className="max-w-xs mx-auto mb-6 p-4 glass rounded-2xl border-white/10">
          <label className="text-[10px] font-orbitron text-cyan-400 uppercase tracking-widest block mb-2">Genetic Security PIN</label>
          <input 
            type="number" 
            value={geneticPin}
            onChange={(e) => setGeneticPin(parseInt(e.target.value) || 0)}
            className="w-full bg-black/40 border border-cyan-500/30 rounded-xl px-4 py-2 text-center text-white font-orbitron focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="Seed (Default: 42)"
          />
          <p className="text-[9px] text-white/30 mt-2 italic">This PIN acts as your private encryption seed.</p>
        </div>
      )}

      <label 
        className={`
          relative cursor-pointer border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center transition-all
          ${isDragging ? 'border-cyan-400 bg-cyan-400/5 scale-[1.02]' : 'border-white/10 hover:border-cyan-500/40 hover:bg-white/5'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (mode === 'synthesis') {
                onUpload(e.dataTransfer.files[0], geneticPin);
            } else {
                onExternalUpload(Array.from(e.dataTransfer.files));
            }
          }
        }}
      >
        <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            multiple={mode === 'resurrection'} 
            accept={mode === 'resurrection' ? '.gdv' : '*'}
        />
        <div className="text-cyan-400 text-lg font-orbitron mb-2 uppercase tracking-widest">
            {mode === 'synthesis' ? 'Initiate Synthesis' : 'Import Fragments'}
        </div>
        <div className="text-white/40 text-sm italic">
            {mode === 'synthesis' ? 'Drag & Drop File' : 'Drag & Drop Shards (.gdv)'}
        </div>
        <div className="mt-8 flex space-x-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-4 bg-cyan-500/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
        </div>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="p-4 glass rounded-xl border-white/5">
            <h4 className="text-cyan-400 text-[10px] font-orbitron uppercase mb-1">Inheritance Mode</h4>
            <p className="text-xs text-white/70 leading-relaxed">Distribute shards to family; recover only when unified.</p>
        </div>
        <div className="p-4 glass rounded-xl border-white/5">
            <h4 className="text-cyan-400 text-[10px] font-orbitron uppercase mb-1">Cold Storage</h4>
            <p className="text-xs text-white/70 leading-relaxed">Immutable protection for Private Keys & Seed Phrases.</p>
        </div>
        <div className="p-4 glass rounded-xl border-white/5">
            <h4 className="text-cyan-400 text-[10px] font-orbitron uppercase mb-1">Zero-Cloud</h4>
            <p className="text-xs text-white/70 leading-relaxed">Offline-ready genetics. No data ever leaves your device.</p>
        </div>
      </div>
    </div>
  );
};

export default Laboratory;
