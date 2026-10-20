import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema } from 'zod';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const validated = schema.parse(request[target]);
    (request as unknown as Record<ValidateTarget, unknown>)[target] = validated;
  };
}
