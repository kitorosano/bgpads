import { useCallback, useEffect, useRef, useState } from 'react';
import type { RemoteCommand, RemoteState } from '../types/remote';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export const useRemoteConnection = () => {
  const socketRef = useRef<WebSocket | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [remoteState, setRemoteState] = useState<RemoteState | null>(null);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;

    setStatus('disconnected');
    setRemoteState(null);
  }, []);

  const connect = useCallback((host: string) => {
    socketRef.current?.close();

    setStatus('connecting');
    setRemoteState(null);

    const socket = new WebSocket(`ws://${host}:17891`);

    socketRef.current = socket;

    socket.onopen = () => {
      if (socketRef.current !== socket) return;

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

      setStatus('disconnected');
    };

    socket.onclose = () => {
      if (socketRef.current !== socket) return;

      socketRef.current = null;
      setStatus('disconnected');
    };
  }, []);

  const sendCommand = useCallback((command: RemoteCommand) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;

    socket.send(JSON.stringify(command));
    return true;
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  return {
    status,
    remoteState,
    connect,
    disconnect,
    sendCommand
  };
};
