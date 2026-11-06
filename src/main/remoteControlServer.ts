import { app } from 'electron';
import { createReadStream, existsSync, statSync } from 'fs';
import { createServer } from 'http';
import { extname, join, relative, resolve } from 'path';
import { WebSocketServer } from 'ws';
import {
  MAX_BPM,
  MAX_TRACK_VOLUME,
  MIN_BPM,
  MIN_TRACK_VOLUME,
  REMOTE_CONTROL_PORT
} from '../constants';
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
    case 'metronome.toggle':
      return true;

    case 'track.play':
      return (
        // Valid trackId
        typeof command.trackId === 'string' && command.trackId.length > 0
      );

    case 'track.stop':
      return true;

    case 'track.update': {
      if (
        typeof command.trackId !== 'string' ||
        typeof command.changes !== 'object' ||
        command.changes === null
      ) {
        return false;
      }

      const changes = command.changes as Record<string, unknown>;

      return (
        // Valid name
        typeof changes.name === 'string' &&
        !!changes.name &&
        // Valid Color
        typeof changes.color === 'string' &&
        /^#[0-9a-fA-F]{6}$/.test(changes.color) &&
        // Valid Volume
        typeof changes.volume === 'number' &&
        Number.isFinite(changes.volume) &&
        changes.volume >= MIN_TRACK_VOLUME &&
        changes.volume <= MAX_TRACK_VOLUME &&
        // Valid BPM
        typeof changes.bpm === 'number' &&
        Number.isInteger(changes.bpm) &&
        changes.bpm >= MIN_BPM &&
        changes.bpm <= MAX_BPM
      );
    }

    case 'track.reorder':
      return (
        // Valid sourceTrackId
        typeof command.sourceTrackId === 'string' &&
        command.sourceTrackId.length > 0 &&
        // Valid targetTrackId
        typeof command.targetTrackId === 'string' &&
        command.targetTrackId.length > 0 &&
        command.sourceTrackId !== command.targetTrackId
      );

    default:
      return false;
  }
};

const getRemoteDistPath = (): string => {
  if (app.isPackaged) return join(process.resourcesPath, 'remote');
  else return join(process.cwd(), 'remote', 'dist');
};
const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

export const createRemoteControlServer = ({ onCommand }: Props) => {
  const remoteDistPath = getRemoteDistPath();

  const httpServer = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const requestPath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);

    const rootPath = resolve(remoteDistPath);
    const filePath = resolve(rootPath, requestPath);
    const relativePath = relative(rootPath, filePath);

    if (relativePath.startsWith('..') || relativePath.includes(':')) {
      response.writeHead(403);
      response.end();
      return;
    }

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end();
      return;
    }

    const contentType =
      CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';

    response.writeHead(200, {
      'Content-Type': contentType
    });

    createReadStream(filePath).pipe(response);
  });

  const server = new WebSocketServer({
    server: httpServer
  });

  httpServer.listen(REMOTE_CONTROL_PORT);
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
    close: () => {
      server.close();
      httpServer.close();
    }
  };
};
