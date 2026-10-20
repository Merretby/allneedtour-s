import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema } from 'zod';
import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/error-codes.js';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const data = request[target];
      const validated = schema.parse(data);
      (request as any)[target] = validated;
    } catch (error) {
      throw error;
    }
  };
}
