
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * GenoDrive V12 Core Genetics Engine
 * Implements GF(256) arithmetic and Cauchy MDS Matrix for DNA Data Storage
 */

// Precompute Log/Exp tables for GF(256)
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

(function initGF() {
  let x = 1;
  const poly = 0x11d; // 285
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= poly;
  }
  for (let i = 255; i < 512; i++) {
    EXP[i] = EXP[i - 255];
  }
})();

export const gfMul = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
};

export const gfDiv = (a: number, b: number): number => {
  if (a === 0) return 0;
  if (b === 0) return 0;
  return EXP[(255 + LOG[a] - LOG[b]) % 255];
};

export const createCauchyMatrix = (n: number, k: number): Uint8Array[] => {
  const matrix = Array.from({ length: n }, () => new Uint8Array(k));
  const X = Array.from({ length: n - k }, (_, i) => i + k + 1);
  const Y = Array.from({ length: k }, (_, i) => i + 1);

  // Identity part
  for (let i = 0; i < k; i++) {
    matrix[i][i] = 1;
  }

  // Cauchy part
  for (let i = 0; i < n - k; i++) {
    for (let j = 0; j < k; j++) {
      matrix[i + k][j] = gfDiv(1, X[i] ^ Y[j]);
    }
  }
  return matrix;
};

export const encodeDNA = (data: Uint8Array): string => {
  const map: { [key: number]: string } = { 0: 'A', 1: 'C', 2: 'G', 3: 'T' };
  let dna = "";
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    dna += map[(byte >> 6) & 0x03];
    dna += map[(byte >> 4) & 0x03];
    dna += map[(byte >> 2) & 0x03];
    dna += map[byte & 0x03];
  }
  return dna;
};

export const bioScramble = (data: Uint8Array, seed: number = 42): Uint8Array => {
  const result = new Uint8Array(data.length);
  let state = seed;
  for (let i = 0; i < data.length; i++) {
    state = (state * 1664525 + 1013904223) >>> 0;
    result[i] = data[i] ^ (state & 0xFF);
  }
  return result;
};

export const invertMatrix = (matrix: Uint8Array[]): Uint8Array[] => {
  const n = matrix.length;
  const k = matrix[0].length;
  if (n !== k) throw new Error("Matrix must be square to invert");

  const a = matrix.map(row => new Uint8Array(row));
  const inverse = Array.from({ length: n }, (_, i) => {
    const row = new Uint8Array(n);
    row[i] = 1;
    return row;
  });

  for (let i = 0; i < n; i++) {
    let pivot = a[i][i];
    if (pivot === 0) {
      for (let j = i + 1; j < n; j++) {
        if (a[j][i] !== 0) {
          [a[i], a[j]] = [a[j], a[i]];
          [inverse[i], inverse[j]] = [inverse[j], inverse[i]];
          break;
        }
      }
      pivot = a[i][i];
    }
    if (pivot === 0) throw new Error("Matrix is singular");

    const invPivot = gfDiv(1, pivot);
    for (let j = 0; j < n; j++) {
      a[i][j] = gfMul(a[i][j], invPivot);
      inverse[i][j] = gfMul(inverse[i][j], invPivot);
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = a[k][i];
        if (factor !== 0) {
          for (let j = 0; j < n; j++) {
            a[k][j] ^= gfMul(factor, a[i][j]);
            inverse[k][j] ^= gfMul(factor, inverse[i][j]);
          }
        }
      }
    }
  }
  return inverse;
};

export const matrixMultiply = (A: Uint8Array[], B: Uint8Array[]): Uint8Array[] => {
  const m = A.length;
  const k = A[0].length;
  const n = B[0].length;
  const C = Array.from({ length: m }, () => new Uint8Array(n));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let l = 0; l < k; l++) {
        sum ^= gfMul(A[i][l], B[l][j]);
      }
      C[i][j] = sum;
    }
  }
  return C;
};

/**
 * .gdv Header Structure:
 * [ID: 1B][K: 1B][R: 1B][FileSize: 4B][Hash: 12B][NameLen: 1B][Name: Variable]
 */
export const createGdvFile = (id: number, k: number, r: number, fileSize: number, hash: string, name: string, shardData: Uint8Array): Uint8Array => {
  const nameBytes = new TextEncoder().encode(name);
  const header = new Uint8Array(20 + nameBytes.length);
  header[0] = id;
  header[1] = k;
  header[2] = r;
  header[3] = (fileSize >> 24) & 0xFF;
  header[4] = (fileSize >> 16) & 0xFF;
  header[5] = (fileSize >> 8) & 0xFF;
  header[6] = fileSize & 0xFF;
  const hashBytes = new TextEncoder().encode(hash.slice(0, 12).padEnd(12, ' '));
  header.set(hashBytes, 7);
  header[19] = nameBytes.length;
  header.set(nameBytes, 20);

  const file = new Uint8Array(header.length + shardData.length);
  file.set(header, 0);
  file.set(shardData, header.length);
  return file;
};

export interface DecodedGdv {
  id: number;
  k: number;
  r: number;
  fileSize: number;
  hash: string;
  name: string;
  data: Uint8Array;
}

export const parseGdvFile = (buffer: Uint8Array): DecodedGdv => {
  if (buffer.length < 20) throw new Error("Invalid .gdv file");
  const id = buffer[0];
  const k = buffer[1];
  const r = buffer[2];
  const fileSize = (buffer[3] << 24) | (buffer[4] << 16) | (buffer[5] << 8) | buffer[6];
  const hash = new TextDecoder().decode(buffer.slice(7, 19)).trim();
  const nameLen = buffer[19];
  const name = new TextDecoder().decode(buffer.slice(20, 20 + nameLen));
  const data = buffer.slice(20 + nameLen);
  return { id, k, r, fileSize, hash, name, data };
};

/**
 * AUDIO ENGINE UTILITIES
 */

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Fixed the truncated speakMessage function and completed the implementation
export const speakMessage = async (text: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this with a calm, high-tech robot assistant voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Use AudioContext with fallback for webkit
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const outputAudioContext = new AudioContextClass({ sampleRate: 24000 });
      
      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        outputAudioContext,
        24000,
        1,
      );
      
      const source = outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};
