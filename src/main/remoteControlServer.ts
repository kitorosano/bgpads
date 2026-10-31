import { WebSocketServer } from 'ws';
import { REMOTE_CONTROL_PORT } from '../constants';
import type { RemoteCommand, RemoteState } from '../types';

interface Props {
  onCommand: (command: RemoteCommand) => void;
}

const isRemoteCommand = (value: unknown): value is RemoteCommand => {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }

  const command = value as Record<string, unknown>;

  switch (command.type) {
    case 'track.play':
      return typeof command.trackId === 'string';

    case 'track.stop':
    case 'metronome.toggle':
      return true;

    default:
      return false;
  }
};

export const createRemoteControlServer = ({ onCommand }: Props) => {
  const server = new WebSocketServer({
    port: REMOTE_CONTROL_PORT
  });
  let currentState: RemoteState | null = null;

  server.on('connection', (socket) => {
    console.log('[RemoteControl] Client connected');

    if (currentState) {
      socket.send(JSON.stringify(currentState));
    }

    socket.on('message', (data) => {
      try {
        const message: unknown = JSON.parse(data.toString());

        if (!isRemoteCommand(message)) {
          console.warn('[RemoteControl] Invalid command:', message);
          return;
        }

        onCommand(message);
      } catch (error) {
        console.warn('[RemoteControl] Invalid message:', error);
      }
    });

    socket.on('close', () => {
      console.log('[RemoteControl] Client disconnected');
    });
  });

  server.on('listening', () => {
    console.log(`[RemoteControl] Listening on port ${REMOTE_CONTROL_PORT}`);
  });

  server.on('error', (error) => {
    console.error('[RemoteControl] Server error:', error);
  });

  const updateState = (state: RemoteState) => {
    currentState = state;

    const message = JSON.stringify(state);

    server.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  };

  return {
    updateState,
    close: () => server.close()
  };
};
