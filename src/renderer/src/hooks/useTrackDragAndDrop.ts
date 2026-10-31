import { useCallback, useState } from 'react';

interface UseTrackDragAndDropOptions {
  reorderTracks: (sourceTrackId: string, targetTrackId: string) => void;
  moveTrackToEnd: (trackId: string) => void;
}

export const useTrackDragAndDrop = ({
  reorderTracks,
  moveTrackToEnd
}: UseTrackDragAndDropOptions) => {
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);
  const [dragOverTrackId, setDragOverTrackId] = useState<string | null>(null);

  const clearDragState = useCallback(() => {
    setDraggedTrackId(null);
    setDragOverTrackId(null);
  }, []);

  const handleDragStart = useCallback((trackId: string, event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', trackId);

    setDraggedTrackId(trackId);
  }, []);

  const handleDragEnter = useCallback(
    (trackId: string, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (draggedTrackId && draggedTrackId !== trackId) {
        setDragOverTrackId(trackId);
      }
    },
    [draggedTrackId]
  );

  const handleDragOver = useCallback(
    (trackId: string, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      if (draggedTrackId && draggedTrackId !== trackId && dragOverTrackId !== trackId) {
        setDragOverTrackId(trackId);
      }
    },
    [draggedTrackId, dragOverTrackId]
  );

  const handleDragLeave = useCallback((trackId: string) => {
    setDragOverTrackId((current) => (current === trackId ? null : current));
  }, []);

  const handleDrop = useCallback(
    (targetTrackId: string, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const sourceTrackId = draggedTrackId || event.dataTransfer.getData('text/plain');

      if (!sourceTrackId || sourceTrackId === targetTrackId) {
        clearDragState();
        return;
      }

      reorderTracks(sourceTrackId, targetTrackId);
      clearDragState();
    },
    [draggedTrackId, reorderTracks, clearDragState]
  );

  const handleDragOverGrid = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropInGrid = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();

      const sourceTrackId = draggedTrackId || event.dataTransfer.getData('text/plain');

      if (!sourceTrackId) {
        clearDragState();
        return;
      }

      if (dragOverTrackId) {
        return;
      }

      moveTrackToEnd(sourceTrackId);
      clearDragState();
    },
    [draggedTrackId, dragOverTrackId, moveTrackToEnd, clearDragState]
  );

  return {
    draggedTrackId,
    dragOverTrackId,
    handleDragEnd: clearDragState,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragOverGrid,
    handleDropInGrid
  };
};
