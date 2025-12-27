
import React, { useState } from 'react';
import { WizardStep, GenoData, Shard } from './types';
import Header from './components/Header';
import Wizard from './components/Wizard';
import Laboratory from './components/Laboratory';
import Splicer from './components/Splicer';
import Vault from './components/Vault';
import Resurrection from './components/Resurrection';
import AIAssistant from './components/AIAssistant';
import { createCauchyMatrix, matrixMultiply, parseGdvFile, bioScramble } from './services/genetics';

const SYSTEM_MESSAGES = {
  [WizardStep.LABORATORY]: "Selamat datang, Komandan. Silakan unggah artefak digital Anda (Private Key, PDF, Foto) untuk memulai proses sintesis genetik.",
  [WizardStep.SPLICER]: "Sistem sedang memecah data biner menjadi urutan nukleotida. Ini seperti memecah kode brankas Anda menjadi fragmen biologis.",
  [WizardStep.VAULT]: "Shard digital kini aman di vault bio-decentralized. Simpan fragmen secara terpisah untuk keamanan maksimal.",
  [WizardStep.RESURRECTION]: "Memulai proses rekonstruksi molekuler. Masukkan Security PIN jika data tidak otomatis ter-descramble."
};

const App: React.FC = () => {
  const [step, setStep] = useState<WizardStep>(WizardStep.LABORATORY);
  const [genoData, setGenoData] = useState<GenoData | null>(null);
  const [systemMessage, setSystemMessage] = useState<string>(SYSTEM_MESSAGES[WizardStep.LABORATORY]);

  const handleFileUpload = async (file: File, seed: number) => {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    const k = 6;
    const r = 4;
    const n = k + r;

    const shardSize = Math.ceil(data.length / k);
    const paddedLength = shardSize * k;
    const paddedData = new Uint8Array(paddedLength);
    paddedData.set(data);

    const dataMatrix: Uint8Array[] = Array.from({ length: k }, (_, i) => {
        const slice = paddedData.slice(i * shardSize, (i + 1) * shardSize);
        return bioScramble(slice, seed);
    });

    const fullMatrix = createCauchyMatrix(n, k);
    const parityMatrix = fullMatrix.slice(k);
    const parityShardsRaw = matrixMultiply(parityMatrix, dataMatrix);

    const shards: Shard[] = [
        ...dataMatrix.map((d, i) => ({ id: i, data: d, type: 'data' as const, isAlive: true })),
        ...parityShardsRaw.map((d, i) => ({ id: k + i, data: d, type: 'parity' as const, isAlive: true }))
    ];

    setGenoData({
      fileName: file.name,
      fileSize: file.size,
      k,
      r,
      shards,
      originalHash: btoa(file.name).slice(0, 12).toUpperCase(),
      scrambleSeed: seed
    });

    setStep(WizardStep.SPLICER);
    setSystemMessage(SYSTEM_MESSAGES[WizardStep.SPLICER]);
  };

  const handleExternalUpload = async (files: File[]) => {
    try {
        const decodedShards = await Promise.all(
          files.map(async f => {
            const buffer = await f.arrayBuffer();
            return parseGdvFile(new Uint8Array(buffer));
          })
        );
        
        const meta = decodedShards[0];
        const totalN = meta.k + meta.r;
        const shardSize = meta.data.length;

        const shards: Shard[] = Array.from({ length: totalN }, (_, i) => {
            const found = decodedShards.find(d => d.id === i);
            return {
                id: i,
                data: found ? found.data : new Uint8Array(shardSize),
                type: i < meta.k ? 'data' : 'parity',
                isAlive: !!found
            };
        });

        setGenoData({
            fileName: meta.name || files[0].name.replace(/^GenoDrive_S\d+_/, ""),
            fileSize: meta.fileSize,
            k: meta.k,
            r: meta.r,
            shards,
            originalHash: meta.hash,
            scrambleSeed: 42 // Default, can be updated in Resurrection UI
        });

        setStep(WizardStep.VAULT);
        setSystemMessage("Distributed fragments detected. Vault grid re-aligned based on .gdv metadata headers.");
    } catch (e) {
        alert("Failed to parse .gdv fragments. Shards might be corrupted or incompatible.");
    }
  };

  const toggleShard = (id: number) => {
    if (!genoData) return;
    const newShards = genoData.shards.map(s => 
      s.id === id ? { ...s, isAlive: !s.isAlive } : s
    );
    setGenoData({ ...genoData, shards: newShards });
  };

  const goToVault = () => {
    setStep(WizardStep.VAULT);
    setSystemMessage(SYSTEM_MESSAGES[WizardStep.VAULT]);
  };

  const goToResurrection = () => {
    setStep(WizardStep.RESURRECTION);
    setSystemMessage(SYSTEM_MESSAGES[WizardStep.RESURRECTION]);
  };

  const handleStepChange = (newStep: WizardStep) => {
    // Only allow navigating to steps that have data or is the start
    if (newStep === WizardStep.LABORATORY || genoData) {
      setStep(newStep);
      setSystemMessage(SYSTEM_MESSAGES[newStep] || systemMessage);
    }
  };

  return (
    <div className="min-h-screen relative pb-20 overflow-x-hidden">
      <div className="dna-bg"></div>
      
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <Header />
        
        <Wizard currentStep={step} onStepClick={handleStepChange} />

        <main className="mt-8 transition-all duration-500 ease-in-out">
          {step === WizardStep.LABORATORY && (
            <Laboratory 
                onUpload={handleFileUpload} 
                onExternalUpload={handleExternalUpload} 
            />
          )}
          
          {step === WizardStep.SPLICER && genoData && (
            <Splicer 
                data={genoData} 
                onNext={goToVault} 
            />
          )}

          {step === WizardStep.VAULT && genoData && (
            <Vault 
                data={genoData} 
                toggleShard={toggleShard} 
                onNext={goToResurrection}
            />
          )}

          {step === WizardStep.RESURRECTION && genoData && (
            <Resurrection 
                data={genoData} 
                onReset={() => {
                    setStep(WizardStep.LABORATORY);
                    setGenoData(null);
                    setSystemMessage(SYSTEM_MESSAGES[WizardStep.LABORATORY]);
                }}
            />
          )}
        </main>
      </div>

      <AIAssistant message={systemMessage} />
    </div>
  );
};

export default App;
