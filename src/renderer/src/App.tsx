import { useEffect, useRef, useState } from 'react';
import { AboutModal } from './components/AboutModal';
import { AudioButton } from './components/AudioButton';
import { ContextMenu } from './components/ContextMenu';
import { SettingsModal } from './components/SettingsModal';
import { AudioTrack, useAudioPlayer } from './hooks/useAudioPlayer';
import { Language } from './i18n';

function App(): React.JSX.Element {
  const { play, isPlaying, fadeOutDuration, setFadeOutDuration } = useAudioPlayer();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<Language>('es');
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    trackId: string;
    position: { x: number; y: number };
  } | null>(null);

  // Load config on startup
  useEffect(() => {
    const init = async () => {
      const config = await window.api.loadConfig();
      if (config) {
        if (config.tracks) {
          const validTracks = config.tracks.filter(
            (t: any) => t.file && typeof t.file === 'string'
          );
          const tracksWithVolume = validTracks.map((t: any) => ({ ...t, volume: t.volume ?? 1.5 }));
          setTracks(tracksWithVolume);
        }
        if (config.fadeOutDuration) setFadeOutDuration(config.fadeOutDuration);
        if (config.theme) setTheme(config.theme);
        if (config.language) setLanguage(config.language);
      }
      setIsLoaded(true);
    };
    init();

    // IPC Listeners
    const removeAddAudioListener = window.api.onMenuAddAudio(() => {
      fileInputRef.current?.click();
    });
    const removeSettingsListener = window.api.onMenuOpenSettings(() => {
      setShowSettings(true);
    });
    const removeAboutListener = window.api.onMenuOpenAbout(() => {
      setShowAbout(true);
    });

    return () => {
      removeAddAudioListener();
      removeSettingsListener();
      removeAboutListener();
    };
  }, [setFadeOutDuration]);

  // Apply theme
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Save config on changes
  useEffect(() => {
    if (!isLoaded) return;
    window.api.saveConfig({
      tracks,
      fadeOutDuration,
      theme,
      language
    });
  }, [tracks, fadeOutDuration, theme, language, isLoaded]);

  // Auto-resize window when tracks change
  useEffect(() => {
    if (!isLoaded || !window.electron?.ipcRenderer) return;

    const trackCount = tracks.length;
    if (trackCount === 0) return;

    // Calculate grid dimensions (120px buttons + 16px gap + 16px padding)
    const buttonSize = 120;
    const gap = 16;
    const padding = 32;

    // Estimate columns (max 6)
    const cols = Math.min(Math.ceil(Math.sqrt(trackCount)), 6);
    const rows = Math.ceil(trackCount / cols);

    const width = Math.min(cols * (buttonSize + gap) + padding, 900);
    const height = Math.min(rows * (buttonSize + gap) + padding + 40, 800); // +40 for menu bar

    window.electron.ipcRenderer.invoke('resize-window', { width, height });
  }, [tracks.length, isLoaded]);

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();
      const track = tracks.find((t) => t.keybinding === key);
      if (track) {
        play(track);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tracks, play]);

  const handleAddFiles = (files: FileList) => {
    const newTracks: AudioTrack[] = [];
    Array.from(files).forEach((file) => {
      const path = window.api.getPathForFile(file);
      if (path) {
        newTracks.push({
          id: crypto.randomUUID(),
          file: path,
          name: file.name.replace('.mp3', ''),
          keybinding: null,
          color: '#4a90e2',
          volume: 1.5
        });
      }
    });
    setTracks((prev) => [...prev, ...newTracks]);

    // Reset file input to allow re-selecting same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateTrack = (updatedTrack: AudioTrack) => {
    setTracks((prev) => prev.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)));
  };

  const handleRemoveTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setContextMenu(null);
  };

  const handleChangeFile = (trackId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp3';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const path = window.api.getPathForFile(file);
        if (path) {
          setTracks((prev) =>
            prev.map((t) =>
              t.id === trackId ? { ...t, file: path, name: file.name.replace('.mp3', '') } : t
            )
          );
        }
      }
    };
    input.click();
    setContextMenu(null);
  };

  return (
    <div className="app-container">
      <input
        type="file"
        ref={fileInputRef}
        accept=".mp3"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
      />

      <main className="grid-container">
        {tracks.map((track) => (
          <AudioButton
            key={track.id}
            track={track}
            isPlaying={isPlaying === track.id}
            onClick={() => play(track)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({
                trackId: track.id,
                position: { x: e.clientX, y: e.clientY }
              });
            }}
          />
        ))}
      </main>

      {contextMenu && (
        <ContextMenu
          track={tracks.find((t) => t.id === contextMenu.trackId)!}
          position={contextMenu.position}
          language={language}
          onClose={() => setContextMenu(null)}
          onUpdate={handleUpdateTrack}
          onRemove={() => handleRemoveTrack(contextMenu.trackId)}
          onChangeFile={() => handleChangeFile(contextMenu.trackId)}
        />
      )}

      {showSettings && (
        <SettingsModal
          fadeOutDuration={fadeOutDuration}
          setFadeOutDuration={setFadeOutDuration}
          theme={theme}
          setTheme={setTheme}
          language={language}
          setLanguage={setLanguage}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAbout && <AboutModal language={language} onClose={() => setShowAbout(false)} />}
    </div>
  );
}

export default App;
