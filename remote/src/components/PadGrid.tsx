import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { RemoteCommand, RemoteTrack } from '../types';
import { triggerHapticFeedback } from '../utils/haptics';
import { FadeOutProgress } from './FadeOutProgress';
import './PadGrid.css';
import { DragHandleIcon } from './icons/DragHandle';

interface Props {
  isEditMode: boolean;
  disabled: boolean;
  tracks: RemoteTrack[];
  playingTrackId: string | null;
  playbackProgress: number;
  currentTime: number;
  duration: number;
  fadingOutTrackId: string | null;
  fadeOutDuration: number;
  fadeOutStartedAt: number | null;
  sendCommand: (command: RemoteCommand) => boolean;
  onSelectTrack: (trackId: string) => void;
}

export function PadGrid({
  isEditMode,
  disabled,
  tracks,
  playingTrackId,
  playbackProgress,
  currentTime,
  duration,
  fadingOutTrackId,
  fadeOutDuration,
  fadeOutStartedAt,
  sendCommand,
  onSelectTrack
}: Props) {
  const { t } = useI18n();

  const dragRef = useRef<{
    pointerId: number;
    sourceTrackId: string;
  } | null>(null);
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);
  const [targetTrackId, setTargetTrackId] = useState<string | null>(null);

  const handleOnClick = (trackId: string) => {
    if (isEditMode) {
      onSelectTrack(trackId);
      return;
    }

    const sent = sendCommand({ type: 'track.play', trackId });
    if (sent) triggerHapticFeedback();
  };

  const handleDragStart = (event: PointerEvent<HTMLSpanElement>, trackId: string) => {
    if (!isEditMode || disabled) return;

    event.preventDefault();
    event.stopPropagation();

    dragRef.current = {
      pointerId: event.pointerId,
      sourceTrackId: trackId
    };

    event.currentTarget.setPointerCapture(event.pointerId);

    setDraggedTrackId(trackId);
    setTargetTrackId(null);
  };

  const handleDragMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;

    const element = document.elementFromPoint(event.clientX, event.clientY);

    const pad = element?.closest<HTMLElement>('[data-track-id]');
    const nextTargetId = pad?.dataset.trackId ?? null;

    setTargetTrackId(nextTargetId === dragRef.current?.sourceTrackId ? null : nextTargetId);
  };

  const handleDragEnd = (event: PointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const element = document.elementFromPoint(event.clientX, event.clientY);

    const pad = element?.closest<HTMLElement>('[data-track-id]');
    const destinationId = pad?.dataset.trackId;

    if (destinationId && destinationId !== drag.sourceTrackId) {
      sendCommand({
        type: 'track.reorder',
        sourceTrackId: drag.sourceTrackId,
        targetTrackId: destinationId
      });
    }

    dragRef.current = null;
    setDraggedTrackId(null);
    setTargetTrackId(null);
  };

  const handleDragCancel = () => {
    dragRef.current = null;
    setDraggedTrackId(null);
    setTargetTrackId(null);
  };

  const trackCount = tracks.length;
  const gridSize =
    trackCount <= 2 ? 'small' : trackCount <= 6 ? 'medium' : trackCount <= 12 ? 'large' : 'dense';
  const columns = trackCount <= 2 ? 1 : trackCount <= 6 ? 2 : trackCount <= 12 ? 3 : 4;
  const landscapeColumns = trackCount <= 2 ? 2 : trackCount <= 6 ? 3 : trackCount <= 12 ? 4 : 6;
  const rows = Math.ceil(trackCount / columns);
  const landscapeRows = Math.ceil(trackCount / landscapeColumns);

  const formatRemainingTime = (currentTime: number, duration: number): string => {
    const remaining = Math.max(0, Math.ceil(duration - currentTime));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return `−${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <section
      className={`pad-grid pad-grid--${gridSize}`}
      data-track-count={trackCount}
      style={
        {
          '--grid-columns': columns,
          '--grid-landscape-columns': landscapeColumns,
          '--grid-rows': rows,
          '--grid-landscape-rows': landscapeRows
        } as CSSProperties
      }
    >
      {tracks.map((track) => {
        const isPlaying = track.id === playingTrackId;
        const isFading = track.id === fadingOutTrackId;

        return (
          <button
            key={track.id}
            type="button"
            className={`pad 
              ${isPlaying ? 'pad--playing' : isFading ? 'pad--fading' : ''} 
              ${isEditMode ? 'pad--editing' : ''} 
              ${draggedTrackId === track.id ? 'pad--dragging' : ''}
              ${targetTrackId === track.id ? 'pad--drop-target' : ''}
          `}
            style={{ '--pad-color': track.color } as CSSProperties}
            disabled={disabled}
            onClick={() => handleOnClick(track.id)}
            data-track-id={track.id}
          >
            {isEditMode && (
              <span
                className="pad__drag-handle"
                role="button"
                tabIndex={0}
                aria-label={`Mover ${track.name}`}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => handleDragStart(event, track.id)}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragCancel}
              >
                <DragHandleIcon />
              </span>
            )}
            <strong className="pad__name">{track.name}</strong>

            {isFading && <span className="pad__state">{t('fading')}</span>}
            {isFading && fadeOutStartedAt !== null && (
              <FadeOutProgress
                key={fadeOutStartedAt}
                startedAt={fadeOutStartedAt}
                duration={fadeOutDuration}
              />
            )}

            {isPlaying && duration > 0 && (
              <span className="pad__remaining-time">
                {formatRemainingTime(currentTime, duration)}
              </span>
            )}
            {isPlaying && (
              <span className="pad-grid__progress" aria-hidden="true">
                <span
                  className="pad-grid__progress-fill"
                  style={{
                    width: `${Math.min(Math.max(playbackProgress, 0), 1) * 100}%`
                  }}
                />
              </span>
            )}
          </button>
        );
      })}
    </section>
  );
}
