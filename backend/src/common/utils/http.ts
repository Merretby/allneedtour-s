import { FastifyReply } from 'fastify';

export function sendSuccess<T>(reply: FastifyReply, data: T, statusCode = 200) {
  return reply.status(statusCode).send({
    success: true,
    data,
  });
}

export function sendCreated<T>(reply: FastifyReply, data: T) {
  return sendSuccess(reply, data, 201);
}

export function sendNoContent(reply: FastifyReply) {
  return reply.status(204).send();
}
