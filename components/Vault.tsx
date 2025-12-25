
import React from 'react';
import { GenoData, Shard } from '../types';
import { createGdvFile } from '../services/genetics';

interface VaultProps {
  data: GenoData;
  toggleShard: (id: number) => void;
  onNext: () => void;
}

const Vault: React.FC<VaultProps> = ({ data, toggleShard, onNext }) => {
  const aliveCount = data.shards.filter(s => s.isAlive).length;
  const isRecoverable = aliveCount >= data.k;
  const resiliencePct = (aliveCount / data.shards.length) * 100;
  const barColor = isRecoverable ? '#00d2ff' : '#ff4b4b';

  const downloadShard = (e: React.MouseEvent, shard: Shard) => {
    e.stopPropagation();
    const fileData = createGdvFile(
      shard.id,
      data.k,
      data.r,
      data.fileSize,
      data.originalHash,
      data.fileName,
      shard.data
    );
    const blob = new Blob([fileData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GenoDrive_S${shard.id}_${data.fileName}.gdv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-6">
        <div className="max-w-md mx-auto">
          <span className="text-[10px] font-orbitron text-cyan-400 uppercase tracking-[0.3em] mb-2 block">System Integrity Gauge</span>
          <h2 className={`text-4xl font-orbitron font-extrabold mb-4 transition-colors duration-500 ${isRecoverable ? 'text-white' : 'text-red-500'}`}>
            {aliveCount} / {data.shards.length} SHARDS ONLINE
          </h2>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div 
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${resiliencePct}%`, backgroundColor: barColor, boxShadow: `0 0 10px ${barColor}88` }}
            ></div>
          </div>
          <p className={`mt-4 text-xs font-orbitron tracking-widest transition-opacity duration-300 ${isRecoverable ? 'text-cyan-400' : 'text-red-400 animate-pulse'}`}>
            {isRecoverable ? '✅ STATUS: OPTIMAL' : '⚠️ STATUS: CRITICAL - DATA LOSS IMMINENT'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
            <h3 className="font-orbitron text-sm text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span className="text-xl">🔒</span> Secure Bio-Vault Grid
            </h3>
            <span className="text-[10px] text-white/40 uppercase tracking-widest italic">Click shard to toggle health • Click arrow to export</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {data.shards.map((shard) => (
            <div
              key={shard.id}
              onClick={() => toggleShard(shard.id)}
              className={`
                relative group aspect-[4/3] rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-500 border cursor-pointer
                ${shard.isAlive 
                  ? 'glass border-cyan-500/40 shadow-[0_0_20px_rgba(0,210,255,0.05)] hover:border-cyan-400 hover:scale-105' 
                  : 'bg-red-500/10 border-red-500/40 grayscale scale-95'}
              `}
            >
              <div className={`text-3xl mb-1 transition-transform duration-500 ${shard.isAlive ? 'scale-100' : 'scale-75'}`}>
                {shard.isAlive ? (shard.id < data.k ? '💎' : '🛡️') : '💀'}
              </div>
              
              <div className="text-center">
                  <span className={`text-[10px] font-orbitron uppercase tracking-tighter block ${shard.isAlive ? 'text-white' : 'text-red-400'}`}>
                    {shard.id < data.k ? 'Data' : 'Parity'} {shard.id}
                  </span>
                  <span className={`text-[8px] uppercase tracking-widest ${shard.isAlive ? 'text-cyan-400' : 'text-red-500/60'}`}>
                      {shard.isAlive ? 'ACTIVE' : 'OFFLINE'}
                  </span>
              </div>

              {shard.isAlive && (
                <button 
                  onClick={(e) => downloadShard(e, shard)}
                  title="Download individual shard"
                  className="absolute bottom-2 right-2 p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all z-20 group/dl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover/dl:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              )}
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity bg-black/60 backdrop-blur-[2px] pointer-events-none group-hover:pointer-events-auto">
                  <span className={`text-[10px] font-orbitron font-bold px-3 py-1.5 rounded-lg border ${shard.isAlive ? 'text-red-500 border-red-500 bg-red-500/10' : 'text-green-500 border-green-500 bg-green-500/10'}`}>
                      {shard.isAlive ? 'CORRUPT SHARD' : 'REPAIR SHARD'}
                  </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
            disabled={!isRecoverable}
            onClick={onNext}
            className={`
                px-16 py-6 rounded-2xl font-orbitron font-extrabold text-xl transition-all border-2
                ${isRecoverable 
                    ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_40px_rgba(0,210,255,0.5)] hover:scale-105 hover:brightness-110 active:scale-95' 
                    : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'}
            `}
        >
            ✨ INITIATE RESURRECTION
        </button>
      </div>
    </div>
  );
};

export default Vault;
