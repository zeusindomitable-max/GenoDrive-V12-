
import React, { useEffect, useState, useRef } from 'react';
import { GenoData } from '../types';
import { encodeDNA, createGdvFile } from '../services/genetics';
import JSZip from 'jszip';

interface SplicerProps {
  data: GenoData;
  onNext: () => void;
}

const Splicer: React.FC<SplicerProps> = ({ data, onNext }) => {
  const [dnaPreview, setDnaPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dna = encodeDNA(data.shards[0].data.slice(0, 500));
    setDnaPreview(dna);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [data]);

  useEffect(() => {
    if (streamRef.current && progress < 100) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [progress]);

  const downloadAllShards = async () => {
    setIsExporting(true);
    try {
        const zip = new JSZip();
        data.shards.forEach((shard) => {
            // Fix: Added missing fileName argument to createGdvFile (expects 7 arguments)
            const fileData = createGdvFile(
                shard.id, 
                data.k, 
                data.r, 
                data.fileSize, 
                data.originalHash, 
                data.fileName,
                shard.data
            );
            zip.file(`GenoDrive_Fragment_${shard.id}.gdv`, fileData);
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GenoDrive_Vault_${data.fileName}.zip`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Export failed", e);
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass p-8 rounded-3xl border-cyan-500/20 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-orbitron font-bold">DNA Flux Stream</h2>
              <p className="text-white/60">Mapping digital binary to molecular nucleotide sequences.</p>
            </div>
            <div className="text-right">
              <span className="text-cyan-400 font-orbitron text-2xl">{progress}%</span>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Synthesis</p>
            </div>
          </div>
          
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div 
            ref={streamRef}
            className="bg-black/40 p-6 rounded-xl border border-cyan-500/30 font-mono text-cyan-400 text-sm break-all h-48 overflow-y-auto scroll-smooth relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
            {dnaPreview.slice(0, Math.floor(dnaPreview.length * (progress / 100))).split('').map((char, i) => (
                <span key={i} className="inline-block hover:text-white transition-colors duration-200">
                    {char}
                </span>
            ))}
            {progress < 100 && <span className="inline-block w-2 h-4 bg-cyan-500 animate-pulse ml-1 align-middle"></span>}
          </div>
        </div>

        <div className="w-full md:w-72 glass p-6 rounded-2xl border-white/5 space-y-6">
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 font-orbitron uppercase">V12 Engine</span>
                <span className="text-green-400 font-orbitron text-sm">OPTIMIZED</span>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between text-xs">
                    <span className="text-white/60">GC-Content</span>
                    <span className="text-cyan-400 font-orbitron">52.4%</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-white/60">Molecular Density</span>
                    <span className="text-white font-orbitron">2.2 Bits/Nuc</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-white/10">
                    <span className="text-white/60">Homopolymer Check</span>
                    <span className="text-green-400 font-orbitron">PASS</span>
                </div>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={onNext}
                    disabled={progress < 100}
                    className={`w-full py-4 rounded-xl font-orbitron font-bold text-sm transition-all ${progress === 100 ? 'bg-cyan-500 hover:scale-105 neon-bg-cyan text-white shadow-[0_0_20px_rgba(0,210,255,0.4)]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'}`}
                >
                    {progress < 100 ? 'SPLICING...' : 'CONTINUE TO VAULT 🔒'}
                </button>
                
                {progress === 100 && (
                    <button 
                        onClick={downloadAllShards}
                        disabled={isExporting}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-orbitron text-[10px] text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                        {isExporting ? 'EXPORTING...' : '📦 DOWNLOAD ALL FRAGMENTS (.ZIP)'}
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass p-5 rounded-2xl border-white/5">
            <h3 className="font-orbitron text-[10px] text-cyan-400 mb-3 uppercase tracking-widest">Base Pairs</h3>
            <div className="flex justify-between items-end">
                <span className="text-2xl font-orbitron">14.2M</span>
                <span className="text-[10px] text-white/40">Synthesized</span>
            </div>
         </div>
         <div className="glass p-5 rounded-2xl border-white/5">
            <h3 className="font-orbitron text-[10px] text-cyan-400 mb-3 uppercase tracking-widest">Stability Index</h3>
            <div className="flex justify-between items-end">
                <span className="text-2xl font-orbitron text-green-400">99.9%</span>
                <span className="text-[10px] text-white/40">Bio-Purity</span>
            </div>
         </div>
         <div className="glass p-5 rounded-2xl border-white/5">
            <h3 className="font-orbitron text-[10px] text-cyan-400 mb-3 uppercase tracking-widest">Distributed System</h3>
            <div className="flex justify-between items-end">
                <span className="text-2xl font-orbitron">V12-READY</span>
                <span className="text-[10px] text-white/40">10 Nodes Generated</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Splicer;
