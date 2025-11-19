import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Download, Volume2, FileAudio, Loader2 } from 'lucide-react';
import { convertWavToMp3 } from '../utils/audioUtils';

interface AudioPlayerProps {
  src: string;
  playbackRate?: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, playbackRate = 1 }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // Export State
  const [exportFormat, setExportFormat] = useState<'wav' | 'mp3'>('wav');
  const [isExporting, setIsExporting] = useState(false);

  // Reset state when source changes, but maintain volume
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.load();
    }
  }, [src]);

  // Apply playback rate changes dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Apply volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleDownload = async () => {
    if (isExporting) return;
    
    try {
      setIsExporting(true);
      let downloadUrl = src;
      let filename = `gemini-speech-${Date.now()}.wav`;

      if (exportFormat === 'mp3') {
        // Fetch the WAV blob from the current object URL
        const response = await fetch(src);
        const wavBlob = await response.blob();
        
        // Convert to MP3
        const mp3Blob = await convertWavToMp3(wavBlob);
        downloadUrl = URL.createObjectURL(mp3Blob);
        filename = `gemini-speech-${Date.now()}.mp3`;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up if we created a new URL for MP3
      if (exportFormat === 'mp3') {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }

    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export audio.");
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate percentages for dynamic background filling
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <div className="mt-8 player-card p-6 animate-fade-in">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        className="hidden"
      />
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Volume2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            Generated Audio
          </h3>
          <div className="flex gap-2">
            {playbackRate !== 1 && (
              <span className="text-xs font-mono opacity-60 border px-2 py-1 rounded" style={{ borderColor: 'var(--border-color)' }}>
                {playbackRate}x Speed
              </span>
            )}
            <span className="text-xs font-mono opacity-60 border px-2 py-1 rounded" style={{ borderColor: 'var(--border-color)' }}>
              24kHz {exportFormat.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="player-btn-play w-12 h-12 flex items-center justify-center shadow-lg shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-1" />
            )}
          </button>

          {/* Timeline Slider */}
          <div className="flex-1 space-y-2 min-w-[100px]">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full cursor-pointer"
              style={{ backgroundSize: `${progressPercent}% 100%` }}
            />
            <div className="flex justify-between text-xs opacity-60 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 shrink-0 px-2 border-l" style={{ borderColor: 'var(--border-color)' }}>
             <Volume2 className="w-4 h-4 opacity-60" />
             <input
               type="range"
               min={0}
               max={1}
               step={0.05}
               value={volume}
               onChange={handleVolumeChange}
               className="w-20 cursor-pointer"
               style={{ backgroundSize: `${volumePercent}% 100%` }}
               title={`Volume: ${Math.round(volume * 100)}%`}
             />
          </div>

          {/* Export Controls */}
          <div className="flex items-center gap-1 shrink-0 bg-white/50 rounded-lg border border-[var(--border-color)] p-1">
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'wav' | 'mp3')}
              className="text-xs bg-transparent border-none outline-none font-mono px-1 cursor-pointer"
              disabled={isExporting}
            >
              <option value="wav">WAV</option>
              <option value="mp3">MP3</option>
            </select>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/80 rounded-md transition-colors text-[var(--color-primary)]"
              title={`Download as ${exportFormat.toUpperCase()}`}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;