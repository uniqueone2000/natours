// This variable brings in the 'express' npm package
const express = require('express');

// This variable brings in the 'Review Controller'
const bookingController = require('./../controllers/bookingController');

// This variable brings in the 'Auth Controller'
const authController = require('./../controllers/authController');

// This creates an 'Instance' of the 'Express Router'
const router = express.Router();

router.use(authController.protect);

// This route is used by the client to obtain a 'checkout' session
router
  .get('/checkout-session/:tourId',
    bookingController.getCheckoutSession
  );

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking)

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking)

module.exports = router;
