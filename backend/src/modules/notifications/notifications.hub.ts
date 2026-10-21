import type { ServerResponse } from 'node:http';

interface StreamClient {
  userId: string;
  role: 'customer' | 'admin';
  response: ServerResponse;
  heartbeat: NodeJS.Timeout;
}

/**
 * In-memory server-sent-events hub.
 *
 * Keeps every authenticated notification stream open and lets the order
 * service push events to a specific user or to every connected admin.
 * A single backend instance owns the connections; if the API is ever scaled
 * horizontally, replace this with Supabase Realtime or Redis pub/sub.
 */
class NotificationHub {
  private clients = new Set<StreamClient>();

  add(userId: string, role: 'customer' | 'admin', response: ServerResponse): void {
    const heartbeat = setInterval(() => {
      if (!response.writableEnded) {
        response.write(': ping\n\n');
      }
    }, 25_000);

    const client: StreamClient = { userId, role, response, heartbeat };
    this.clients.add(client);

    const cleanup = () => {
      clearInterval(heartbeat);
      this.clients.delete(client);
    };

    response.on('close', cleanup);
    response.on('error', cleanup);

    response.write('retry: 3000\n\n');
  }

  sendToUser(userId: string, event: string, data: unknown): void {
    this.broadcast((client) => client.userId === userId, event, data);
  }

  sendToAdmins(event: string, data: unknown): void {
    this.broadcast((client) => client.role === 'admin', event, data);
  }

  get size(): number {
    return this.clients.size;
  }

  private broadcast(
    filter: (client: StreamClient) => boolean,
    event: string,
    data: unknown
  ): void {
    const frame = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const client of this.clients) {
      if (!filter(client) || client.response.writableEnded) continue;
      client.response.write(frame);
    }
  }
}

export const notificationHub = new NotificationHub();
