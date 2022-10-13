// This variable brings in the 'express' npm package
const express = require('express');

// This variable brings in the 'View Controller'
const viewController = require('../controllers/viewController');

// This variable brings in the 'Auth Controller'
const authController = require('../controllers/authController');

// This variable brings in the 'Auth Controller'
const bookingController = require('../controllers/bookingController');


// This creates an 'Instance' of the 'Express Router'
const router = express.Router();

// This is the 'overview' route
router
  .get('/',
    bookingController.createBookingCheckout,
    authController.isLoggedIn,
    viewController.getOverview
  );

// This is a specific 'tour' route
router
  .get('/tour/:slug',
    authController.isLoggedIn,
    viewController.getTour
  );

// This is the 'login' route
router
  .get('/login',
    authController.isLoggedIn,
    viewController.getLoginForm
  );

// This is the 'user credentials' route
router
  .get('/me',
    authController.protect,
    viewController.getAccount
  );

// This route is used to show booked tours
router
  .get('/my-tours',
    authController.protect,
    viewController.getMyTours   
);


// This route is for the user to update their profile
router
  .post('/submit-user-data',
    authController.protect,
    viewController.updateUserData
  );

module.exports = router;
