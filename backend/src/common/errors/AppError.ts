export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code?: string): AppError {
    return new AppError(400, message, code);
  }

  static unauthorized(message = 'Unauthorized', code?: string): AppError {
    return new AppError(401, message, code);
  }

  static forbidden(message = 'Forbidden', code?: string): AppError {
    return new AppError(403, message, code);
  }

  static notFound(message = 'Resource not found', code?: string): AppError {
    return new AppError(404, message, code);
  }

  static conflict(message: string, code?: string): AppError {
    return new AppError(409, message, code);
  }

  static internal(message = 'Internal server error', code?: string): AppError {
    return new AppError(500, message, code);
  }
}
