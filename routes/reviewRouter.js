// This variable brings in the 'express' npm package
const express = require('express');

// This variable brings in the 'Review Controller'
const reviewController = require('./../controllers/reviewController');

// This variable brings in the 'Auth Controller'
const authController = require('./../controllers/authController');

// This creates an 'Instance' of the 'Express Router'
const router = express.Router({ mergeParams: true });

// This middleware function ONLY allows authenticated users access to the routes below
router.use(authController.protect);

// These routes pertain to ALL Reviews
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

// This is the new route handler for a SPECIFIC review
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('user', 'admin'),
    reviewController.updateReview)
  .delete(authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );


module.exports = router;
