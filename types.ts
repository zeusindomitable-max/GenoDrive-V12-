
export enum WizardStep {
  LABORATORY = 'LABORATORY',
  SPLICER = 'SPLICER',
  VAULT = 'VAULT',
  RESURRECTION = 'RESURRECTION'
}

export interface Shard {
  id: number;
  data: Uint8Array;
  type: 'data' | 'parity';
  isAlive: boolean;
}

export interface GenoData {
  fileName: string;
  fileSize: number;
  k: number;
  r: number;
  shards: Shard[];
  originalHash: string;
  scrambleSeed: number;
}
