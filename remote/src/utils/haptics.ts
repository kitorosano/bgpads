import { PAD_HAPTIC_FEEDBACK_DURATION_MS } from '../constants';

export function triggerHapticFeedback(): void {
  if (typeof navigator.vibrate !== 'function') return;

  navigator.vibrate(PAD_HAPTIC_FEEDBACK_DURATION_MS);
}
