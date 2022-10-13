// This variable imports the 'Review' model
const Review = require('./../models/reviewModel');

// This variable imports the 'APIFeatures' utility
const APIFeatures = require('./../utils/apiFeatures');

// This brings in the 'application error handling utility'
const AppError = require('./../utils/appError');

// This brings in the 'Handler Factory' function that handles the handler functions
const factory = require('./handlerFactory');

// This variable imports the 'catchAsync' "Error Handler" function
// const catchAsync = require('./../utils/catchAsync');


exports.setTourUserIds = (req, res, next) => {
  // This sets the 'tourId' if one is not set already for this review
  if(!req.body.tour) req.body.tour = req.params.tourId;

  // This sets the 'userId' if one is not set already for this review
  if(!req.body.user) req.body.user = req.user.id;

  next();
}

// This is the new handler function that 'GETS' ALL Reviews
exports.getAllReviews = factory.getAll(Review);

// This is the new handler function that 'GETS' ONE Review
exports.getReview = factory.getOne(Review);

// This is the new handler function that 'CTEATE' ONE Review
exports.createReview = factory.createOne(Review);

// This is the new handler function that 'UPDATES' ONE Review
exports.updateReview = factory.updateOne(Review);

// This is the new handler function that 'DELETES' ONE Review
exports.deleteReview = factory.deleteOne(Review);
