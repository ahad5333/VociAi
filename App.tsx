import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import AudioPlayer from './components/AudioPlayer';
import { VoiceName } from './types';
import { generateSpeech } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<VoiceName>(VoiceName.Kore);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = useCallback(async () => {
    if (!text.trim()) {
      setError("Please enter some text to convert.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null); // Clear previous audio while loading

    try {
      // Pass rate and pitch to the service
      const url = await generateSpeech(text, voice, speechRate, speechPitch);
      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  }, [text, voice, speechRate, speechPitch]);

  return (
    <div className="min-h-screen selection:bg-blue-200 selection:text-blue-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="card-main p-6 md:p-8">
          
          {error && (
            <div className="mb-6 error-box p-4 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Controls
            text={text}
            setText={setText}
            voice={voice}
            setVoice={setVoice}
            speechRate={speechRate}
            setSpeechRate={setSpeechRate}
            speechPitch={speechPitch}
            setSpeechPitch={setSpeechPitch}
            onConvert={handleConvert}
            isGenerating={isGenerating}
          />

          {audioUrl && (
            <AudioPlayer 
              src={audioUrl} 
              playbackRate={speechRate}
            />
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="footer-text">
  &copy; {new Date().getFullYear()} VoiceGenie. All rights reserved.
</p>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
