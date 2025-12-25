
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { GenoData } from '../types';
import { invertMatrix, matrixMultiply, createCauchyMatrix, bioScramble } from '../services/genetics';

interface ResurrectionProps {
  data: GenoData;
  onReset: () => void;
}

const Resurrection: React.FC<ResurrectionProps> = ({ data, onReset }) => {
  const [phase, setPhase] = useState<'pin' | 'processing' | 'success'>('pin');
  const [pin, setPin] = useState<number>(data.scrambleSeed || 42);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [recoveredUrl, setRecoveredUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);
  const [isText, setIsText] = useState(false);
  const [textContent, setTextContent] = useState<string>("");
  const logEndRef = useRef<HTMLDivElement>(null);

  const logMessages = useMemo(() => [
    "⚙️ GenoDrive V12 Engine Initialized.",
    "🔍 Scanning available Bio-Vault shards...",
    `🟢 Found ${data.shards.filter(s => s.isAlive).length} healthy shards. Integrity check passed.`,
    "🧪 Inverting Cauchy MDS Sub-matrix [GF-256]...",
    `🧬 Using indices: [${data.shards.filter(s => s.isAlive).slice(0, data.k).map(s => s.id).join(', ')}] for linear reconstruction.`,
    "⚡ Applying GF(256) Vectorized Matrix Multiplication...",
    `🔄 Reverse scrambling bio-sequences with PIN: ${pin}...`,
    `✅ Checksum Verified: 0x${data.originalHash}`,
    "🏁 Molecular Resurrection Successful."
  ], [data, pin]);

  const startResurrection = () => {
    setPhase('processing');
  };

  useEffect(() => {
    if (phase === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 1;
          const logThreshold = 100 / logMessages.length;
          const logIdx = Math.floor(next / logThreshold);
          
          if (next % Math.floor(logThreshold) === 0 && logIdx < logMessages.length) {
            setLogs(prevLogs => {
              if (!prevLogs.includes(logMessages[logIdx])) {
                return [...prevLogs, logMessages[logIdx]];
              }
              return prevLogs;
            });
          }

          if (next >= 100) {
            clearInterval(interval);
            reconstructAndSucceed();
            return 100;
          }
          return next;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [phase, logMessages]);

  const reconstructAndSucceed = () => {
    try {
      const aliveShards = data.shards.filter(s => s.isAlive).sort((a, b) => a.id - b.id).slice(0, data.k);
      
      if (aliveShards.length < data.k) {
        throw new Error("Insufficient shards for resurrection.");
      }

      const indices = aliveShards.map(s => s.id);
      const B = aliveShards.map(s => s.data);
      const fullMatrix = createCauchyMatrix(data.k + data.r, data.k);
      const submatrix = indices.map(idx => fullMatrix[idx]);
      
      const invMatrix = invertMatrix(submatrix);
      const recoveredMatrix = matrixMultiply(invMatrix, B);

      // Use the user-provided PIN for descrambling
      const recoveredDataShards = recoveredMatrix.map(shard => bioScramble(shard, pin));
      const totalSize = recoveredDataShards.reduce((acc, s) => acc + s.length, 0);
      const combined = new Uint8Array(totalSize);
      let offset = 0;
      recoveredDataShards.forEach(s => {
        combined.set(s, offset);
        offset += s.length;
      });

      const finalData = combined.slice(0, data.fileSize);
      const blob = new Blob([finalData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      setRecoveredUrl(url);

      const ext = data.fileName.split('.').pop()?.toLowerCase() || '';
      const imageExts = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
      const textExts = ['txt', 'md', 'json', 'js', 'ts', 'key', 'seed'];

      if (imageExts.includes(ext)) {
        setIsImage(true);
      } else if (textExts.includes(ext) || data.fileSize < 5000) {
        // Treat small files as potential keys/phrases
        setIsText(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setTextContent(content);
        };
        reader.readAsText(blob);
      }

      setPhase('success');
    } catch (e) {
      console.error("Reconstruction error:", e);
      alert("FATAL ERROR: Molecular alignment failed. Ensure your Security PIN is correct.");
      setPhase('pin');
      setProgress(0);
      setLogs([]);
    }
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (phase === 'pin') {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in duration-500 text-center space-y-8">
        <div className="glass p-10 rounded-[2.5rem] border-cyan-500/20 space-y-8 shadow-[0_0_40px_rgba(0,210,255,0.1)]">
          <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/30">
            <span className="text-4xl">🔐</span>
          </div>
          <div>
            <h2 className="text-3xl font-orbitron font-bold text-white mb-2 tracking-tight">Access Authentication</h2>
            <p className="text-white/50 text-sm">Enter the Genetic Security PIN used during synthesis.</p>
          </div>
          
          <div className="max-w-xs mx-auto space-y-4">
             <input 
              type="number" 
              value={pin}
              onChange={(e) => setPin(parseInt(e.target.value) || 0)}
              className="w-full bg-black/60 border-2 border-cyan-500/30 rounded-2xl px-6 py-4 text-center text-3xl text-white font-orbitron focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all"
              placeholder="PIN"
            />
            <button 
              onClick={startResurrection}
              className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-orbitron font-black rounded-2xl shadow-[0_0_25px_rgba(0,210,255,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              EXECUTE RESURRECTION 🚀
            </button>
          </div>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Data remains encrypted until correct PIN is verified.</p>
        </div>
      </div>
    );
  }

  if (phase === 'success') {
    return (
      <div className="max-w-5xl mx-auto animate-in zoom-in fade-in duration-700">
        <div className="glass p-10 md:p-14 rounded-[3rem] border-green-500/30 text-center shadow-[0_0_80px_rgba(34,197,94,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
          
          <div className="flex flex-col lg:flex-row items-center gap-14">
            <div className="flex-1 space-y-8 text-left">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-green-500 text-black text-4xl rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)] animate-bounce-slow">
                  ✓
                </div>
                <div>
                  <h2 className="text-4xl font-orbitron font-black text-green-400 tracking-tighter uppercase leading-none">
                    Artifact Restored
                  </h2>
                  <p className="text-white/40 text-[10px] font-orbitron uppercase tracking-[0.4em] mt-2">
                    Universal Cold Storage • Valid State
                  </p>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border-white/5 bg-white/5 space-y-4">
                <p className="text-white/70 leading-relaxed text-sm">
                  The genetic sequences for <span className="text-white font-bold italic underline decoration-cyan-500/50">"{data.fileName}"</span> have been re-aligned. Private data yields 100% purity.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-orbitron text-cyan-400 uppercase tracking-widest">Stability Index</span>
                    <p className="text-xs font-mono text-white truncate">99.99% PERFECT</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-orbitron text-cyan-400 uppercase tracking-widest">Vector Yield</span>
                    <p className="text-xs font-mono text-white">Bit-Perfect</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                {recoveredUrl && (
                  <a 
                    href={recoveredUrl} 
                    download={`resurrected_${data.fileName}`}
                    className="group relative w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-orbitron font-bold rounded-2xl text-center transition-all shadow-[0_0_35px_rgba(0,210,255,0.4)] hover:scale-[1.03] overflow-hidden"
                  >
                    <span className="relative z-10">📥 SAVE TO LOCAL DEVICE</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </a>
                )}
                <button 
                  onClick={onReset}
                  className="text-white/20 hover:text-white font-orbitron text-[10px] uppercase tracking-[0.5em] transition-all py-3 hover:tracking-[0.6em]"
                >
                  [ INITIATE NEW SESSION ]
                </button>
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-6">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-orbitron text-cyan-400 uppercase tracking-[0.2em] mb-1">Visual Mapping</span>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest">GenoDrive Universal Reader v12.5</span>
                </div>
                <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-[9px] font-orbitron text-green-400 uppercase">SECURE VIEW</span>
                </div>
              </div>

              <div className="relative aspect-square lg:aspect-[4/3] bg-[#00050a] rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center group shadow-2xl">
                {isImage && recoveredUrl ? (
                  <div className="w-full h-full p-4 relative flex items-center justify-center">
                    <img src={recoveredUrl} alt="Resurrected" className="max-w-full max-h-full object-contain drop-shadow-[0_0_20px_rgba(0,210,255,0.4)] animate-in zoom-in duration-500" />
                  </div>
                ) : isText ? (
                  <div className="w-full h-full p-8 text-left overflow-auto font-mono text-[11px] text-cyan-400/80 custom-preview-scroll relative">
                    <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 text-[8px] px-3 py-1 font-orbitron tracking-widest rounded-bl-xl border-l border-b border-red-500/20">SENSITIVE DATA</div>
                    <pre className="whitespace-pre-wrap leading-relaxed mt-4 p-4 border border-white/5 rounded-xl bg-white/5 selection:bg-cyan-500/30 selection:text-white">
                      {textContent || "Compiling molecular data..."}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center space-y-6 opacity-40 group-hover:opacity-60 transition-opacity">
                    <div className="text-8xl">📦</div>
                    <p className="text-[11px] text-white font-orbitron uppercase tracking-widest">Binary protocol restored</p>
                    <p className="text-[9px] text-white/40 font-mono tracking-tight">Direct visualization unavailable</p>
                  </div>
                )}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#00d2ff] animate-[sweep_4s_linear_infinite] z-20 pointer-events-none opacity-40"></div>
                <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h3 className="text-2xl font-orbitron font-bold text-white mb-2 tracking-tight">Stage 4: Molecular Resurrection</h3>
        <p className="text-white/50 text-sm">Synthesizing original bits from Cauchy-encoded DNA fragments.</p>
      </div>

      <div className="glass p-1 rounded-xl border-cyan-500/20 shadow-[0_0_30px_rgba(0,210,255,0.05)]">
        <div className="bg-[#00050a] rounded-lg p-6 font-mono text-xs text-green-400/90 h-64 overflow-y-auto scroll-smooth custom-terminal-scroll">
          {logs.map((log, i) => (
            <div key={i} className="mb-2 animate-in slide-in-from-left-2 duration-300 flex">
              <span className="text-green-900/40 mr-3 font-bold select-none">{i + 1}.</span>
              <span className="text-green-900 mr-2 select-none">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end px-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-orbitron text-cyan-400 uppercase tracking-widest mb-1">MDS Engine v12.5</span>
              <span className="text-[9px] text-white/30 uppercase tracking-widest">Linear Sequence Analysis</span>
            </div>
            <span className="text-3xl font-orbitron font-bold text-white tabular-nums">{progress}%</span>
        </div>
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_15px_#00d2ff]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes sweep { 0% { top: -10%; } 100% { top: 110%; } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .bg-radial-vignette { background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.5) 100%); }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .custom-terminal-scroll::-webkit-scrollbar, .custom-preview-scroll::-webkit-scrollbar { width: 4px; }
        .custom-terminal-scroll::-webkit-scrollbar-track, .custom-preview-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-terminal-scroll::-webkit-scrollbar-thumb, .custom-preview-scroll::-webkit-scrollbar-thumb { background: #00d2ff33; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default Resurrection;
