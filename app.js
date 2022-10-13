// ====== START OF NPM PACKAGES ===== //

// This brings in the 'path' Node core module
const path = require('path');

// This brings in the 'express' npm middleware package
const express = require('express');

// This brings in the '' npm middleware package
const morgan = require('morgan');

// This brings in the 'express-rate-limit' npm middleware package
const rateLimit = require('express-rate-limit');

// This brings in the 'express-csp' npm middleware package
const csp = require('express-csp');

// This brings in the 'helmet' npm middleware package
const helmet = require('helmet');

// This brings in the 'cors' npm middleware package
const cors = require('cors');

// This brings in the 'express-mongo-sanitize' npm middleware package
const mongoSanitize = require('express-mongo-sanitize');

// This brings in the 'xss-clean' npm middleware package
const xssClean = require('xss-clean');

// This brings in the 'hpp' npm middleware package
const hpp = require('hpp');

// This brings in the 'cookie-parser' npm middleware package
const cookieParser = require('cookie-parser');

// ====== END OF NPM PACKAGES ===== //


// ====== START OF APP CONTROLLERS AND UTILITIES ===== //

// This brings in the 'application error handling utility'
const AppError = require('./utils/appError');

// This brings in the 'global error handling controller'
const globalErrorHandler = require('./controllers/errorController');

// This brings in the 'TOUR route controller' for this application
const tourRouter = require('./routes/tourRouter');

// This brings in the 'USER route controller' for this application
const userRouter = require('./routes/userRouter');

// This brings in the 'REVIEWS route controller' for this application
const reviewRouter = require('./routes/reviewRouter');

// This brings in the 'BOOKING route controller' for this application
const bookingRouter = require('./routes/bookingRouter');

// This brings in the 'VIEWS route controller' for this application
const viewRouter = require('./routes/viewRouter');

// ====== END OF APP CONTROLLERS AND UTILITIES ===== //

// This starts this 'express' application
const app = express();

// This brings in the 'Pug' 'Template Engine'
app.set('view engine', 'pug');

// This sets the point for the Pug views within the file system
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE FUNCTIONS

// This middleware function allows us to serve  'static files'
app.use(express.static(path.join(__dirname, 'public')));

// This is used to set 'Security HTTP Headers'
app.use(helmet());
csp.extend(app, {
  policy: {
    directives: {
      'default-src': ['self'],
      'style-src': ['self', 'unsafe-inline', 'https:'],
      'font-src': ['self', 'https://fonts.gstatic.com'],
      'script-src': [
        'self',
        'unsafe-inline',
        'data',
        'blob',
        'https://js.stripe.com/v3/',
        'https://checkout.stripe.com',
        'https://api.stripe.com',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:8828',
        // 'ws://localhost:3000/',
      ],
      'worker-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://js.stripe.com/v3/',
        'https://api.stripe.com',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        // 'ws://localhost:*/',
      ],
      'frame-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://js.stripe.com/v3/',
        'https://checkout.stripe.com',
        'https://api.stripe.com',
        'https://js.stripe.com',
        'https://hooks.stripe.com',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        // 'ws://localhost:*/',
      ],
      'img-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://js.stripe.com/v3/',
        // 'https://api.stripe.com',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        // 'ws://localhost:*/',
      ],
      'connect-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        // 'wss://<HEROKU-SUBDOMAIN>.herokuapp.com:<PORT>/',
        'https://js.stripe.com/v3/',
        'https://checkout.stripe.com',
        'https://api.stripe.com',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        // 'ws://localhost:*/',
      ],
    },
  },
});

// This is used to eliminate the 'Cross-Origin' errors
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000'
  })
);

// These are for the "Environment Variables"
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  // This uses a third party middleware from NPM
  app.use(morgan('dev'));
}

// === START OF SECURITY AND Sanitization MIDDLEWARE === //

// This middleware is used to set a rate limit on incoming requests from a single IP Address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP Address!'
});

// This allows the app to use the rateLimit middleware
app.use('/api', limiter);

// This allows the app to read data in order to use json objects via BODY-PARSER
app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// This allows the app to read from 'cookies' via COOKIE-PARSER
app.use(cookieParser());

// This is used to perform 'Data Sanitization' against 'NoSQL query injection'
app.use(mongoSanitize());

// This is used to perform 'Data Sanitization' against 'XSS Scripting' attacks
app.use(xssClean());

// This is used to prevent 'HTTP Param Polution' attacks (which cleans up 'query strings' in the URL). We can 'whitelist' or allow the queries that we want.
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

// === END OF SECURITY AND Sanitization MIDDLEWARE === //

// This is a custom middleware function
/// *** USED FOR LOCAL TESTING *** ///
// app.use((req, res, next) => {
//   console.log('Hello from  our custom middleware');
//   next();
// });

// This is the 'morgan' middleware function (testing middleware)
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  // This is used for testing
  // console.log(req.cookies);

  next();
});

// ==== ROUTERS ==== //

    // THESE ARE 'CLIENT SIDE' ROUTES

// This is the 'view' route (frontend)
app.use('/', viewRouter);


    // THESE ARE 'API' ROUTES

// This is the 'tours' route
app.use('/api/v1/tours', tourRouter);

// This is the 'tours' route
app.use('/api/v1/users', userRouter);

// This is the 'tours' route
app.use('/api/v1/reviews', reviewRouter);

// This is the 'booking' route
app.use('/api/v1/bookings', bookingRouter);


// This route is used to catch routes that are not defined in this application
app.all('*', (req, res, next) => {
    // This is used for testing
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// This is the 'Global Error Handler'
app.use(globalErrorHandler);

module.exports = app;
