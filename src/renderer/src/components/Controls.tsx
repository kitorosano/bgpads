interface ControlsProps {
  fadeOutDuration: number;
  setFadeOutDuration: (duration: number) => void;
  onAddFiles: (files: FileList) => void;
}

export const Controls = ({ fadeOutDuration, setFadeOutDuration, onAddFiles }: ControlsProps) => {
  return (
    <div className="controls-panel">
      <div className="control-group">
        <label>Fade Out: {fadeOutDuration.toFixed(1)}s</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={fadeOutDuration}
          onChange={(e) => setFadeOutDuration(parseFloat(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label className="file-upload-btn">
          Add Audio Files
          <input
            type="file"
            accept=".mp3"
            multiple
            onChange={(e) => e.target.files && onAddFiles(e.target.files)}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
};
