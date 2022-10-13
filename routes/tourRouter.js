// This variable brings in the 'express' npm package
const express = require('express');

// This variable brings in the 'Tour Controller'
const tourController= require('./../controllers/tourController');

// This brings in the 'Review' Router
const reviewRouter = require('./../routes/reviewRouter');

// This variable brings in the 'Auth Controller'
const authController = require('./../controllers/authController');

// This creates an 'Instance' of the 'Express Router'
const router = express.Router();

// These uses the 'reviewRouter' to get to the reviews
router.use('/:tourId/reviews', reviewRouter);

// This "Middleware" function checks for an "id" when looking up a specific tour
  /// *** USED FOR LOCAL TESTING *** ///

// router.param('id', tourController.checkID);

// This is an "Alias" route (for something like a 'user's popular or favorite' route)
router.route('/top-5-cheap')
  .get(tourController.aliasTopTours,tourController.getAllTours);

// This route is used to get some Tour stats
 router
  .route('/tour-stats')
  .get(tourController.getTourStats);

// This route is used to get the monthly stats for this app
router
  .route('/monthly-plan/:year')
  .get(authController.protect,
    authController.restrictTo(
      'admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan);

// ===== START OF 'GEOSPACIAL' QUERIES ===== //

// This route finds tours within a specific radius
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

// ===== END OF 'GEOSPACIAL' QUERIES ===== //

// ===== START OF 'GEOSPACIAL' AGGREGATION ===== //

// This route finds tours within a specific distance
router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

// ===== END OF 'GEOSPACIAL' AGGREGATION ===== //

// These routes pertain to ALL Tours
router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour);

// These routes pertain to a SPECIFIC Tour
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)
  .delete(authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour);

// These routes pertain to SPECIFIC reviews
// router
//   .route('/:tourId/reviews')
//   .post(authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
