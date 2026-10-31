import { useEffect, useState } from 'react';
import { TonalPadSelector } from './TonalPadSelector';

interface AddPadFabProps {
  onAddFiles: () => void | Promise<void>;
}

type AddPadFabView = 'closed' | 'menu' | 'tonal';

export const AddPadFab = ({ onAddFiles }: AddPadFabProps) => {
  const [view, setView] = useState<AddPadFabView>('closed');

  const isOpen = view !== 'closed';

  const handleAddFiles = async () => {
    await onAddFiles();
    setView('closed');
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setView('closed');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="add-pad-fab">
      {view === 'menu' && (
        <div className="add-pad-fab-panel">
          <button type="button" onClick={() => setView('tonal')}>
            Tonal pad
          </button>

          <button type="button" onClick={() => void handleAddFiles()}>
            Audio file
          </button>
        </div>
      )}

      {view === 'tonal' && (
        <div className="add-pad-fab-panel">
          <TonalPadSelector onPadAdded={() => setView('closed')} />
        </div>
      )}

      <button
        type="button"
        className="add-pad-fab-button"
        aria-label={isOpen ? 'Close add pad menu' : 'Add pad'}
        onClick={() => setView((current) => (current === 'closed' ? 'menu' : 'closed'))}
      >
        {isOpen ? '×' : '+'}
      </button>
    </div>
  );
};
