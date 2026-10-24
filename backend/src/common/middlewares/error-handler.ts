import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/error-codes.js';
import { logger } from '../../config/logger.js';

export async function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  logger.error(error);

  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    reply.status(400).send({
      success: false,
      error: {
        message: 'Validation error',
        code: ErrorCodes.VALIDATION_ERROR,
        details: error.errors,
      },
    });
    return;
  }

  if ('statusCode' in error && error.statusCode) {
    const errorWithCode = error as FastifyError & { code?: string };
    reply.status(error.statusCode).send({
      success: false,
      error: {
        message: error.message,
        ...(errorWithCode.code ? { code: errorWithCode.code } : {}),
      },
    });
    return;
  }

  reply.status(500).send({
    success: false,
    error: {
      message: 'Internal server error',
      code: ErrorCodes.INTERNAL_ERROR,
    },
  });
}
