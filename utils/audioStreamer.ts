import { base64ToUint8Array } from './audioUtils';

export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private nextStartTime: number = 0;
  private sampleRate: number;
  private playbackRate: number = 1.0;

  constructor(sampleRate: number = 24000) {
    this.sampleRate = sampleRate;
  }

  /**
   * Sets the playback rate for incoming chunks.
   */
  setPlaybackRate(rate: number) {
    this.playbackRate = rate;
  }

  /**
   * Initializes the AudioContext. Must be called after a user interaction.
   */
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRate,
      });
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.nextStartTime = this.audioContext.currentTime;
  }

  /**
   * Decodes and schedules a chunk of audio to play.
   * @param base64Data Raw PCM audio data in base64 format.
   */
  async playChunk(base64Data: string) {
    if (!this.audioContext) {
      this.init();
    }
    if (!this.audioContext) return;

    const uint8Data = base64ToUint8Array(base64Data);
    
    // Convert Int16 PCM (Gemini Output) to Float32 (Web Audio API)
    const int16Data = new Int16Array(uint8Data.buffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      // Normalize to -1.0 to 1.0
      float32Data[i] = int16Data[i] / 32768.0;
    }

    const buffer = this.audioContext.createBuffer(1, float32Data.length, this.sampleRate);
    buffer.copyToChannel(float32Data, 0);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = this.playbackRate;
    source.connect(this.audioContext.destination);

    // Schedule playback
    // If nextStartTime is behind currentTime (lag), reset it to currentTime to play immediately
    const currentTime = this.audioContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    source.start(this.nextStartTime);
    
    // Advance the cursor by the duration of the chunk (adjusted for playback rate)
    this.nextStartTime += buffer.duration / this.playbackRate;
  }

  /**
   * Stops playback and closes the context.
   */
  stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.nextStartTime = 0;
  }
}