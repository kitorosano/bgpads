import { BPM_STEP_INCREMENT, MAX_BPM, MIN_BPM } from '@bgpads/shared';
import { clampBpm } from '@renderer/utils/validationUtils';
import { useEffect, useState } from 'react';

interface Props {
  value: number;
  placeholder?: string;
  onChange: (value: number) => void;
}

export const BpmInput = ({ value, placeholder, onChange }: Props) => {
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const commitChange = () => {
    if (localValue === '') return;
    const clamped = clampBpm(localValue);
    // Update local value to clamped version for visual feedback
    setLocalValue(clamped.toString());
    onChange(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="number"
      min={MIN_BPM}
      max={MAX_BPM}
      step={BPM_STEP_INCREMENT}
      inputMode="decimal"
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={commitChange}
      onKeyDown={handleKeyDown}
      className="context-menu-input"
    />
  );
};
