import type { RemoteCommand, RemoteState } from '@bgpads/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LAST_HOST_STORAGE_KEY, RECONNECT_DELAY_MS, REMOTE_CONTROL_PORT } from '../constants';
import type { ConnectionStatus } from '../types';

export const useRemoteConnection = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const manualDisconnectRef = useRef(false);

  const hostRef = useRef<string | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [remoteState, setRemoteState] = useState<RemoteState | null>(null);
  const [lastHost, setLastHost] = useState<string>(() => {
    return localStorage.getItem(LAST_HOST_STORAGE_KEY) ?? '';
  });

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const openConnection = useCallback(
    (host: string, reconnecting = false) => {
      clearReconnectTimer();

      setStatus(reconnecting ? 'reconnecting' : 'connecting');

      const socket = new WebSocket(`ws://${host}:${REMOTE_CONTROL_PORT}`);
      socketRef.current = socket;

      socket.onopen = () => {
        if (socketRef.current !== socket) return;

        localStorage.setItem(LAST_HOST_STORAGE_KEY, host);
        setLastHost(host);
        setStatus('connected');
      };

      socket.onmessage = (event) => {
        if (socketRef.current !== socket) return;

        try {
          const state = JSON.parse(event.data) as RemoteState;
          setRemoteState(state);
        } catch (error) {
          console.warn('[Remote] Invalid state received:', error);
        }
      };

      socket.onerror = () => {
        if (socketRef.current !== socket) return;

        // onclose handles reconnection.
      };

      socket.onclose = () => {
        if (socketRef.current !== socket) return;

        socketRef.current = null;

        if (manualDisconnectRef.current) {
          manualDisconnectRef.current = false;
          setRemoteState(null);
          setStatus('disconnected');
          return;
        }

        // Conservamos el último estado mientras intentamos reconectar.
        setStatus('reconnecting');

        reconnectTimerRef.current = window.setTimeout(() => {
          const currentHost = hostRef.current;
          if (!currentHost || manualDisconnectRef.current) return;

          openConnection(currentHost, true);
        }, RECONNECT_DELAY_MS);
      };
    },
    [clearReconnectTimer]
  );

  const connect = useCallback(
    (host: string) => {
      const normalizedHost = host.trim();
      if (!normalizedHost) return;

      manualDisconnectRef.current = false;
      hostRef.current = normalizedHost;

      clearReconnectTimer();
      socketRef.current?.close();

      setRemoteState(null);
      openConnection(normalizedHost);
    },
    [clearReconnectTimer, openConnection]
  );

  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true;
    clearReconnectTimer();

    const socket = socketRef.current;
    if (!socket) {
      manualDisconnectRef.current = false;

      setStatus('disconnected');
      setRemoteState(null);
      return;
    }

    setStatus('disconnecting');
    socket.close();
  }, [clearReconnectTimer]);

  const sendCommand = useCallback((command: RemoteCommand) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;

    socket.send(JSON.stringify(command));
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
      manualDisconnectRef.current = true;
      clearReconnectTimer();
      socketRef.current?.close();
    };
  }, [clearReconnectTimer]);

  return {
    status,
    remoteState,
    lastHost,
    connect,
    disconnect,
    sendCommand
  };
};
