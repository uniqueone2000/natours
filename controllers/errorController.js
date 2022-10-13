// This brings in the 'application error handling utility'
const AppError = require('./../utils/appError');

// This function covers 'Database ID' Errors
const handleCastErrorDB = err => {
  // This is the error message for this function
  const message = `Invalid ${err.path}: ${err.value}.`;

  return new AppError(message, 400);
};

///// ===== START OF MONGOOSE 'OPERATIONAL' ERROR HANDLING FUCTIONS ===== /////

// This function covers 'Database Duplicate Field' Errors

const handleDuplicateFieldsDB = err => {

  // This 'regular expression' looks up the value of the text within the 'errmsg' field
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  // This is used to test the regex
  console.log(value);

  // This is the error message for this function
  const message = `Duplicate field value: ${value}. Please use another value.`;

  return new AppError(message, 400);
};

// This function covers 'Database Validation' Errors
const handleValidationErrorDB = err => {
  // This is used to loop over the error message values in order to extract them for the following error message
  const errors = Object.values(err.errors).map(
    el => el.message
  );

  // This is the error message for this function
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

///// ===== END OF MONGOOSE 'OPERATIONAL' ERROR HANDLING FUCTIONS ===== /////

// This function is used to send JWT Errors FOR an ALTERED TOKEN
const handleJWTError = () => new AppError('Invalid Log in Credentials. Please log in again.', 401);

// This function is used to send JWT Errors FOR an EXPIRED JWT TOKEN
const handleJWTExpiredError = () => new AppError('Your session has Expired. Please log in again.', 401);

// This function is used to send 'Errors' in the 'Development' Environment
const sendErrorDev = (err, req, res) => {
  // This checks to see if the URL is from our API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  message = err.message;
  // This is used to check the error
  console.error('ERROR', err);

  // This will be the rendered page for errors in Development (so we can see the error)
  return res.status(err.statusCode).render('error', {
    title: 'Something went Wrong',
    msg: err.message
  });
};

// This function is used to send 'Errors' in the 'Production' Environment
const sendErrorProd = (err, req, res) => {
  // This checks to see if the URL is from our Website (production mode)
  if (req.originalUrl.startsWith('/api')) {

    // This checks if the error is in 'Development' or 'Production'

    // This is the 'Operational' (trusted) error message (the client sees this)
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // This is ALSO the "GENERIC ERROR" so the developer can see the error the client is seeing
    console.error('ERROR', err);

    // This is the 'Programming' (unknown) error message (the client sees this)
    return res.status(500).json({
      status: 'error',
        message: 'Something went very wrong'
    });
  }

  // This will be the rendered page for errors in Production (so our users won't see the dev style error)

  // This is the 'Operational' (trusted) error message (the client sees this)
  if (err.isOperational) {
      // This will be the rendered page for errors in Development (so our users won't see the dev style error)
    return res.status(err.statusCode).render('error', {
      title: 'Something went Wrong',
      msg: err.message
    });
  }

  // This is ALSO the "GENERIC ERROR" so the developer can see the error the client is seeing
  console.error('ERROR', err);

  // This is the 'Programming' (unknown) error message (the client sees this)
  return res.status(err.statusCode).render('error', {
    title: 'Something went Wrong',
      msg: 'Please try again later'
  });
};

// This "exports" this 'Controller' to be used elsewere in this application
module.exports = (err, req, res, next) => {

  // This is used for testing. It shows the "stack trace" of an error
  // console.log(err.stack);

  // This variable defines the 'error status' codes
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message;

  // This is used to determine whether we are in 'Development' or 'Production' mode
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
    // error.message = err.message;
  } else if (process.env.NODE_ENV === 'production') {

    ///// ===== START OF MONGOOSE 'OPERATIONAL' ERROR HANDLING CHECKS ===== /////

    // This variable is for the error object
    // let error = Object.assign(err);

    let error = { ...err };
    // error.message = err.message;
    // console.log(error)

    // This message is for handling 'INVALID ID' String Errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    // This message is for handling 'DUPLICATE DATABASE' Field Errors
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // This message is for handling 'MONGOOSE' Validation Errors
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    ///// ===== START OF JSON WEB TOKEN ERROR HANDLING CHECKS ===== /////

    // This error is in the case of an 'Altered' Token
    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    // This error is in the case of an 'Expired' Token
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    ///// ===== END OF JSON WEB TOKEN  ERROR HANDLING CHECKS ===== /////


    sendErrorProd(error, req, res);
  }
};
