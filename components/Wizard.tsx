
import React from 'react';
import { WizardStep } from '../types';

interface WizardProps {
  currentStep: WizardStep;
}

const steps = [
  { id: WizardStep.LABORATORY, label: 'Laboratory', icon: '🧪' },
  { id: WizardStep.SPLICER, label: 'Splicer', icon: '🧬' },
  { id: WizardStep.VAULT, label: 'Vault', icon: '🔐' },
  { id: WizardStep.RESURRECTION, label: 'Resurrection', icon: '✨' },
];

const Wizard: React.FC<WizardProps> = ({ currentStep }) => {
  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex justify-between items-center relative max-w-2xl mx-auto mb-12">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0"></div>
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-cyan-500 -translate-y-1/2 z-0 transition-all duration-700"
        style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
      ></div>

      {steps.map((step, idx) => {
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
              ${isCurrent ? 'bg-cyan-500 scale-125 shadow-[0_0_20px_rgba(0,210,255,0.6)]' : isActive ? 'bg-cyan-900 border border-cyan-500' : 'bg-[#1a1a3a] border border-white/10'}
            `}>
              <span className="text-lg">{step.icon}</span>
            </div>
            <span className={`mt-3 text-[10px] font-orbitron uppercase tracking-widest ${isActive ? 'text-cyan-400' : 'text-white/30'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Wizard;
