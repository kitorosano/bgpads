import { useEffect, useState } from 'react';

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export const useAudioDevices = () => {
  const [devices, setDevices] = useState<AudioDevice[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission if needed? Usually for enumeration it's fine if we don't need labels,
        // but for labels we often need getUserMedia permissions. Electron usually grants this.
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = allDevices
          .filter((device) => device.kind === 'audiooutput')
          .map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `Speaker (${device.deviceId.slice(0, 5)}...)`
          }));
        setDevices(audioOutputs);
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
      }
    };

    getDevices();

    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, []);

  return devices;
};
