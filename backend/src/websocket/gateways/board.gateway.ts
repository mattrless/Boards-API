import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";

type JwtPayload = {
  sub: number;
};

type SocketData = {
  userId?: number;
};

type WsSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

const AUTH_TOKEN_COOKIE_NAME = "token";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? "http://localhost:3001",
    credentials: true,
  },
})
export class BoardGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(BoardGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log("BoardGateway initialized");
  }

  private isValidId(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
  }

  private extractToken(client: WsSocket): string | null {
    const authorization = client.handshake.headers.authorization;
    if (authorization) {
      const [type, token] = authorization.split(" ");
      if (type === "Bearer" && token) return token;
    }

    const authToken = (client.handshake.auth as Record<string, unknown>)?.token;
    if (authToken && typeof authToken === "string") return authToken;

    return this.extractTokenFromCookie(client);
  }

  private extractTokenFromCookie(client: WsSocket): string | null {
    const rawCookieHeader = client.handshake.headers.cookie;
    if (!rawCookieHeader) {
      return null;
    }

    const cookiePairs = rawCookieHeader.split(";");
    for (const cookiePair of cookiePairs) {
      const [name, ...valueParts] = cookiePair.trim().split("=");
      if (name !== AUTH_TOKEN_COOKIE_NAME) continue;
      const rawValue = valueParts.join("=");
      if (!rawValue) return null;
      return decodeURIComponent(rawValue);
    }

    return null;
  }

  async handleConnection(client: WsSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Socket ${client.id} rejected: missing JWT token`);
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (!this.isValidId(payload?.sub)) {
        this.logger.warn(`Socket ${client.id} rejected: invalid token payload`);
        client.disconnect(true);
        return;
      }

      const user = await this.prismaService.user.findFirst({
        where: {
          id: payload.sub,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        this.logger.warn(`Socket ${client.id} rejected: user not found`);
        client.disconnect(true);
        return;
      }

      client.data.userId = user.id;
      await client.join(`user:${user.id}`);
      this.logger.log(
        `Client ${client.id} authenticated and joined user room user:${user.id}`,
      );
    } catch {
      this.logger.warn(`Socket ${client.id} rejected: JWT verification failed`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: WsSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("board:join")
  async handleJoin(
    @MessageBody() body: { boardId: number },
    @ConnectedSocket() client: WsSocket,
  ) {
    if (!this.isValidId(body?.boardId)) {
      return { ok: false, error: "boardId must be a positive integer" };
    }

    const userId = client.data.userId;
    if (!this.isValidId(userId)) {
      return { ok: false, error: "Socket is not authenticated" };
    }

    const board = await this.prismaService.board.findFirst({
      where: {
        id: body.boardId,
        deletedAt: null,
        userBoards: {
          some: {
            userId,
            user: {
              deletedAt: null,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!board) {
      return { ok: false, error: "Board not found or access denied" };
    }

    await client.join(`board:${body.boardId}`);
    return { ok: true, room: `board:${body.boardId}` };
  }

  @SubscribeMessage("board:leave")
  async handleLeave(
    @MessageBody() body: { boardId: number },
    @ConnectedSocket() client: WsSocket,
  ) {
    if (!this.isValidId(body?.boardId)) {
      return { ok: false, error: "boardId must be a positive integer" };
    }

    await client.leave(`board:${body.boardId}`);
    return { ok: true, room: `board:${body.boardId}` };
  }

  @SubscribeMessage("card:join")
  async handleCardJoin(
    @MessageBody() body: { cardId: number },
    @ConnectedSocket() client: WsSocket,
  ) {
    if (!this.isValidId(body?.cardId)) {
      return { ok: false, error: "cardId must be a positive integer" };
    }

    const userId = client.data.userId;
    if (!this.isValidId(userId)) {
      return { ok: false, error: "Socket is not authenticated" };
    }

    const card = await this.prismaService.card.findFirst({
      where: {
        id: body.cardId,
        list: {
          board: {
            userBoards: {
              some: {
                userId,
                user: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!card) {
      return { ok: false, error: "Card not found or access denied" };
    }

    await client.join(`card:${body.cardId}`);
    return { ok: true, room: `card:${body.cardId}` };
  }

  @SubscribeMessage("card:leave")
  async handleCardLeave(
    @MessageBody() body: { cardId: number },
    @ConnectedSocket() client: WsSocket,
  ) {
    if (!this.isValidId(body?.cardId)) {
      return { ok: false, error: "cardId must be a positive integer" };
    }

    await client.leave(`card:${body.cardId}`);
    return { ok: true, room: `card:${body.cardId}` };
  }

  @SubscribeMessage("user:join")
  handleUserJoin(@ConnectedSocket() client: WsSocket) {
    const userId = client.data.userId;
    if (!this.isValidId(userId)) {
      return { ok: false, error: "Socket is not authenticated" };
    }

    return { ok: true, room: `user:${userId}` };
  }

  @SubscribeMessage("user:leave")
  async handleUserLeave(
    @MessageBody() body: { userId?: number },
    @ConnectedSocket() client: WsSocket,
  ) {
    const userId = client.data.userId;
    if (!this.isValidId(userId)) {
      return { ok: false, error: "Socket is not authenticated" };
    }

    const requestedUserId = body?.userId;
    if (
      requestedUserId !== undefined &&
      this.isValidId(requestedUserId) &&
      requestedUserId !== userId
    ) {
      return { ok: false, error: "Cannot leave another user room" };
    }

    await client.leave(`user:${userId}`);
    return { ok: true, room: `user:${userId}` };
  }
}
