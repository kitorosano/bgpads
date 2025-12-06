import { useEffect, useRef, useState } from 'react';
import { TRACK_INITIAL_VOLUME } from '../../../constants';
import { AudioButton } from '../components/AudioButton';
import { ContextMenu } from '../components/ContextMenu';
import { useAppConfig } from '../hooks/useAppConfig';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useTracks } from '../hooks/useTracks';
import { AudioTrack, ContextMenuState } from '../types';

export const MainPage = () => {
  const { play, isPlaying, preload, setFadeOutDuration } = useAudioPlayer();
  const { tracks, setTracks, updateTrack, removeTrack, changeFile } = useTracks();
  const {
    fadeOutDuration: configFadeOut,
    isLoaded,
    tracks: configTracks,
    updateConfig
  } = useAppConfig();

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isPreloading, setIsPreloading] = useState(true);
  const initializedRef = useRef(false);

  // Sync fadeOutDuration from config to player
  useEffect(() => {
    setFadeOutDuration(configFadeOut);
  }, [configFadeOut, setFadeOutDuration]);

  // Load tracks from config and preload
  useEffect(() => {
    if (!isLoaded || initializedRef.current) return;

    const init = async () => {
      if (configTracks) {
        const validTracks = configTracks.filter((t: any) => t.file && typeof t.file === 'string');
        const tracksWithVolume = validTracks.map((t: any) => ({
          ...t,
          volume: t.volume ?? TRACK_INITIAL_VOLUME
        }));

        await Promise.all(tracksWithVolume.map((track: AudioTrack) => preload(track)));
        setTracks(tracksWithVolume);
      }
      setIsPreloading(false);
      initializedRef.current = true;
    };
    init();
  }, [isLoaded, configTracks, preload, setTracks]);

  // IPC Listeners for adding audio
  useEffect(() => {
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
    if (!isLoaded || isPreloading) return;
    updateConfig({
      tracks
    });
  }, [tracks, isLoaded, isPreloading, updateConfig]);

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

  if (!isLoaded || isPreloading) {
    return (
      <div
        className="app-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'var(--text-color)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>Cargando configuración y pistas...</h2>
          <div
            className="spinner"
            style={{
              margin: '20px auto',
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              borderTop: '4px solid var(--primary-color)',
              animation: 'spin 1s linear infinite'
            }}
          ></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

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
          onClose={() => setContextMenu(null)}
          onUpdate={updateTrack}
          onRemove={() => onRemoveTrack(contextMenu.trackId)}
          onChangeFile={() => onChangeFile(contextMenu.trackId)}
        />
      )}
    </div>
  );
};
