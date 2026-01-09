import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'game',
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitRoundStateChange(roundId: string, status: string, scheduledTime: Date) {
    this.server.emit('round_state_change', {
      roundId,
      status,
      scheduledTime,
      timestamp: new Date(),
    });
  }

  emitDrawNumbers(roundId: string, numbers: number[]) {
    this.server.emit('draw_numbers', {
      roundId,
      numbers,
      timestamp: new Date(),
    });
  }

  emitRoundSettled(roundId: string) {
    this.server.emit('round_settled', {
      roundId,
      timestamp: new Date(),
    });
  }
}
