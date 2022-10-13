class AppError extends Error {
  constructor(message, statusCode) {
    // super(message);
    super();

    this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // This handles 'OPERATIONAL ERRORS'
    this.isOperational = true;

    // This captures the 'stack trace' of the error
    Error.captureStackTrace(this, this.constructor);
  }
}

message = {
  message: 'Incorrect email or password',
  statusCode: 401,
  status: 'fail',
  isOperational: true
}

module.exports = AppError;
