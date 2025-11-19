export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface VoiceMetadata {
  id: VoiceName;
  name: string;
  gender: 'Male' | 'Female';
  description: string;
}

export const VOICE_OPTIONS: VoiceMetadata[] = [
  { id: VoiceName.Kore, name: 'Kore', gender: 'Female', description: 'Calm & Soothing' },
  { id: VoiceName.Puck, name: 'Puck', gender: 'Male', description: 'Soft & Gentle' },
  { id: VoiceName.Charon, name: 'Charon', gender: 'Male', description: 'Deep & Authoritative' },
  { id: VoiceName.Fenrir, name: 'Fenrir', gender: 'Male', description: 'Intense & Resonant' },
  { id: VoiceName.Zephyr, name: 'Zephyr', gender: 'Female', description: 'Bright & Airy' },
];

export interface AudioState {
  isGenerating: boolean;
  audioUrl: string | null;
  error: string | null;
}

export interface TTSRequest {
  text: string;
  voice: VoiceName;
  speechRate: number;
  speechPitch: number;
}