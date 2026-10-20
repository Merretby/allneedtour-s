import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { sendSuccess, sendCreated } from '../../common/utils/http.js';

export class AuthController {
  constructor(private service: AuthService) {}

  async register(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.service.register(request.body);
    sendCreated(reply, result);
  }

  async login(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.service.login(request.body);
    sendSuccess(reply, result);
  }
}
