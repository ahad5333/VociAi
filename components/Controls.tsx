import React from 'react';
import { VoiceName, VOICE_OPTIONS } from '../types';
import { Wand2, Loader2, Gauge, MoveVertical, User } from 'lucide-react';

interface ControlsProps {
  text: string;
  setText: (text: string) => void;
  voice: VoiceName;
  setVoice: (voice: VoiceName) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  speechPitch: number;
  setSpeechPitch: (pitch: number) => void;
  onConvert: () => void;
  isGenerating: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  text,
  setText,
  voice,
  setVoice,
  speechRate,
  setSpeechRate,
  speechPitch,
  setSpeechPitch,
  onConvert,
  isGenerating,
}) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Helper to calculate background gradient percentage for sliders
  const getBackgroundSize = (value: number, min: number, max: number) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `${percentage}% 100%`;
  };

  return (
    <div className="space-y-6">
      {/* Voice Radio Group */}
      <div 
        className="space-y-3" 
        role="radiogroup" 
        aria-labelledby="voice-selection-label"
      >
        <label 
          id="voice-selection-label" 
          className="input-label flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Select Voice Profile
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {VOICE_OPTIONS.map((option) => {
            const isSelected = voice === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setVoice(option.id)}
                disabled={isGenerating}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${option.name}, ${option.gender} voice, ${option.description}`}
                className={`
                  relative flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-200
                  ${isSelected 
                    ? 'border-[var(--color-primary)] bg-white shadow-md ring-1 ring-[var(--color-primary)]' 
                    : 'border-[var(--border-color)] bg-white/50 hover:bg-white hover:border-gray-300'
                  }
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`font-semibold text-sm ${isSelected ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>
                    {option.name}
                  </span>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                  )}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1">
                  {option.gender}
                </span>
                <span className="text-xs opacity-70 leading-tight">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rate Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="rate-slider" className="input-label flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" /> Speed
            </label>
            <span className="text-xs font-mono opacity-70 bg-white/50 px-1.5 rounded border border-gray-200">
              {speechRate}x
            </span>
          </div>
          <input
            id="rate-slider"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full cursor-pointer"
            disabled={isGenerating}
            style={{ backgroundSize: getBackgroundSize(speechRate, 0.5, 2.0) }}
            aria-valuemin={0.5}
            aria-valuemax={2.0}
            aria-valuenow={speechRate}
            aria-valuetext={`${speechRate} times speed`}
            aria-label="Adjust speech playback speed"
          />
        </div>

        {/* Pitch Slider */}
        <div className="space-y-2">
           <div className="flex justify-between items-center">
            <label htmlFor="pitch-slider" className="input-label flex items-center gap-1.5">
              <MoveVertical className="w-3.5 h-3.5" /> Pitch
            </label>
            <span className="text-xs font-mono opacity-70 bg-white/50 px-1.5 rounded border border-gray-200">
              {speechPitch > 0 ? `+${speechPitch}` : speechPitch}
            </span>
          </div>
          <input
            id="pitch-slider"
            type="range"
            min="-10"
            max="10"
            step="1"
            value={speechPitch}
            onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
            className="w-full cursor-pointer"
            disabled={isGenerating}
            style={{ backgroundSize: getBackgroundSize(speechPitch, -10, 10) }}
            title="Pitch adjustment (Experimental)"
            aria-valuemin={-10}
            aria-valuemax={10}
            aria-valuenow={speechPitch}
            aria-valuetext={`Pitch level ${speechPitch}`}
            aria-label="Adjust speech pitch"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="text-input" className="input-label">
          Text to Convert
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={handleTextChange}
          placeholder="Enter your text here..."
          className="input-field w-full h-48 text-base block resize-none leading-relaxed"
          disabled={isGenerating}
          aria-label="Text content to convert to speech"
          aria-required="true"
        />
        <div className="flex justify-between text-xs opacity-60 px-1" aria-live="polite">
          <span>{text.length} characters</span>
          <span>Markdown supported</span>
        </div>
      </div>

      <button
        onClick={onConvert}
        disabled={isGenerating || !text.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm shadow-lg"
        aria-busy={isGenerating}
        aria-disabled={isGenerating || !text.trim()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Generating Audio...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" aria-hidden="true" />
            Convert to Speech
          </>
        )}
      </button>
    </div>
  );
};

export default Controls;