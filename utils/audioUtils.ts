// @ts-ignore
import { Mp3Encoder } from 'lamejs';

/**
 * Decodes a Base64 string into a Uint8Array
 */
export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Creates a WAV file header and prepends it to raw PCM data.
 * Assumes 16-bit PCM, 24kHz, Mono (based on Gemini TTS specs).
 */
export const createWavBlob = (pcmData: Uint8Array, sampleRate: number = 24000): Blob => {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2; // 2 bytes per sample (16-bit)
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const header = new ArrayBuffer(headerSize);
  const view = new DataView(header);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true); // File size - 8
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true); // Subchunk2Size

  return new Blob([header, pcmData], { type: 'audio/wav' });
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

/**
 * Converts a WAV Blob to MP3 Blob using lamejs.
 */
export const convertWavToMp3 = async (wavBlob: Blob): Promise<Blob> => {
  const arrayBuffer = await wavBlob.arrayBuffer();
  const view = new DataView(arrayBuffer);

  // WAV Header Parsing (Simplistic, assuming standard canonical WAV from createWavBlob)
  // Offset 22: NumChannels (uint16)
  // Offset 24: SampleRate (uint32)
  // Offset 44: Start of PCM data (assuming standard 44 byte header)
  
  const channels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const pcmData = new Int16Array(arrayBuffer.slice(44));

  // Initialize Encoder: channels, samplerate, kbps
  const encoder = new Mp3Encoder(channels, sampleRate, 128);
  
  const mp3Data: Int8Array[] = [];
  
  // Encode
  // Note: encodeBuffer expects Int16Array. 
  // If stereo, it expects (left, right). Since we are mostly mono, we pass pcmData.
  // If stereo, we would need to split channels, but createWavBlob forces mono currently.
  
  const sampleBlockSize = 1152; 
  // We can encode all at once for small files, but typically it's done in chunks.
  // For browser simplicty with expected short TTS clips, passing the whole buffer is usually fine.
  
  const mp3buf = encoder.encodeBuffer(pcmData);
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }
  
  const endBuf = encoder.flush();
  if (endBuf.length > 0) {
    mp3Data.push(endBuf);
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
};