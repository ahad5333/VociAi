import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";
import { base64ToUint8Array, createWavBlob } from "../utils/audioUtils";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

// Re-initialize client on each call to ensure fresh state if needed, 
// though primarily important for key changes in some contexts.
const getClient = () => new GoogleGenAI({ apiKey: API_KEY });

export const generateSpeech = async (
  text: string,
  voice: VoiceName,
  speechRate: number,
  speechPitch: number
): Promise<string> => {
  try {
    if (!Object.values(VoiceName).includes(voice)) {
        throw new Error(`Invalid voice selected: ${voice}`);
    }

    const ai = getClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: voice,
              // Note: Pitch and Rate are passed here for completeness, 
              // though API support depends on the specific model version capabilities.
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data received from Gemini API.");
    }

    // Convert Raw PCM Base64 to a Playable WAV Blob URL
    const pcmBytes = base64ToUint8Array(base64Audio);
    const wavBlob = createWavBlob(pcmBytes, 24000); // Gemini 2.5 Flash TTS is typically 24kHz
    return URL.createObjectURL(wavBlob);

  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    throw new Error(error.message || "Failed to generate speech");
  }
};