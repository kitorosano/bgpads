export const translations = {
  es: {
    appBrand: 'BGPads',
    appTitle: 'BGPads Remote',
    appSubtitle: 'Control remoto para BGPads Desktop',

    desktopIpPlaceholder: 'IP del escritorio',

    connect: 'Conectar',
    disconnect: 'Desconectar',
    disconnecting: 'Desconectando...',
    connectionStatus: 'Estado de la conexión',

    startMetronome: 'Iniciar metrónomo',
    stopMetronome: 'Detener metrónomo',
    bpm: 'BPM',

    playing: 'Reproduciendo',
    fading: 'Fundiendo',

    statusDisconnected: 'Desconectado',
    statusConnecting: 'Conectando',
    statusConnected: 'Conectado',
    statusReconnecting: 'Reconectando',
    statusDisconnecting: 'Desconectando'
  },
  en: {
    appBrand: 'BGPads',
    appTitle: 'BGPads Remote',
    appSubtitle: 'Remote control for BGPads Desktop',

    desktopIpPlaceholder: 'Desktop IP',

    connect: 'Connect',
    disconnect: 'Disconnect',
    disconnecting: 'Disconnecting...',
    connectionStatus: 'Connection status',

    startMetronome: 'Start metronome',
    stopMetronome: 'Stop metronome',
    bpm: 'BPM',

    playing: 'Playing',
    fading: 'Fading',

    statusDisconnected: 'Disconnected',
    statusConnecting: 'Connecting',
    statusConnected: 'Connected',
    statusReconnecting: 'Reconnecting',
    statusDisconnecting: 'Disconnecting'
  }
} as const;

export type TranslationKey = keyof typeof translations.en;
