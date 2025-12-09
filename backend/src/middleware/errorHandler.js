export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  console.error(`[ERROR] ${status} - ${message}`);

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}
