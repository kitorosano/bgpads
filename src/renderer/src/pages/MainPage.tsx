import { useEffect, useState } from 'react';
import { AudioButton } from '../components/AudioButton';
import { ContextMenu } from '../components/ContextMenu';
import { useAppConfig } from '../hooks/useAppConfig';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useTracks } from '../hooks/useTracks';
import { ContextMenuState } from '../types';

export const MainPage = () => {
  const { play, isPlaying, fadeOutDuration, setFadeOutDuration } = useAudioPlayer();
  const { tracks, setTracks, updateTrack, removeTrack, changeFile } = useTracks();
  const { theme, language, fadeOutDuration: configFadeOut, isLoaded } = useAppConfig();

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Sync fadeOutDuration from config to player
  useEffect(() => {
    setFadeOutDuration(configFadeOut);
  }, [configFadeOut, setFadeOutDuration]);

  // Load tracks on startup
  useEffect(() => {
    const init = async () => {
      const config = await window.api.loadConfig();
      if (config && config.tracks) {
        const validTracks = config.tracks.filter((t: any) => t.file && typeof t.file === 'string');
        const tracksWithVolume = validTracks.map((t: any) => ({ ...t, volume: t.volume ?? 1.5 }));
        setTracks(tracksWithVolume);
      }
    };
    init();

    // IPC Listeners
    const removeAddAudioListener = window.api.onMenuAddAudio(async () => {
      const filePaths = await window.api.openFileDialog();
      if (filePaths && filePaths.length > 0) {
        const newTracks: any[] = [];
        filePaths.forEach((path) => {
          // Extract filename from path
          const name = path.split(/[/\\]/).pop()?.replace('.mp3', '') || 'Unknown';
          newTracks.push({
            id: crypto.randomUUID(),
            file: path,
            name,
            keybinding: null,
            color: '#4a90e2',
            volume: 1.5
          });
        });
        setTracks((prev) => [...prev, ...newTracks]);
      }
    });

    return () => {
      removeAddAudioListener();
    };
  }, [setTracks]);

  // Save config on changes (only tracks, others handled by useAppConfig)
  useEffect(() => {
    if (!isLoaded) return;
    window.api.saveConfig({
      tracks,
      fadeOutDuration: configFadeOut,
      theme,
      language
    });
  }, [tracks, isLoaded, configFadeOut, theme, language]);

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

  const onRemoveTrack = (id: string) => {
    removeTrack(id);
    setContextMenu(null);
  };

  const onChangeFile = (id: string) => {
    changeFile(id);
    setContextMenu(null);
  };

  return (
    <div className="app-container">
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
          onUpdate={updateTrack}
          onRemove={() => onRemoveTrack(contextMenu.trackId)}
          onChangeFile={() => onChangeFile(contextMenu.trackId)}
        />
      )}
    </div>
  );
};
