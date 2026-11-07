import { useEffect, useState } from 'react';
import { DEFAULT_METRONOME_TIME_SIGNATURES } from '../../../constants';

export const CustomTimeSignatureInput = ({
  value,
  onChange
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [beats, beatValue] = value.split('/');
  const [localNum, setLocalNum] = useState(beats || '4');
  const [localDen, setLocalDen] = useState(beatValue || '4');

  useEffect(() => {
    const parts = value.split('/');
    if (parts.length === 2 && !DEFAULT_METRONOME_TIME_SIGNATURES.includes(value)) {
      setLocalNum(parts[0]);
      setLocalDen(parts[1]);
    }
  }, [value]);

  const commitChange = () => {
    let n = parseInt(localNum);
    let d = parseInt(localDen);
    if (isNaN(n) || n < 1) n = 4;
    if (isNaN(d) || d < 1) d = 4;
    setLocalNum(n.toString());
    setLocalDen(d.toString());
    // Only update if it's considered valid
    onChange(`${n}/${d}`);
  };

  const forceActive = !DEFAULT_METRONOME_TIME_SIGNATURES.includes(value);

  return (
    <div className={`custom-time-sig ${forceActive ? 'active' : ''}`}>
      <input
        type="number"
        value={localNum}
        onChange={(e) => setLocalNum(e.target.value)}
        onBlur={commitChange}
        className="time-sig-input num"
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
      <span className="time-sig-slash">/</span>
      <input
        type="number"
        value={localDen}
        onChange={(e) => setLocalDen(e.target.value)}
        onBlur={commitChange}
        className="time-sig-input den"
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
    </div>
  );
};
