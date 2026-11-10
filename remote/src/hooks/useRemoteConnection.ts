import {
  parseRemoteState,
  REMOTE_CONTROL_PORT,
  serializeRemoteCommand,
  type RemoteCommand,
  type RemoteState
} from '@bgpads/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONNECTION_TIMEOUT_MS,
  LAST_HOST_STORAGE_KEY,
  RECONNECT_BACKOFF_MULTIPLIER,
  RECONNECT_INITIAL_DELAY_MS,
  RECONNECT_MAX_DELAY_MS
} from '../constants';
import type { ConnectionStatus } from '../types';

export const useRemoteConnection = () => {
  const socketRef = useRef<WebSocket | null>(null);

  const hostRef = useRef<string | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const connectionTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [remoteState, setRemoteState] = useState<RemoteState | null>(null);
  const [lastHost, setLastHost] = useState<string>(() => {
    return localStorage.getItem(LAST_HOST_STORAGE_KEY) ?? '';
  });

  const getReconnectDelay = useCallback((): number => {
    const attempt = reconnectAttemptRef.current;

    const delay = Math.min(
      RECONNECT_INITIAL_DELAY_MS * RECONNECT_BACKOFF_MULTIPLIER ** attempt,
      RECONNECT_MAX_DELAY_MS
    );

    reconnectAttemptRef.current += 1;

    return delay;
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const clearConnectionTimeout = useCallback(() => {
    if (connectionTimeoutRef.current !== null) {
      window.clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  const closeCurrentSocket = useCallback(() => {
    clearConnectionTimeout();

    const socket = socketRef.current;
    socketRef.current = null;
    if (!socket) return;

    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;

    if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  }, [clearConnectionTimeout]);

  const openConnection = useCallback(
    (host: string, reconnecting = false) => {
      clearReconnectTimer();

      setStatus(reconnecting ? 'reconnecting' : 'connecting');

      const socket = new WebSocket(`ws://${host}:${REMOTE_CONTROL_PORT}`);
      socketRef.current = socket;

      connectionTimeoutRef.current = window.setTimeout(() => {
        if (socketRef.current !== socket) return;

        connectionTimeoutRef.current = null;

        if (socket.readyState === WebSocket.CONNECTING) {
          console.warn('[Remote] Connection timeout:', host);

          // Cerramos el intento. onclose gestionará la reconexión.
          socket.close();
        }
      }, CONNECTION_TIMEOUT_MS);

      socket.onopen = () => {
        if (socketRef.current !== socket) return;

        clearConnectionTimeout();

        reconnectAttemptRef.current = 0;

        localStorage.setItem(LAST_HOST_STORAGE_KEY, host);
        setLastHost(host);
        setStatus('connected');
      };

      socket.onmessage = (event) => {
        if (socketRef.current !== socket) return;

        if (typeof event.data !== 'string') {
          console.warn('[Remote] Unexpected message format');
          return;
        }

        const state = parseRemoteState(event.data);

        if (!state) {
          console.warn('[Remote] Invalid state received');
          return;
        }

        setRemoteState(state);
      };

      socket.onerror = () => {
        if (socketRef.current !== socket) return;

        // onclose handles reconnection.
      };

      socket.onclose = () => {
        if (socketRef.current !== socket) return;

        clearConnectionTimeout();
        socketRef.current = null;

        setStatus('reconnecting');

        const delay = getReconnectDelay();

        console.log(
          `[Remote] Reconnecting in ${delay}ms ` + `(attempt ${reconnectAttemptRef.current})`
        );

        reconnectTimerRef.current = window.setTimeout(() => {
          reconnectTimerRef.current = null;

          const currentHost = hostRef.current;
          if (!currentHost) return;

          openConnection(currentHost, true);
        }, delay);
      };
    },
    [clearReconnectTimer, clearConnectionTimeout]
  );

  const connect = useCallback(
    (host: string) => {
      const normalizedHost = host.trim();
      if (!normalizedHost) return;

      const currentSocket = socketRef.current;
      const isSameHost = hostRef.current === normalizedHost;

      const hasActiveConnection =
        currentSocket !== null &&
        (currentSocket.readyState === WebSocket.CONNECTING ||
          currentSocket.readyState === WebSocket.OPEN);

      // No reiniciar una conexión activa al mismo servidor.
      if (isSameHost && hasActiveConnection) return;

      clearReconnectTimer();
      closeCurrentSocket();

      reconnectAttemptRef.current = 0;

      hostRef.current = normalizedHost;

      setRemoteState(null);
      openConnection(normalizedHost);
    },
    [clearReconnectTimer, closeCurrentSocket, openConnection]
  );

  const disconnect = useCallback(() => {
    // Cancelamos cualquier reconexión programada.
    clearReconnectTimer();

    // Invalidamos el destino para impedir nuevas reconexiones.
    hostRef.current = null;

    // Cerramos la conexión sin esperar eventos posteriores.
    closeCurrentSocket();

    // Reiniciamos el contador de intentos de reconexión.
    reconnectAttemptRef.current = 0;

    // Actualizamos inmediatamente el estado de la interfaz.
    setRemoteState(null);
    setStatus('disconnected');
  }, [clearReconnectTimer, closeCurrentSocket]);

  const sendCommand = useCallback((command: RemoteCommand) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;

    socket.send(serializeRemoteCommand(command));
    return true;
  }, []);

  useEffect(() => {
    const pageHost = window.location.hostname;

    const isLocalHost = pageHost.endsWith('.local') || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(pageHost);
    if (!isLocalHost) return;

    connect(pageHost);
  }, [connect]);

  useEffect(() => {
    return () => {
      hostRef.current = null;
      reconnectAttemptRef.current = 0;
      clearReconnectTimer();
      closeCurrentSocket();
    };
  }, [clearReconnectTimer, closeCurrentSocket]);

  return {
    status,
    remoteState,
    lastHost,
    connect,
    disconnect,
    sendCommand
  };
};
