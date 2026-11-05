const MetronomeIcon = () => {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="playback-header__metronome-icon">
      <path
        d="M9 3h6l3 18H6L9 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 7v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M12 11l3-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M8 17h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export default MetronomeIcon;
